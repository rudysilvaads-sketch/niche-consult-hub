import { useState, useEffect } from 'react';
import { Download, Smartphone, Share, CheckCircle, ArrowRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Branding } from '@/components/branding/Branding';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function InstalarApp() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsStandalone(true);
      setIsInstalled(true);
    }

    // Check if iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Listen for successful install
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  const features = [
    'Acesso rápido direto da tela inicial',
    'Funciona offline após carregamento',
    'Notificações de lembretes',
    'Experiência fluida como app nativo',
    'Sem ocupar espaço da loja de apps',
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Branding variant="full" size="md" />
          <Button variant="ghost" size="icon" onClick={() => window.history.back()}>
            <X className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 max-w-lg">
        {isInstalled ? (
          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto w-16 h-16 bg-success/20 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8 text-success" />
              </div>
              <CardTitle className="text-2xl">App Instalado!</CardTitle>
              <CardDescription>
                O Espaço Terapêutico já está na sua tela inicial.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => window.location.href = '/'} className="btn-gradient">
                Ir para o App
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Hero Section */}
            <div className="text-center mb-8">
              <div className="mx-auto w-20 h-20 bg-primary/20 rounded-2xl flex items-center justify-center mb-6">
                <Smartphone className="h-10 w-10 text-primary" />
              </div>
              <h1 className="text-3xl font-bold mb-3">
                Instale o App
              </h1>
              <p className="text-muted-foreground">
                Tenha o Espaço Terapêutico sempre à mão, direto na tela inicial do seu celular.
              </p>
            </div>

            {/* Features */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">Benefícios</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-success flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Install Instructions */}
            {isIOS ? (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Share className="h-5 w-5" />
                    Como instalar no iPhone/iPad
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ol className="space-y-4 text-sm">
                    <li className="flex gap-3">
                      <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold">1</span>
                      <span>Toque no botão <strong>Compartilhar</strong> (ícone de quadrado com seta para cima) no Safari</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold">2</span>
                      <span>Role para baixo e toque em <strong>"Adicionar à Tela de Início"</strong></span>
                    </li>
                    <li className="flex gap-3">
                      <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold">3</span>
                      <span>Toque em <strong>"Adicionar"</strong> no canto superior direito</span>
                    </li>
                  </ol>
                </CardContent>
              </Card>
            ) : deferredPrompt ? (
              <Button onClick={handleInstall} className="w-full btn-gradient h-14 text-lg">
                <Download className="mr-2 h-5 w-5" />
                Instalar Agora
              </Button>
            ) : (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Download className="h-5 w-5" />
                    Como instalar no Android
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ol className="space-y-4 text-sm">
                    <li className="flex gap-3">
                      <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold">1</span>
                      <span>Toque no menu do navegador (3 pontinhos no canto)</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold">2</span>
                      <span>Toque em <strong>"Instalar app"</strong> ou <strong>"Adicionar à tela inicial"</strong></span>
                    </li>
                    <li className="flex gap-3">
                      <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold">3</span>
                      <span>Confirme a instalação</span>
                    </li>
                  </ol>
                </CardContent>
              </Card>
            )}

            {/* Back button */}
            <Button 
              variant="outline" 
              className="w-full mt-4"
              onClick={() => window.location.href = '/'}
            >
              Voltar para o App
            </Button>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t py-4">
        <p className="text-center text-xs text-muted-foreground">
          Aplicativo Web Progressivo (PWA) • Funciona em todos os dispositivos
        </p>
      </footer>
    </div>
  );
}
