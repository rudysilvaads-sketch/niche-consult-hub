import { useState, useEffect } from 'react';
import { Cookie, X, Settings, ChevronDown, ChevronUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

const COOKIE_CONSENT_KEY = 'cookie_consent';
const COOKIE_PREFERENCES_KEY = 'cookie_preferences';

interface CookiePreferences {
  essential: boolean; // Always true
  preferences: boolean;
  performance: boolean;
  marketing: boolean;
}

const defaultPreferences: CookiePreferences = {
  essential: true,
  preferences: true,
  performance: true,
  marketing: false,
};

export function CookieConsentBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>(defaultPreferences);

  useEffect(() => {
    // Check if user has already consented
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      // Small delay to avoid flash on page load
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    } else {
      // Load saved preferences
      const saved = localStorage.getItem(COOKIE_PREFERENCES_KEY);
      if (saved) {
        setPreferences(JSON.parse(saved));
      }
    }
  }, []);

  const saveConsent = (prefs: CookiePreferences) => {
    localStorage.setItem(COOKIE_CONSENT_KEY, new Date().toISOString());
    localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(prefs));
    setIsVisible(false);
  };

  const handleAcceptAll = () => {
    const allAccepted: CookiePreferences = {
      essential: true,
      preferences: true,
      performance: true,
      marketing: true,
    };
    setPreferences(allAccepted);
    saveConsent(allAccepted);
  };

  const handleAcceptSelected = () => {
    saveConsent(preferences);
  };

  const handleRejectNonEssential = () => {
    const essentialOnly: CookiePreferences = {
      essential: true,
      preferences: false,
      performance: false,
      marketing: false,
    };
    setPreferences(essentialOnly);
    saveConsent(essentialOnly);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-slide-up">
      <div className="container mx-auto max-w-4xl">
        <div className="bg-card border border-border rounded-xl shadow-2xl overflow-hidden">
          {/* Main Banner */}
          <div className="p-4 sm:p-6">
            <div className="flex items-start gap-4">
              <div className="hidden sm:flex h-12 w-12 bg-primary/10 rounded-full items-center justify-center flex-shrink-0">
                <Cookie className="h-6 w-6 text-primary" />
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                  <Cookie className="h-5 w-5 sm:hidden text-primary" />
                  Utilizamos Cookies
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Usamos cookies para melhorar sua experiência, analisar o tráfego e personalizar conteúdo. 
                  Você pode gerenciar suas preferências ou aceitar todos os cookies.{' '}
                  <Link to="/cookies" className="text-primary hover:underline">
                    Saiba mais
                  </Link>
                </p>

                {/* Quick Actions */}
                <div className="flex flex-wrap gap-2">
                  <Button 
                    onClick={handleAcceptAll}
                    className="btn-gradient"
                  >
                    Aceitar Todos
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={handleRejectNonEssential}
                  >
                    Apenas Essenciais
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => setShowDetails(!showDetails)}
                    className="gap-2"
                  >
                    <Settings className="h-4 w-4" />
                    Personalizar
                    {showDetails ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <button
                onClick={handleRejectNonEssential}
                className="text-muted-foreground hover:text-foreground p-1"
                aria-label="Fechar"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Detailed Preferences */}
          {showDetails && (
            <div className="border-t border-border bg-muted/30 p-4 sm:p-6 space-y-4">
              <h4 className="font-medium text-sm text-foreground">Gerenciar Preferências</h4>
              
              <div className="space-y-4">
                {/* Essential */}
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">Cookies Essenciais</Label>
                    <p className="text-xs text-muted-foreground">
                      Necessários para o funcionamento do site
                    </p>
                  </div>
                  <Switch checked disabled />
                </div>

                {/* Preferences */}
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">Cookies de Preferências</Label>
                    <p className="text-xs text-muted-foreground">
                      Lembram suas escolhas (tema, idioma)
                    </p>
                  </div>
                  <Switch
                    checked={preferences.preferences}
                    onCheckedChange={(checked) =>
                      setPreferences({ ...preferences, preferences: checked })
                    }
                  />
                </div>

                {/* Performance */}
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">Cookies de Desempenho</Label>
                    <p className="text-xs text-muted-foreground">
                      Ajudam a melhorar o site
                    </p>
                  </div>
                  <Switch
                    checked={preferences.performance}
                    onCheckedChange={(checked) =>
                      setPreferences({ ...preferences, performance: checked })
                    }
                  />
                </div>

                {/* Marketing */}
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">Cookies de Marketing</Label>
                    <p className="text-xs text-muted-foreground">
                      Para anúncios personalizados (não utilizamos)
                    </p>
                  </div>
                  <Switch
                    checked={preferences.marketing}
                    onCheckedChange={(checked) =>
                      setPreferences({ ...preferences, marketing: checked })
                    }
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button onClick={handleAcceptSelected} className="btn-gradient">
                  Salvar Preferências
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Hook to get cookie preferences
export function useCookiePreferences(): CookiePreferences {
  const saved = localStorage.getItem(COOKIE_PREFERENCES_KEY);
  if (saved) {
    return JSON.parse(saved);
  }
  return defaultPreferences;
}

// Function to check if a specific cookie type is allowed
export function isCookieAllowed(type: keyof CookiePreferences): boolean {
  const prefs = useCookiePreferences();
  return prefs[type];
}
