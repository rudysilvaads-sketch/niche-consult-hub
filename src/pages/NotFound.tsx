import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Home, ArrowLeft, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Branding } from "@/components/branding/Branding";

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
        <div className="text-center max-w-lg">
          {/* Animated 404 */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
            className="mb-8"
          >
            <div className="relative inline-block">
              <motion.span
                className="text-[150px] md:text-[200px] font-bold bg-gradient-to-br from-primary via-primary/70 to-accent bg-clip-text text-transparent leading-none"
                animate={{ 
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                }}
                transition={{ 
                  duration: 5, 
                  repeat: Infinity, 
                  ease: "linear" 
                }}
                style={{ backgroundSize: "200% 200%" }}
              >
                404
              </motion.span>
              
              {/* Floating elements */}
              <motion.div
                className="absolute -top-4 -right-4 w-8 h-8 rounded-full bg-primary/20"
                animate={{ 
                  y: [-5, 5, -5],
                  rotate: [0, 180, 360]
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.div
                className="absolute -bottom-2 -left-6 w-6 h-6 rounded-full bg-accent/30"
                animate={{ 
                  y: [5, -5, 5],
                  scale: [1, 1.2, 1]
                }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              />
            </div>
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
