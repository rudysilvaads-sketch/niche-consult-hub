import { useState } from 'react';
import { Bell, BellOff, Clock, Loader2, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useNotifications } from '@/hooks/useNotifications';

export function NotificationSettings() {
  const {
    isSupported,
    permission,
    isLoading,
    settings,
    isEnabled,
    enableNotifications,
    disableNotifications,
    updateSettings,
  } = useNotifications();

  const [reminderTiming, setReminderTiming] = useState(settings?.reminderTiming || 'both');

  const handleToggleNotifications = async () => {
    if (isEnabled) {
      await disableNotifications();
    } else {
      await enableNotifications();
    }
  };

  const handleReminderTimingChange = async (value: '1h' | '24h' | 'both') => {
    setReminderTiming(value);
    await updateSettings({ reminderTiming: value });
  };

  if (!isSupported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notificações
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Seu navegador não suporta notificações push. Tente usar o Chrome, Firefox ou Edge.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (permission === 'denied') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellOff className="h-5 w-5" />
            Notificações Bloqueadas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              As notificações foram bloqueadas. Para ativá-las, clique no ícone de cadeado na barra de endereços 
              do navegador e permita notificações para este site.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notificações Push
        </CardTitle>
        <CardDescription>
          Receba lembretes de consultas diretamente no seu dispositivo
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main Toggle */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="notifications-toggle" className="text-base">
              Ativar Notificações
            </Label>
            <p className="text-sm text-muted-foreground">
              Receba alertas mesmo quando o app estiver fechado
            </p>
          </div>
          <Button
            variant={isEnabled ? "default" : "outline"}
            size="sm"
            onClick={handleToggleNotifications}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isEnabled ? (
              <>
                <Bell className="h-4 w-4 mr-2" />
                Ativado
              </>
            ) : (
              <>
                <BellOff className="h-4 w-4 mr-2" />
                Desativado
              </>
            )}
          </Button>
        </div>

        {isEnabled && (
          <>
            {/* Appointment Reminders */}
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="space-y-0.5">
                <Label className="text-base">Lembretes de Consultas</Label>
                <p className="text-sm text-muted-foreground">
                  Notificações antes das consultas agendadas
                </p>
              </div>
              <Switch
                checked={settings?.appointmentReminders ?? true}
                onCheckedChange={(checked) => updateSettings({ appointmentReminders: checked })}
                disabled={isLoading}
              />
            </div>

            {/* Reminder Timing */}
            {settings?.appointmentReminders && (
              <div className="space-y-3 pt-4 border-t">
                <Label className="text-base flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Quando Lembrar
                </Label>
                <RadioGroup
                  value={reminderTiming}
                  onValueChange={(value) => handleReminderTimingChange(value as '1h' | '24h' | 'both')}
                  className="space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="1h" id="timing-1h" />
                    <Label htmlFor="timing-1h" className="font-normal cursor-pointer">
                      1 hora antes
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="24h" id="timing-24h" />
                    <Label htmlFor="timing-24h" className="font-normal cursor-pointer">
                      1 dia antes
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="both" id="timing-both" />
                    <Label htmlFor="timing-both" className="font-normal cursor-pointer">
                      Ambos (1 dia e 1 hora antes)
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            )}
          </>
        )}

        {/* Info */}
        <div className="pt-4 border-t">
          <p className="text-xs text-muted-foreground">
            💡 Dica: Para melhor experiência, instale o app na tela inicial do seu dispositivo 
            acessando <a href="/instalar" className="text-primary hover:underline">/instalar</a>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
