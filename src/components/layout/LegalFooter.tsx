import { Link } from 'react-router-dom';
import { BRAND } from '@/components/branding/Branding';

export function LegalFooter() {
  return (
    <footer className="border-t bg-card/50 py-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} {BRAND.name}. Todos os direitos reservados.
          </p>
          
          <nav className="flex flex-wrap items-center justify-center gap-4 text-sm">
            <Link 
              to="/termos" 
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Termos de Uso
            </Link>
            <span className="text-muted-foreground/50">•</span>
            <Link 
              to="/privacidade" 
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Política de Privacidade
            </Link>
            <span className="text-muted-foreground/50">•</span>
            <Link 
              to="/cookies" 
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Cookies
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
