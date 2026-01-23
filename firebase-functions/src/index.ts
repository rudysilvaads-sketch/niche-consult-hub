import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { processReminders, sendPushNotification, getUserNotificationSettings } from './sendReminders';

// Initialize Firebase Admin
admin.initializeApp();

/**
 * Scheduled function to send appointment reminders
 * Runs every 15 minutes
 */
export const sendAppointmentReminders = functions
  .runWith({
    timeoutSeconds: 120,
    memory: '256MB',
  })
  .pubsub.schedule('every 15 minutes')
  .timeZone('America/Sao_Paulo')
  .onRun(async (context) => {
    console.log('Starting appointment reminder check...');
    
    const results = {
      oneHour: [] as any[],
      twentyFourHours: [] as any[],
    };

    try {
      // Process 1-hour reminders
      console.log('Processing 1-hour reminders...');
      results.oneHour = await processReminders(1, '1h');
      
      // Process 24-hour reminders
      console.log('Processing 24-hour reminders...');
      results.twentyFourHours = await processReminders(24, '24h');

      const totalSuccess = 
        results.oneHour.filter(r => r.success).length +
        results.twentyFourHours.filter(r => r.success).length;
      
      const totalFailed = 
        results.oneHour.filter(r => !r.success).length +
        results.twentyFourHours.filter(r => !r.success).length;

      console.log(`Reminder job completed. Success: ${totalSuccess}, Failed: ${totalFailed}`);
      
      return {
        success: true,
        summary: {
          oneHourReminders: results.oneHour.length,
          twentyFourHourReminders: results.twentyFourHours.length,
          totalSuccess,
          totalFailed,
        },
      };
    } catch (error) {
      console.error('Error in sendAppointmentReminders:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  });

/**
 * HTTP endpoint to manually send a reminder
 * Useful for testing or immediate notifications
 */
export const sendReminderNotification = functions
  .runWith({
    timeoutSeconds: 30,
    memory: '128MB',
  })
  .https.onRequest(async (req, res) => {
    // CORS headers
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
      res.status(204).send('');
      return;
    }

    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method not allowed' });
      return;
    }

    // Verify authorization (simple API key check)
    const authHeader = req.headers.authorization;
    const expectedKey = functions.config().app?.api_key;
    
    if (expectedKey && authHeader !== `Bearer ${expectedKey}`) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { userId, title, body, data } = req.body;

    if (!userId || !title || !body) {
      res.status(400).json({ error: 'Missing required fields: userId, title, body' });
      return;
    }

    try {
      const settings = await getUserNotificationSettings(userId);
      
      if (!settings || !settings.enabled || settings.tokens.length === 0) {
        res.status(400).json({ error: 'User has no valid notification tokens' });
        return;
      }

      const result = await sendPushNotification(settings.tokens, title, body, data);
      
      res.status(200).json({
        success: result.successCount > 0,
        ...result,
      });
    } catch (error) {
      console.error('Error sending notification:', error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  });

/**
 * Firestore trigger: When a new appointment is created,
 * initialize reminder fields
 */
export const onAppointmentCreated = functions.firestore
  .document('appointments/{appointmentId}')
  .onCreate(async (snap, context) => {
    const appointment = snap.data();
    
    // Initialize reminder tracking fields
    await snap.ref.update({
      reminderSent1h: false,
      reminderSent24h: false,
    });

    console.log(`Initialized reminder fields for appointment ${context.params.appointmentId}`);
    return true;
  });

/**
 * Firestore trigger: When an appointment is cancelled,
 * we could send a cancellation notification
 */
export const onAppointmentCancelled = functions.firestore
  .document('appointments/{appointmentId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();

    // Check if status changed to cancelled
    if (before.status !== 'cancelled' && after.status === 'cancelled') {
      const settings = await getUserNotificationSettings(after.patientId);
      
      if (settings && settings.enabled && settings.tokens.length > 0) {
        await sendPushNotification(
          settings.tokens,
          'Consulta Cancelada',
          `Sua consulta de ${after.date} às ${after.time} foi cancelada.`,
          {
            type: 'appointment_cancelled',
            appointmentId: context.params.appointmentId,
            url: '/agenda',
          }
        );
      }
    }

    return true;
  });
