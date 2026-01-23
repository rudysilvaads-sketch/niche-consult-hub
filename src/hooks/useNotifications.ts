import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  requestNotificationPermission,
  saveUserToken,
  removeUserToken,
  updateNotificationSettings,
  getNotificationSettings,
  onForegroundMessage,
  isNotificationSupported,
  getNotificationPermissionStatus,
  UserNotificationSettings,
  NotificationPayload,
} from '@/lib/notifications';
import { toast } from 'sonner';

export function useNotifications() {
  const { user } = useAuth();
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>('default');
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState<UserNotificationSettings | null>(null);
  const [currentToken, setCurrentToken] = useState<string | null>(null);

  // Check support and permission on mount
  useEffect(() => {
    const supported = isNotificationSupported();
    setIsSupported(supported);
    
    if (supported) {
      setPermission(getNotificationPermissionStatus());
    }
  }, []);

  // Load user settings
  useEffect(() => {
    if (user?.uid) {
      loadSettings();
    }
  }, [user?.uid]);

  // Listen for foreground messages
  useEffect(() => {
    const unsubscribe = onForegroundMessage((payload: NotificationPayload) => {
      // Show toast for foreground notifications
      toast(payload.title, {
        description: payload.body,
        action: payload.data?.url ? {
          label: 'Ver',
          onClick: () => window.location.href = payload.data!.url,
        } : undefined,
      });
    });

    return unsubscribe;
  }, []);

  const loadSettings = useCallback(async () => {
    if (!user?.uid) return;
    
    const userSettings = await getNotificationSettings(user.uid);
    setSettings(userSettings);
  }, [user?.uid]);

  const enableNotifications = useCallback(async () => {
    if (!user?.uid || !isSupported) return false;

    setIsLoading(true);
    try {
      const token = await requestNotificationPermission();
      
      if (token) {
        await saveUserToken(user.uid, token);
        setCurrentToken(token);
        setPermission('granted');
        await loadSettings();
        toast.success('Notificações ativadas com sucesso!');
        return true;
      } else {
        toast.error('Não foi possível ativar as notificações. Verifique as permissões do navegador.');
        return false;
      }
    } catch (error) {
      console.error('Error enabling notifications:', error);
      toast.error('Erro ao ativar notificações');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user?.uid, isSupported, loadSettings]);

  const disableNotifications = useCallback(async () => {
    if (!user?.uid || !currentToken) return;

    setIsLoading(true);
    try {
      await removeUserToken(user.uid, currentToken);
      await updateNotificationSettings(user.uid, { enabled: false });
      setCurrentToken(null);
      await loadSettings();
      toast.success('Notificações desativadas');
    } catch (error) {
      console.error('Error disabling notifications:', error);
      toast.error('Erro ao desativar notificações');
    } finally {
      setIsLoading(false);
    }
  }, [user?.uid, currentToken, loadSettings]);

  const updateSettings = useCallback(async (newSettings: Partial<UserNotificationSettings>) => {
    if (!user?.uid) return;

    setIsLoading(true);
    try {
      await updateNotificationSettings(user.uid, newSettings);
      await loadSettings();
      toast.success('Configurações atualizadas');
    } catch (error) {
      console.error('Error updating settings:', error);
      toast.error('Erro ao atualizar configurações');
    } finally {
      setIsLoading(false);
    }
  }, [user?.uid, loadSettings]);

  return {
    isSupported,
    permission,
    isLoading,
    settings,
    isEnabled: permission === 'granted' && settings?.enabled,
    enableNotifications,
    disableNotifications,
    updateSettings,
  };
}
