import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "./contexts/AppContext";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import Index from "./pages/Index";
import Agenda from "./pages/Agenda";
import Agendar from "./pages/Agendar";
import Auth from "./pages/Auth";
import Pacientes from "./pages/Pacientes";
import Prontuarios from "./pages/Prontuarios";
import Financeiro from "./pages/Financeiro";
import Documentos from "./pages/Documentos";
import Relatorios from "./pages/Relatorios";
import Configuracoes from "./pages/Configuracoes";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
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
          </BrowserRouter>
        </AppProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
