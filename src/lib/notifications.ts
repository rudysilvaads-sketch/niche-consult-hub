import { getMessaging, getToken, onMessage, Messaging } from 'firebase/messaging';
import { app, db, isFirebaseConfigured } from './firebase';
import { doc, setDoc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';

// Your Firebase Cloud Messaging VAPID key (get from Firebase Console > Project Settings > Cloud Messaging)
const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY || '';

let messaging: Messaging | null = null;

// Initialize messaging only in browser with service worker support
if (typeof window !== 'undefined' && 'serviceWorker' in navigator && isFirebaseConfigured && app) {
  try {
    messaging = getMessaging(app);
  } catch (error) {
    console.error('Failed to initialize Firebase Messaging:', error);
  }
}

export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  click_action?: string;
  data?: Record<string, string>;
}

export interface UserNotificationSettings {
  enabled: boolean;
  token?: string;
  appointmentReminders: boolean;
  reminderTiming: '1h' | '24h' | 'both';
  updatedAt: string;
}

/**
 * Request permission and get FCM token
 */
export async function requestNotificationPermission(): Promise<string | null> {
  if (!messaging) {
    console.warn('Firebase Messaging not initialized');
    return null;
  }

  try {
    const permission = await Notification.requestPermission();
    
    if (permission !== 'granted') {
      console.log('Notification permission denied');
      return null;
    }

    // Register service worker
    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
    
    // Get FCM token
    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: registration,
    });

    if (token) {
      console.log('FCM Token obtained');
      return token;
    } else {
      console.log('No registration token available');
      return null;
    }
  } catch (error) {
    console.error('Error getting notification permission:', error);
    return null;
  }
}

/**
 * Save user's FCM token to Firestore
 */
export async function saveUserToken(userId: string, token: string): Promise<void> {
  if (!db) return;

  try {
    const userNotificationsRef = doc(db, 'userNotifications', userId);
    const docSnap = await getDoc(userNotificationsRef);

    if (docSnap.exists()) {
      await updateDoc(userNotificationsRef, {
        tokens: arrayUnion(token),
        updatedAt: new Date().toISOString(),
      });
    } else {
      await setDoc(userNotificationsRef, {
        userId,
        tokens: [token],
        enabled: true,
        appointmentReminders: true,
        reminderTiming: 'both',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error('Error saving user token:', error);
  }
}

/**
 * Remove user's FCM token from Firestore
 */
export async function removeUserToken(userId: string, token: string): Promise<void> {
  if (!db) return;

  try {
    const userNotificationsRef = doc(db, 'userNotifications', userId);
    await updateDoc(userNotificationsRef, {
      tokens: arrayRemove(token),
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error removing user token:', error);
  }
}

/**
 * Update user notification settings
 */
export async function updateNotificationSettings(
  userId: string,
  settings: Partial<UserNotificationSettings>
): Promise<void> {
  if (!db) return;

  try {
    const userNotificationsRef = doc(db, 'userNotifications', userId);
    await updateDoc(userNotificationsRef, {
      ...settings,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error updating notification settings:', error);
  }
}

/**
 * Get user notification settings
 */
export async function getNotificationSettings(userId: string): Promise<UserNotificationSettings | null> {
  if (!db) return null;

  try {
    const userNotificationsRef = doc(db, 'userNotifications', userId);
    const docSnap = await getDoc(userNotificationsRef);
    
    if (docSnap.exists()) {
      return docSnap.data() as UserNotificationSettings;
    }
    return null;
  } catch (error) {
    console.error('Error getting notification settings:', error);
    return null;
  }
}

/**
 * Listen for foreground messages
 */
export function onForegroundMessage(callback: (payload: NotificationPayload) => void): () => void {
  if (!messaging) {
    return () => {};
  }

  const unsubscribe = onMessage(messaging, (payload) => {
    console.log('Foreground message received:', payload);
    
    if (payload.notification) {
      callback({
        title: payload.notification.title || 'Nova notificação',
        body: payload.notification.body || '',
        icon: payload.notification.icon,
        data: payload.data,
      });
    }
  });

  return unsubscribe;
}

/**
 * Check if notifications are supported
 */
export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 
         'Notification' in window && 
         'serviceWorker' in navigator;
}

/**
 * Get current notification permission status
 */
export function getNotificationPermissionStatus(): NotificationPermission | 'unsupported' {
  if (!isNotificationSupported()) {
    return 'unsupported';
  }
  return Notification.permission;
}
