import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Branding, BRAND } from '@/components/branding/Branding';

export default function TermosDeUso() {
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
        <h1 className="text-3xl font-bold mb-8">Termos de Uso</h1>
        
        <div className="prose prose-gray dark:prose-invert max-w-none space-y-6">
          <p className="text-muted-foreground">
            Última atualização: {new Date().toLocaleDateString('pt-BR')}
          </p>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">1. Aceitação dos Termos</h2>
            <p>
              Ao acessar e utilizar o {BRAND.name}, você concorda com estes Termos de Uso. 
              Se você não concordar com qualquer parte destes termos, não deverá usar nossos serviços.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">2. Descrição do Serviço</h2>
            <p>
              O {BRAND.name} é uma plataforma de gestão para profissionais de saúde mental, 
              incluindo psicólogos, terapeutas, sexólogos, psicanalistas e consteladores. 
              Nossos serviços incluem:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Gestão de agenda e agendamento online</li>
              <li>Prontuário eletrônico de pacientes</li>
              <li>Gestão financeira e emissão de documentos</li>
              <li>Teleconsulta por vídeo</li>
              <li>Relatórios e análises</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">3. Cadastro e Conta</h2>
            <p>
              Para utilizar nossos serviços, você deve criar uma conta fornecendo informações 
              verdadeiras e completas. Você é responsável por manter a confidencialidade de 
              sua senha e por todas as atividades realizadas em sua conta.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">4. Responsabilidades do Usuário</h2>
            <p>O usuário se compromete a:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Utilizar a plataforma de acordo com a legislação vigente</li>
              <li>Manter seus dados cadastrais atualizados</li>
              <li>Não compartilhar suas credenciais de acesso</li>
              <li>Respeitar o sigilo profissional de seus pacientes</li>
              <li>Utilizar a plataforma apenas para fins lícitos</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">5. Privacidade e Proteção de Dados</h2>
            <p>
              O tratamento de dados pessoais está descrito em nossa{' '}
              <Link to="/privacidade" className="text-primary hover:underline">
                Política de Privacidade
              </Link>
              , que é parte integrante destes Termos de Uso.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">6. Propriedade Intelectual</h2>
            <p>
              Todo o conteúdo da plataforma, incluindo textos, gráficos, logotipos, ícones, 
              imagens e software, é de propriedade do {BRAND.name} e está protegido pelas 
              leis de propriedade intelectual.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">7. Limitação de Responsabilidade</h2>
            <p>
              O {BRAND.name} não se responsabiliza por decisões clínicas ou terapêuticas 
              tomadas pelos profissionais que utilizam a plataforma. A responsabilidade 
              pelo atendimento é exclusivamente do profissional.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">8. Modificações nos Termos</h2>
            <p>
              Reservamo-nos o direito de modificar estes termos a qualquer momento. 
              Alterações significativas serão comunicadas por email ou através da plataforma.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">9. Cancelamento</h2>
            <p>
              Você pode cancelar sua conta a qualquer momento através das configurações. 
              Após o cancelamento, seus dados serão tratados conforme nossa Política de Privacidade.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">10. Contato</h2>
            <p>
              Para dúvidas sobre estes Termos de Uso, entre em contato através do email:{' '}
              <a href={`mailto:${BRAND.email}`} className="text-primary hover:underline">
                {BRAND.email}
              </a>
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
