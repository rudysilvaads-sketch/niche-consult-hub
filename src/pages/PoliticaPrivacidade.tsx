import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Branding, BRAND } from '@/components/branding/Branding';

export default function PoliticaPrivacidade() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Branding variant="full" size="md" />
          <Button variant="ghost" size="sm" asChild>
            <Link to="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Link>
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8">Política de Privacidade</h1>
        
        <div className="prose prose-gray dark:prose-invert max-w-none space-y-6">
          <p className="text-muted-foreground">
            Última atualização: {new Date().toLocaleDateString('pt-BR')}
          </p>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">1. Introdução</h2>
            <p>
              O {BRAND.name} valoriza a privacidade dos seus usuários. Esta Política de 
              Privacidade descreve como coletamos, usamos e protegemos suas informações 
              pessoais em conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018).
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">2. Dados Coletados</h2>
            <p>Coletamos os seguintes tipos de dados:</p>
            
            <h3 className="text-lg font-medium">2.1 Dados de Identificação</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Nome completo</li>
              <li>E-mail</li>
              <li>Telefone</li>
              <li>CPF (quando necessário)</li>
              <li>Registro profissional (CRP, CRM, etc.)</li>
            </ul>

            <h3 className="text-lg font-medium">2.2 Dados de Uso</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Logs de acesso</li>
              <li>Endereço IP</li>
              <li>Tipo de navegador</li>
              <li>Páginas visitadas</li>
            </ul>

            <h3 className="text-lg font-medium">2.3 Dados Sensíveis</h3>
            <p>
              Dados de saúde de pacientes são armazenados de forma criptografada e 
              acessíveis apenas pelo profissional responsável.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">3. Finalidade do Tratamento</h2>
            <p>Utilizamos seus dados para:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Fornecer e melhorar nossos serviços</li>
              <li>Processar pagamentos e emitir documentos fiscais</li>
              <li>Enviar comunicações sobre o serviço</li>
              <li>Garantir a segurança da plataforma</li>
              <li>Cumprir obrigações legais</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">4. Base Legal</h2>
            <p>O tratamento de dados é realizado com base nas seguintes hipóteses legais:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Consentimento:</strong> Para dados coletados mediante sua autorização</li>
              <li><strong>Execução de contrato:</strong> Para prestação dos serviços contratados</li>
              <li><strong>Obrigação legal:</strong> Para cumprimento de exigências legais</li>
              <li><strong>Legítimo interesse:</strong> Para melhorias e segurança da plataforma</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">5. Compartilhamento de Dados</h2>
            <p>
              Seus dados podem ser compartilhados com:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Processadores de pagamento para cobranças</li>
              <li>Serviços de infraestrutura (hospedagem e armazenamento)</li>
              <li>Autoridades quando exigido por lei</li>
            </ul>
            <p>
              Não vendemos ou alugamos seus dados pessoais para terceiros.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">6. Segurança dos Dados</h2>
            <p>
              Implementamos medidas técnicas e organizacionais para proteger seus dados:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Criptografia em trânsito (HTTPS/TLS)</li>
              <li>Criptografia em repouso para dados sensíveis</li>
              <li>Controle de acesso baseado em funções</li>
              <li>Monitoramento e logs de segurança</li>
              <li>Backups regulares</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">7. Seus Direitos (LGPD)</h2>
            <p>Você tem direito a:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Acesso:</strong> Solicitar cópia dos seus dados</li>
              <li><strong>Correção:</strong> Atualizar dados incorretos</li>
              <li><strong>Exclusão:</strong> Solicitar eliminação dos dados</li>
              <li><strong>Portabilidade:</strong> Receber seus dados em formato estruturado</li>
              <li><strong>Revogação:</strong> Retirar consentimento a qualquer momento</li>
              <li><strong>Oposição:</strong> Opor-se a tratamentos específicos</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">8. Retenção de Dados</h2>
            <p>
              Mantemos seus dados pelo tempo necessário para:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Prestação dos serviços contratados</li>
              <li>Cumprimento de obrigações legais (até 5 anos para dados fiscais)</li>
              <li>Exercício de direitos em processos judiciais</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">9. Cookies</h2>
            <p>
              Utilizamos cookies para melhorar sua experiência. Para mais informações, 
              consulte nossa{' '}
              <Link to="/cookies" className="text-primary hover:underline">
                Política de Cookies
              </Link>.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">10. Contato do Encarregado (DPO)</h2>
            <p>
              Para exercer seus direitos ou esclarecer dúvidas sobre privacidade, 
              entre em contato com nosso Encarregado de Proteção de Dados:
            </p>
            <p>
              <strong>E-mail:</strong>{' '}
              <a href={`mailto:${BRAND.email}`} className="text-primary hover:underline">
                {BRAND.email}
              </a>
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">11. Alterações na Política</h2>
            <p>
              Esta política pode ser atualizada periodicamente. Notificaremos sobre 
              mudanças significativas por email ou através da plataforma.
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-6 mt-12">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} {BRAND.name}. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
