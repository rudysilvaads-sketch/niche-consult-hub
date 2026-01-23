import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Home, ArrowLeft, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Branding } from "@/components/branding/Branding";

// Animated SVG Illustration Component
const NotFoundIllustration = () => (
  <svg
    viewBox="0 0 400 300"
    className="w-full max-w-md mx-auto"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Background clouds */}
    <motion.g
      animate={{ x: [0, 20, 0] }}
      transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
    >
      <ellipse cx="80" cy="60" rx="40" ry="20" className="fill-muted/50" />
      <ellipse cx="100" cy="55" rx="30" ry="15" className="fill-muted/50" />
    </motion.g>
    
    <motion.g
      animate={{ x: [0, -15, 0] }}
      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
    >
      <ellipse cx="320" cy="80" rx="35" ry="18" className="fill-muted/40" />
      <ellipse cx="340" cy="75" rx="25" ry="12" className="fill-muted/40" />
    </motion.g>

    {/* Ground */}
    <ellipse cx="200" cy="270" rx="150" ry="20" className="fill-muted/30" />

    {/* Lost character */}
    <motion.g
      animate={{ y: [0, -5, 0] }}
      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
    >
      {/* Body */}
      <ellipse cx="200" cy="220" rx="35" ry="45" className="fill-primary/80" />
      
      {/* Head */}
      <circle cx="200" cy="160" r="30" className="fill-primary" />
      
      {/* Eyes */}
      <motion.g
        animate={{ scaleY: [1, 0.1, 1] }}
        transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
      >
        <circle cx="190" cy="155" r="5" className="fill-primary-foreground" />
        <circle cx="210" cy="155" r="5" className="fill-primary-foreground" />
        <circle cx="191" cy="154" r="2" className="fill-foreground" />
        <circle cx="211" cy="154" r="2" className="fill-foreground" />
      </motion.g>
      
      {/* Confused mouth */}
      <path
        d="M 190 172 Q 200 168 210 172"
        fill="none"
        stroke="hsl(var(--primary-foreground))"
        strokeWidth="2"
        strokeLinecap="round"
      />
      
      {/* Question mark above head */}
      <motion.g
        animate={{ 
          y: [0, -8, 0],
          opacity: [1, 0.7, 1],
          rotate: [-5, 5, -5]
        }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
      >
        <text
          x="200"
          y="115"
          textAnchor="middle"
          className="fill-accent text-3xl font-bold"
          style={{ fontSize: "32px" }}
        >
          ?
        </text>
      </motion.g>

      {/* Arms */}
      <motion.path
        d="M 165 200 Q 140 180 130 200"
        fill="none"
        className="stroke-primary"
        strokeWidth="8"
        strokeLinecap="round"
        animate={{ rotate: [0, 10, 0] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        style={{ transformOrigin: "165px 200px" }}
      />
      <motion.path
        d="M 235 200 Q 260 180 270 200"
        fill="none"
        className="stroke-primary"
        strokeWidth="8"
        strokeLinecap="round"
        animate={{ rotate: [0, -10, 0] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
        style={{ transformOrigin: "235px 200px" }}
      />
    </motion.g>

    {/* Map/Paper floating */}
    <motion.g
      animate={{ 
        y: [0, -10, 0],
        rotate: [0, 5, -5, 0],
        x: [0, 5, 0]
      }}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
    >
      <rect x="280" y="180" width="40" height="50" rx="3" className="fill-card stroke-border" strokeWidth="1" />
      <line x1="288" y1="195" x2="312" y2="195" className="stroke-muted-foreground/50" strokeWidth="2" />
      <line x1="288" y1="205" x2="308" y2="205" className="stroke-muted-foreground/50" strokeWidth="2" />
      <line x1="288" y1="215" x2="310" y2="215" className="stroke-muted-foreground/50" strokeWidth="2" />
    </motion.g>

    {/* Compass spinning */}
    <motion.g
      animate={{ rotate: 360 }}
      transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
      style={{ transformOrigin: "100px 200px" }}
    >
      <circle cx="100" cy="200" r="20" className="fill-card stroke-primary" strokeWidth="2" />
      <motion.path
        d="M 100 185 L 105 200 L 100 205 L 95 200 Z"
        className="fill-accent"
      />
      <path
        d="M 100 215 L 105 200 L 100 195 L 95 200 Z"
        className="fill-muted-foreground/50"
      />
    </motion.g>

    {/* Stars/sparkles */}
    <motion.g
      animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
      transition={{ duration: 2, repeat: Infinity }}
    >
      <polygon points="50,150 52,156 58,156 53,160 55,166 50,162 45,166 47,160 42,156 48,156" className="fill-accent" />
    </motion.g>
    <motion.g
      animate={{ opacity: [1, 0.3, 1], scale: [1, 0.8, 1] }}
      transition={{ duration: 2.5, repeat: Infinity }}
    >
      <polygon points="350,140 352,146 358,146 353,150 355,156 350,152 345,156 347,150 342,146 348,146" className="fill-primary/60" />
    </motion.g>
    <motion.g
      animate={{ opacity: [0.5, 1, 0.5], scale: [1, 1.3, 1] }}
      transition={{ duration: 1.8, repeat: Infinity }}
    >
      <polygon points="320,220 321,224 325,224 322,227 323,231 320,228 317,231 318,227 315,224 319,224" className="fill-accent/70" />
    </motion.g>
  </svg>
);

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 flex flex-col">
      {/* Header */}
      <header className="p-6">
        <Link to="/auth">
          <Branding size="md" />
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="text-center max-w-2xl">
          {/* Animated SVG Illustration */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
            className="mb-6"
          >
            <NotFoundIllustration />
          </motion.div>

          {/* 404 Text */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mb-4"
          >
            <span className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              404
            </span>
          </motion.div>

          {/* Message */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
              Página não encontrada
            </h1>
            <p className="text-muted-foreground mb-8 text-lg">
              Ops! A página que você está procurando não existe ou foi movida.
            </p>
          </motion.div>

          {/* Path info */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mb-8 p-4 rounded-xl bg-muted/50 border border-border/50"
          >
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Search className="w-4 h-4" />
              <span>Rota solicitada:</span>
              <code className="px-2 py-1 rounded bg-background text-foreground font-mono text-xs">
                {location.pathname}
              </code>
            </div>
          </motion.div>

          {/* Action buttons */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button
              asChild
              size="lg"
              className="gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/25"
            >
              <Link to="/">
                <Home className="w-5 h-5" />
                Ir para o Início
              </Link>
            </Button>
            
            <Button
              variant="outline"
              size="lg"
              className="gap-2"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="w-5 h-5" />
              Voltar
            </Button>
          </motion.div>

          {/* Helpful links */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="mt-12 pt-8 border-t border-border/50"
          >
            <p className="text-sm text-muted-foreground mb-4">
              Páginas que podem te ajudar:
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link 
                to="/auth" 
                className="text-sm text-primary hover:text-primary/80 hover:underline transition-colors"
              >
                Login
              </Link>
              <span className="text-muted-foreground/50">•</span>
              <Link 
                to="/termos" 
                className="text-sm text-primary hover:text-primary/80 hover:underline transition-colors"
              >
                Termos de Uso
              </Link>
              <span className="text-muted-foreground/50">•</span>
              <Link 
                to="/privacidade" 
                className="text-sm text-primary hover:text-primary/80 hover:underline transition-colors"
              >
                Privacidade
              </Link>
              <span className="text-muted-foreground/50">•</span>
              <Link 
                to="/cookies" 
                className="text-sm text-primary hover:text-primary/80 hover:underline transition-colors"
              >
                Cookies
              </Link>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-6 text-center">
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} Espaço Terapêutico. Todos os direitos reservados.
        </p>
      </footer>
    </div>
  );
};

export default NotFound;
