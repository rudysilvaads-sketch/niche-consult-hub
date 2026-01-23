import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "./contexts/AppContext";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { CookieConsentBanner } from "./components/cookies/CookieConsentBanner";
import Index from "./pages/Index";
import Agenda from "./pages/Agenda";
import Agendar from "./pages/Agendar";
import Cadastro from "./pages/Cadastro";
import Auth from "./pages/Auth";
import Pacientes from "./pages/Pacientes";
import Prontuarios from "./pages/Prontuarios";
import Financeiro from "./pages/Financeiro";
import Documentos from "./pages/Documentos";
import Relatorios from "./pages/Relatorios";
import Configuracoes from "./pages/Configuracoes";
import VideoRoom from "./pages/VideoRoom";
import ResumoSessao from "./pages/ResumoSessao";
import InstalarApp from "./pages/InstalarApp";
import TermosDeUso from "./pages/TermosDeUso";
import PoliticaPrivacidade from "./pages/PoliticaPrivacidade";
import PoliticaCookies from "./pages/PoliticaCookies";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <AuthProvider>
          <AppProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                {/* Public routes */}
                <Route path="/auth" element={<Auth />} />
                <Route path="/agendar" element={<Agendar />} />
                <Route path="/cadastro/:token" element={<Cadastro />} />
                <Route path="/resumo/:token" element={<ResumoSessao />} />
                <Route path="/sala/:sessionId" element={<VideoRoom />} />
                <Route path="/instalar" element={<InstalarApp />} />
                
                {/* Legal pages */}
                <Route path="/termos" element={<TermosDeUso />} />
                <Route path="/privacidade" element={<PoliticaPrivacidade />} />
                <Route path="/cookies" element={<PoliticaCookies />} />
                
                {/* Protected routes */}
                <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
                <Route path="/agenda" element={<ProtectedRoute><Agenda /></ProtectedRoute>} />
                <Route path="/pacientes" element={<ProtectedRoute><Pacientes /></ProtectedRoute>} />
                <Route path="/prontuarios" element={<ProtectedRoute><Prontuarios /></ProtectedRoute>} />
                <Route path="/financeiro" element={<ProtectedRoute><Financeiro /></ProtectedRoute>} />
                <Route path="/documentos" element={<ProtectedRoute><Documentos /></ProtectedRoute>} />
                <Route path="/relatorios" element={<ProtectedRoute><Relatorios /></ProtectedRoute>} />
                <Route path="/configuracoes" element={<ProtectedRoute><Configuracoes /></ProtectedRoute>} />
                
                <Route path="*" element={<NotFound />} />
              </Routes>
              
              {/* Cookie Consent Banner */}
              <CookieConsentBanner />
            </BrowserRouter>
          </AppProvider>
        </AuthProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
