import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, Loader2, ArrowLeft, CheckCircle2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().trim().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
});

const signupSchema = z.object({
  name: z.string().trim().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  email: z.string().trim().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword'],
});

const resetPasswordSchema = z.object({
  email: z.string().trim().email('Email inválido'),
});

const Auth = () => {
  const navigate = useNavigate();
  const { signIn, signUp, resetPassword, error: authError, clearError } = useAuth();
  
  const [activeTab, setActiveTab] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setErrors({});
    
    const result = loginSchema.safeParse({ email: loginEmail, password: loginPassword });
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach(err => {
        if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }
    
    setIsLoading(true);
    try {
      await signIn(loginEmail, loginPassword);
      navigate('/');
    } catch {
      // Error is handled by AuthContext
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setErrors({});
    
    const result = signupSchema.safeParse({
      name: signupName,
      email: signupEmail,
      password: signupPassword,
      confirmPassword: signupConfirmPassword,
    });
    
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach(err => {
        if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }
    
    setIsLoading(true);
    try {
      await signUp(signupEmail, signupPassword, signupName);
      navigate('/');
    } catch {
      // Error is handled by AuthContext
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setErrors({});
    
    const result = resetPasswordSchema.safeParse({ email: resetEmail });
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach(err => {
        if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }
    
    setIsLoading(true);
    try {
      await resetPassword(resetEmail);
      setResetEmailSent(true);
    } catch {
      // Error is handled by AuthContext
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    setShowResetPassword(false);
    setResetEmailSent(false);
    setResetEmail('');
    clearError();
    setErrors({});
  };

  // Reset Password View
  if (showResetPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="h-12 w-12 rounded-xl bg-accent flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-foreground text-lg">Espaço</p>
              <p className="text-xs text-muted-foreground -mt-0.5">Terapêutico</p>
            </div>
          </div>

          <div className="glass-card p-8">
            <div className="text-center mb-6">
              <h1 className="text-xl font-bold text-foreground mb-1">Recuperar Senha</h1>
              <p className="text-sm text-muted-foreground">
                {resetEmailSent 
                  ? 'Verifique sua caixa de entrada' 
                  : 'Digite seu email para receber o link'
                }
              </p>
            </div>

            {resetEmailSent ? (
              <div className="space-y-6">
                <div className="flex flex-col items-center gap-4 py-6">
                  <div className="w-14 h-14 rounded-2xl bg-success/10 flex items-center justify-center">
                    <CheckCircle2 className="h-7 w-7 text-success" />
                  </div>
                  <p className="text-sm text-muted-foreground text-center">
                    Enviamos um email para <strong className="text-foreground">{resetEmail}</strong>
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={handleBackToLogin}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar para o login
                </Button>
              </div>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <Label htmlFor="reset-email" className="text-sm font-medium">Email</Label>
                  <div className="relative mt-1.5">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="reset-email"
                      type="email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      placeholder="seu@email.com"
                      className={cn(
                        'pl-10 h-11 input-styled',
                        errors.email && 'border-destructive'
                      )}
                      disabled={isLoading}
                    />
                  </div>
                  {errors.email && <p className="text-xs text-destructive mt-1.5">{errors.email}</p>}
                </div>
                
                {authError && (
                  <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                    {authError}
                  </div>
                )}
                
                <Button type="submit" className="w-full h-11 btn-gradient" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    'Enviar link'
                  )}
                </Button>
                
                <Button 
                  type="button"
                  variant="ghost" 
                  className="w-full text-muted-foreground hover:text-foreground" 
                  onClick={handleBackToLogin}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="h-12 w-12 rounded-xl bg-accent flex items-center justify-center">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="font-semibold text-foreground text-lg">Espaço</p>
            <p className="text-xs text-muted-foreground -mt-0.5">Terapêutico</p>
          </div>
        </div>

        <div className="glass-card p-8">
          <div className="text-center mb-6">
            <h1 className="text-xl font-bold text-foreground mb-1">Bem-vindo</h1>
            <p className="text-sm text-muted-foreground">
              Faça login ou crie sua conta
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); clearError(); setErrors({}); }}>
            <TabsList className="grid w-full grid-cols-2 mb-6 bg-secondary p-1">
              <TabsTrigger value="login" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
                Entrar
              </TabsTrigger>
              <TabsTrigger value="signup" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
                Cadastrar
              </TabsTrigger>
            </TabsList>
            
            {/* Login Tab */}
            <TabsContent value="login" className="mt-0">
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <Label htmlFor="login-email" className="text-sm font-medium">Email</Label>
                  <div className="relative mt-1.5">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="login-email"
                      type="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="seu@email.com"
                      className={cn(
                        'pl-10 h-11 input-styled',
                        errors.email && 'border-destructive'
                      )}
                      disabled={isLoading}
                    />
                  </div>
                  {errors.email && <p className="text-xs text-destructive mt-1.5">{errors.email}</p>}
                </div>
                
                <div>
                  <Label htmlFor="login-password" className="text-sm font-medium">Senha</Label>
                  <div className="relative mt-1.5">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="login-password"
                      type={showPassword ? 'text' : 'password'}
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className={cn(
                        'pl-10 pr-10 h-11 input-styled',
                        errors.password && 'border-destructive'
                      )}
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-xs text-destructive mt-1.5">{errors.password}</p>}
                </div>
                
                {authError && (
                  <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                    {authError}
                  </div>
                )}
                
                <Button type="submit" className="w-full h-11 btn-gradient" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Entrando...
                    </>
                  ) : (
                    'Entrar'
                  )}
                </Button>
                
                <button
                  type="button"
                  onClick={() => { setShowResetPassword(true); clearError(); setErrors({}); }}
                  className="w-full text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Esqueceu sua senha?
                </button>
              </form>
            </TabsContent>
            
            {/* Signup Tab */}
            <TabsContent value="signup" className="mt-0">
              <form onSubmit={handleSignup} className="space-y-4">
                <div>
                  <Label htmlFor="signup-name" className="text-sm font-medium">Nome Completo</Label>
                  <div className="relative mt-1.5">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signup-name"
                      type="text"
                      value={signupName}
                      onChange={(e) => setSignupName(e.target.value)}
                      placeholder="Dr. João Silva"
                      className={cn(
                        'pl-10 h-11 input-styled',
                        errors.name && 'border-destructive'
                      )}
                      disabled={isLoading}
                    />
                  </div>
                  {errors.name && <p className="text-xs text-destructive mt-1.5">{errors.name}</p>}
                </div>
                
                <div>
                  <Label htmlFor="signup-email" className="text-sm font-medium">Email</Label>
                  <div className="relative mt-1.5">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signup-email"
                      type="email"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      placeholder="seu@email.com"
                      className={cn(
                        'pl-10 h-11 input-styled',
                        errors.email && 'border-destructive'
                      )}
                      disabled={isLoading}
                    />
                  </div>
                  {errors.email && <p className="text-xs text-destructive mt-1.5">{errors.email}</p>}
                </div>
                
                <div>
                  <Label htmlFor="signup-password" className="text-sm font-medium">Senha</Label>
                  <div className="relative mt-1.5">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signup-password"
                      type={showPassword ? 'text' : 'password'}
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      placeholder="••••••••"
                      className={cn(
                        'pl-10 pr-10 h-11 input-styled',
                        errors.password && 'border-destructive'
                      )}
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-xs text-destructive mt-1.5">{errors.password}</p>}
                </div>
                
                <div>
                  <Label htmlFor="signup-confirm-password" className="text-sm font-medium">Confirmar Senha</Label>
                  <div className="relative mt-1.5">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signup-confirm-password"
                      type={showPassword ? 'text' : 'password'}
                      value={signupConfirmPassword}
                      onChange={(e) => setSignupConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className={cn(
                        'pl-10 h-11 input-styled',
                        errors.confirmPassword && 'border-destructive'
                      )}
                      disabled={isLoading}
                    />
                  </div>
                  {errors.confirmPassword && <p className="text-xs text-destructive mt-1.5">{errors.confirmPassword}</p>}
                </div>
                
                {authError && (
                  <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                    {authError}
                  </div>
                )}
                
                <Button type="submit" className="w-full h-11 btn-gradient" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Criando conta...
                    </>
                  ) : (
                    'Criar Conta'
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <p className="text-xs text-muted-foreground text-center mt-6">
            Ao continuar, você concorda com nossos termos de uso.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
