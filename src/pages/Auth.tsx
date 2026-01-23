import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, Loader2, ArrowLeft, CheckCircle2, Shield, Heart, Calendar, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { z } from 'zod';
import { motion } from 'framer-motion';
import logo from '@/assets/logo.png';

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

const features = [
  { icon: Calendar, title: 'Agenda Inteligente', description: 'Organize suas consultas com facilidade' },
  { icon: Users, title: 'Gestão de Pacientes', description: 'Prontuários digitais e seguros' },
  { icon: Heart, title: 'Atendimento Humanizado', description: 'Foque no que importa: seu paciente' },
  { icon: Shield, title: 'Segurança Total', description: 'Dados protegidos e criptografados' },
];

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

  // Left Panel with Branding
  const BrandingPanel = () => (
    <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-primary via-primary/90 to-primary/80">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0">
        {/* Organic shapes */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-3xl translate-x-1/4 translate-y-1/4" />
        <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-white/3 rounded-full blur-2xl -translate-x-1/2 -translate-y-1/2" />
        
        {/* Grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }}
        />
        
        {/* Floating elements */}
        <motion.div 
          className="absolute top-20 right-20 w-20 h-20 border border-white/10 rounded-2xl"
          animate={{ rotate: 360 }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        />
        <motion.div 
          className="absolute bottom-32 left-20 w-16 h-16 border border-white/10 rounded-full"
          animate={{ y: [-10, 10, -10] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute top-1/3 right-1/4 w-3 h-3 bg-white/20 rounded-full"
          animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute bottom-1/4 left-1/3 w-2 h-2 bg-white/30 rounded-full"
          animate={{ scale: [1, 2, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        />
      </div>
      
      {/* Content */}
      <div className="relative z-10 flex flex-col justify-between p-12 w-full">
        {/* Logo */}
        <motion.div 
          className="flex items-center gap-3"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="h-12 w-12 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20 overflow-hidden">
            <img src={logo} alt="Logo" className="h-8 w-8 object-contain" />
          </div>
          <div>
            <p className="font-semibold text-white text-lg tracking-tight">Espaço</p>
            <p className="text-xs text-white/70 -mt-0.5">Terapêutico</p>
          </div>
        </motion.div>
        
        {/* Main Message */}
        <div className="space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight">
              Gestão completa
              <br />
              <span className="text-white/80">para sua clínica</span>
            </h1>
            <p className="text-white/70 mt-4 text-lg max-w-md">
              Simplifique sua rotina com nossa plataforma integrada de gerenciamento clínico.
            </p>
          </motion.div>
          
          {/* Features Grid */}
          <motion.div 
            className="grid grid-cols-2 gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {features.map((feature, index) => (
              <motion.div 
                key={feature.title}
                className="flex items-start gap-3 p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-colors"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
              >
                <div className="h-10 w-10 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                  <feature.icon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-white font-medium text-sm">{feature.title}</p>
                  <p className="text-white/60 text-xs mt-0.5">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
        
        {/* Footer */}
        <motion.p 
          className="text-white/50 text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          © 2024 Espaço Terapêutico. Todos os direitos reservados.
        </motion.p>
      </div>
    </div>
  );

  // Reset Password View
  if (showResetPassword) {
    return (
      <div className="min-h-screen flex">
        <BrandingPanel />
        
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-8 lg:p-12 bg-background">
          <motion.div 
            className="w-full max-w-md"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Mobile Logo */}
            <div className="flex items-center justify-center gap-3 mb-8 lg:hidden">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center overflow-hidden">
                <img src={logo} alt="Logo" className="h-8 w-8 object-contain" />
              </div>
              <div>
                <p className="font-semibold text-foreground text-lg">Espaço</p>
                <p className="text-xs text-muted-foreground -mt-0.5">Terapêutico</p>
              </div>
            </div>

            <div className="bg-card border border-border rounded-2xl p-8 shadow-lg">
              <div className="text-center mb-6">
                <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Mail className="h-7 w-7 text-primary" />
                </div>
                <h1 className="text-2xl font-bold text-foreground mb-2">Recuperar Senha</h1>
                <p className="text-muted-foreground">
                  {resetEmailSent 
                    ? 'Verifique sua caixa de entrada' 
                    : 'Digite seu email para receber o link de recuperação'
                  }
                </p>
              </div>

              {resetEmailSent ? (
                <div className="space-y-6">
                  <div className="flex flex-col items-center gap-4 py-6">
                    <motion.div 
                      className="w-16 h-16 rounded-2xl bg-success/10 flex items-center justify-center"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200, damping: 15 }}
                    >
                      <CheckCircle2 className="h-8 w-8 text-success" />
                    </motion.div>
                    <p className="text-sm text-muted-foreground text-center">
                      Enviamos um email para <strong className="text-foreground">{resetEmail}</strong>
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full h-12" 
                    onClick={handleBackToLogin}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Voltar para o login
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleResetPassword} className="space-y-5">
                  <div>
                    <Label htmlFor="reset-email" className="text-sm font-medium">Email</Label>
                    <div className="relative mt-2">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="reset-email"
                        type="email"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        placeholder="seu@email.com"
                        className={cn(
                          'pl-11 h-12 rounded-xl border-border bg-background focus:ring-2 focus:ring-primary/20',
                          errors.email && 'border-destructive focus:ring-destructive/20'
                        )}
                        disabled={isLoading}
                      />
                    </div>
                    {errors.email && <p className="text-xs text-destructive mt-2">{errors.email}</p>}
                  </div>
                  
                  {authError && (
                    <div className="p-4 rounded-xl bg-destructive/10 text-destructive text-sm">
                      {authError}
                    </div>
                  )}
                  
                  <Button type="submit" className="w-full h-12 rounded-xl btn-gradient text-base font-medium" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      'Enviar link de recuperação'
                    )}
                  </Button>
                  
                  <Button 
                    type="button"
                    variant="ghost" 
                    className="w-full text-muted-foreground hover:text-foreground" 
                    onClick={handleBackToLogin}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Voltar para o login
                  </Button>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      <BrandingPanel />
      
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-8 lg:p-12 bg-background">
        <motion.div 
          className="w-full max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Mobile Logo */}
          <div className="flex items-center justify-center gap-3 mb-8 lg:hidden">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center overflow-hidden">
              <img src={logo} alt="Logo" className="h-8 w-8 object-contain" />
            </div>
            <div>
              <p className="font-semibold text-foreground text-lg">Espaço</p>
              <p className="text-xs text-muted-foreground -mt-0.5">Terapêutico</p>
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl p-8 shadow-lg">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-foreground mb-2">
                {activeTab === 'login' ? 'Bem-vindo de volta' : 'Crie sua conta'}
              </h1>
              <p className="text-muted-foreground">
                {activeTab === 'login' 
                  ? 'Entre com suas credenciais para continuar' 
                  : 'Preencha os dados para começar'
                }
              </p>
            </div>

            <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); clearError(); setErrors({}); }}>
              <TabsList className="grid w-full grid-cols-2 mb-8 bg-secondary/50 p-1.5 rounded-xl h-12">
                <TabsTrigger 
                  value="login" 
                  className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm font-medium transition-all"
                >
                  Entrar
                </TabsTrigger>
                <TabsTrigger 
                  value="signup" 
                  className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm font-medium transition-all"
                >
                  Cadastrar
                </TabsTrigger>
              </TabsList>
              
              {/* Login Tab */}
              <TabsContent value="login" className="mt-0">
                <form onSubmit={handleLogin} className="space-y-5">
                  <div>
                    <Label htmlFor="login-email" className="text-sm font-medium">Email</Label>
                    <div className="relative mt-2">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="login-email"
                        type="email"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        placeholder="seu@email.com"
                        className={cn(
                          'pl-11 h-12 rounded-xl border-border bg-background focus:ring-2 focus:ring-primary/20',
                          errors.email && 'border-destructive focus:ring-destructive/20'
                        )}
                        disabled={isLoading}
                      />
                    </div>
                    {errors.email && <p className="text-xs text-destructive mt-2">{errors.email}</p>}
                  </div>
                  
                  <div>
                    <Label htmlFor="login-password" className="text-sm font-medium">Senha</Label>
                    <div className="relative mt-2">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="login-password"
                        type={showPassword ? 'text' : 'password'}
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="••••••••"
                        className={cn(
                          'pl-11 pr-11 h-12 rounded-xl border-border bg-background focus:ring-2 focus:ring-primary/20',
                          errors.password && 'border-destructive focus:ring-destructive/20'
                        )}
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                    {errors.password && <p className="text-xs text-destructive mt-2">{errors.password}</p>}
                  </div>
                  
                  {authError && (
                    <div className="p-4 rounded-xl bg-destructive/10 text-destructive text-sm">
                      {authError}
                    </div>
                  )}
                  
                  <Button type="submit" className="w-full h-12 rounded-xl btn-gradient text-base font-medium" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        Entrando...
                      </>
                    ) : (
                      'Entrar'
                    )}
                  </Button>
                  
                  <button
                    type="button"
                    onClick={() => { setShowResetPassword(true); clearError(); setErrors({}); }}
                    className="w-full text-sm text-muted-foreground hover:text-primary transition-colors py-2"
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
                    <div className="relative mt-2">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="signup-name"
                        type="text"
                        value={signupName}
                        onChange={(e) => setSignupName(e.target.value)}
                        placeholder="Dr. João Silva"
                        className={cn(
                          'pl-11 h-12 rounded-xl border-border bg-background focus:ring-2 focus:ring-primary/20',
                          errors.name && 'border-destructive focus:ring-destructive/20'
                        )}
                        disabled={isLoading}
                      />
                    </div>
                    {errors.name && <p className="text-xs text-destructive mt-2">{errors.name}</p>}
                  </div>
                  
                  <div>
                    <Label htmlFor="signup-email" className="text-sm font-medium">Email</Label>
                    <div className="relative mt-2">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="signup-email"
                        type="email"
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                        placeholder="seu@email.com"
                        className={cn(
                          'pl-11 h-12 rounded-xl border-border bg-background focus:ring-2 focus:ring-primary/20',
                          errors.email && 'border-destructive focus:ring-destructive/20'
                        )}
                        disabled={isLoading}
                      />
                    </div>
                    {errors.email && <p className="text-xs text-destructive mt-2">{errors.email}</p>}
                  </div>
                  
                  <div>
                    <Label htmlFor="signup-password" className="text-sm font-medium">Senha</Label>
                    <div className="relative mt-2">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="signup-password"
                        type={showPassword ? 'text' : 'password'}
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        placeholder="••••••••"
                        className={cn(
                          'pl-11 pr-11 h-12 rounded-xl border-border bg-background focus:ring-2 focus:ring-primary/20',
                          errors.password && 'border-destructive focus:ring-destructive/20'
                        )}
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                    {errors.password && <p className="text-xs text-destructive mt-2">{errors.password}</p>}
                  </div>
                  
                  <div>
                    <Label htmlFor="signup-confirm-password" className="text-sm font-medium">Confirmar Senha</Label>
                    <div className="relative mt-2">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="signup-confirm-password"
                        type={showPassword ? 'text' : 'password'}
                        value={signupConfirmPassword}
                        onChange={(e) => setSignupConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className={cn(
                          'pl-11 h-12 rounded-xl border-border bg-background focus:ring-2 focus:ring-primary/20',
                          errors.confirmPassword && 'border-destructive focus:ring-destructive/20'
                        )}
                        disabled={isLoading}
                      />
                    </div>
                    {errors.confirmPassword && <p className="text-xs text-destructive mt-2">{errors.confirmPassword}</p>}
                  </div>
                  
                  {authError && (
                    <div className="p-4 rounded-xl bg-destructive/10 text-destructive text-sm">
                      {authError}
                    </div>
                  )}
                  
                  <Button type="submit" className="w-full h-12 rounded-xl btn-gradient text-base font-medium mt-2" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        Criando conta...
                      </>
                    ) : (
                      'Criar conta'
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </div>
          
          {/* Terms */}
          <p className="text-center text-xs text-muted-foreground mt-6">
            Ao continuar, você concorda com nossos{' '}
            <Link to="/termos-de-uso" className="text-primary hover:underline">
              Termos de Uso
            </Link>{' '}
            e{' '}
            <Link to="/politica-privacidade" className="text-primary hover:underline">
              Política de Privacidade
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Auth;
