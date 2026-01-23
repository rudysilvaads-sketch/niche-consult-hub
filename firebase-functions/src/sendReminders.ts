import * as admin from 'firebase-admin';
import { Appointment, UserNotificationSettings, ReminderResult } from './types';

const db = admin.firestore();
const messaging = admin.messaging();

/**
 * Get appointments that need reminders
 */
export async function getUpcomingAppointments(
  hoursAhead: number,
  reminderField: 'reminderSent1h' | 'reminderSent24h'
): Promise<Appointment[]> {
  const now = new Date();
  const targetTime = new Date(now.getTime() + hoursAhead * 60 * 60 * 1000);
  
  // Calculate date and time range
  const targetDate = targetTime.toISOString().split('T')[0];
  const targetHour = targetTime.getHours();
  const targetMinute = targetTime.getMinutes();
  
  // Format time for comparison (e.g., "14:00")
  const targetTimeStr = `${String(targetHour).padStart(2, '0')}:${String(targetMinute).padStart(2, '0')}`;
  
  // Time window: 15 minutes before and after target
  const minMinute = targetMinute - 7;
  const maxMinute = targetMinute + 7;
  
  const minTime = `${String(targetHour).padStart(2, '0')}:${String(Math.max(0, minMinute)).padStart(2, '0')}`;
  const maxTime = `${String(targetHour).padStart(2, '0')}:${String(Math.min(59, maxMinute)).padStart(2, '0')}`;

  console.log(`Checking appointments for ${targetDate} between ${minTime} and ${maxTime}`);

  try {
    const snapshot = await db.collection('appointments')
      .where('date', '==', targetDate)
      .where('status', 'in', ['scheduled', 'confirmed'])
      .where(reminderField, '==', false)
      .get();

    const appointments: Appointment[] = [];
    
    snapshot.forEach((doc) => {
      const data = doc.data() as Appointment;
      // Filter by time range
      if (data.time >= minTime && data.time <= maxTime) {
        appointments.push({ ...data, id: doc.id });
      }
    });

    console.log(`Found ${appointments.length} appointments needing ${reminderField} reminder`);
    return appointments;
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return [];
  }
}

/**
 * Get user notification settings
 */
export async function getUserNotificationSettings(
  userId: string
): Promise<UserNotificationSettings | null> {
  try {
    const doc = await db.collection('userNotifications').doc(userId).get();
    if (doc.exists) {
      return doc.data() as UserNotificationSettings;
    }
    return null;
  } catch (error) {
    console.error('Error fetching user notification settings:', error);
    return null;
  }
}

/**
 * Send push notification to user
 */
export async function sendPushNotification(
  tokens: string[],
  title: string,
  body: string,
  data?: Record<string, string>
): Promise<{ successCount: number; failureCount: number; failedTokens: string[] }> {
  if (tokens.length === 0) {
    return { successCount: 0, failureCount: 0, failedTokens: [] };
  }

  const message: admin.messaging.MulticastMessage = {
    tokens,
    notification: {
      title,
      body,
    },
    webpush: {
      notification: {
        icon: '/pwa-192x192.png',
        badge: '/pwa-192x192.png',
        requireInteraction: true,
        vibrate: [200, 100, 200],
      },
      fcmOptions: {
        link: data?.url || '/',
      },
    },
    data: data || {},
  };

  try {
    const response = await messaging.sendEachForMulticast(message);
    
    const failedTokens: string[] = [];
    response.responses.forEach((resp, idx) => {
      if (!resp.success) {
        failedTokens.push(tokens[idx]);
        console.error(`Failed to send to token ${tokens[idx]}:`, resp.error);
      }
    });

    console.log(`Sent ${response.successCount}/${tokens.length} notifications`);
    
    return {
      successCount: response.successCount,
      failureCount: response.failureCount,
      failedTokens,
    };
  } catch (error) {
    console.error('Error sending push notification:', error);
    return { successCount: 0, failureCount: tokens.length, failedTokens: tokens };
  }
}

/**
 * Mark appointment reminder as sent
 */
export async function markReminderSent(
  appointmentId: string,
  reminderField: 'reminderSent1h' | 'reminderSent24h'
): Promise<boolean> {
  try {
    await db.collection('appointments').doc(appointmentId).update({
      [reminderField]: true,
      [`${reminderField}At`]: admin.firestore.FieldValue.serverTimestamp(),
    });
    return true;
  } catch (error) {
    console.error(`Error marking ${reminderField} as sent:`, error);
    return false;
  }
}

/**
 * Remove invalid FCM tokens from user
 */
export async function removeInvalidTokens(
  userId: string,
  invalidTokens: string[]
): Promise<void> {
  if (invalidTokens.length === 0) return;

  try {
    await db.collection('userNotifications').doc(userId).update({
      tokens: admin.firestore.FieldValue.arrayRemove(...invalidTokens),
    });
    console.log(`Removed ${invalidTokens.length} invalid tokens from user ${userId}`);
  } catch (error) {
    console.error('Error removing invalid tokens:', error);
  }
}

/**
 * Process reminders for a specific time window
 */
export async function processReminders(
  hoursAhead: number,
  reminderType: '1h' | '24h'
): Promise<ReminderResult[]> {
  const reminderField = reminderType === '1h' ? 'reminderSent1h' : 'reminderSent24h';
  const appointments = await getUpcomingAppointments(hoursAhead, reminderField);
  
  const results: ReminderResult[] = [];

  for (const appointment of appointments) {
    try {
      // Get patient notification settings
      const settings = await getUserNotificationSettings(appointment.patientId);
      
      if (!settings || !settings.enabled || !settings.appointmentReminders) {
        console.log(`Notifications disabled for patient ${appointment.patientId}`);
        results.push({
          success: false,
          appointmentId: appointment.id,
          patientId: appointment.patientId,
          type: reminderType,
          error: 'Notifications disabled',
        });
        continue;
      }

      // Check if this reminder type should be sent
      if (settings.reminderTiming !== 'both' && settings.reminderTiming !== reminderType) {
        console.log(`Reminder type ${reminderType} not enabled for patient ${appointment.patientId}`);
        await markReminderSent(appointment.id, reminderField);
        continue;
      }

      if (settings.tokens.length === 0) {
        console.log(`No tokens for patient ${appointment.patientId}`);
        results.push({
          success: false,
          appointmentId: appointment.id,
          patientId: appointment.patientId,
          type: reminderType,
          error: 'No FCM tokens',
        });
        continue;
      }

      // Build notification message
      const timeLabel = reminderType === '1h' ? 'em 1 hora' : 'amanhã';
      const title = `Lembrete: Consulta ${timeLabel}`;
      const body = `Sua consulta está agendada para ${appointment.date} às ${appointment.time}. ${
        appointment.type === 'online' ? 'Prepare-se para a sessão online.' : ''
      }`;

      // Send notification
      const { successCount, failedTokens } = await sendPushNotification(
        settings.tokens,
        title,
        body,
        {
          type: 'appointment_reminder',
          appointmentId: appointment.id,
          url: appointment.type === 'online' ? `/sala/${appointment.id}` : '/agenda',
        }
      );

      // Remove invalid tokens
      if (failedTokens.length > 0) {
        await removeInvalidTokens(appointment.patientId, failedTokens);
      }

      // Mark reminder as sent
      if (successCount > 0) {
        await markReminderSent(appointment.id, reminderField);
      }

      results.push({
        success: successCount > 0,
        appointmentId: appointment.id,
        patientId: appointment.patientId,
        type: reminderType,
        error: successCount === 0 ? 'All notifications failed' : undefined,
      });
    } catch (error) {
      console.error(`Error processing reminder for appointment ${appointment.id}:`, error);
      results.push({
        success: false,
        appointmentId: appointment.id,
        patientId: appointment.patientId,
        type: reminderType,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  return results;
}

/**
 * Format date for display in Portuguese
 */
export function formatDatePtBr(dateStr: string): string {
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`;
}
