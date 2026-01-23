import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Branding, BRAND } from '@/components/branding/Branding';

export default function PoliticaCookies() {
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
        <h1 className="text-3xl font-bold mb-8">Política de Cookies</h1>
        
        <div className="prose prose-gray dark:prose-invert max-w-none space-y-6">
          <p className="text-muted-foreground">
            Última atualização: {new Date().toLocaleDateString('pt-BR')}
          </p>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">1. O que são Cookies?</h2>
            <p>
              Cookies são pequenos arquivos de texto armazenados no seu dispositivo quando 
              você visita um site. Eles permitem que o site reconheça seu dispositivo e 
              lembre de suas preferências.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">2. Tipos de Cookies que Utilizamos</h2>
            
            <h3 className="text-lg font-medium">2.1 Cookies Essenciais</h3>
            <p>
              Necessários para o funcionamento básico do site. Sem eles, serviços como 
              login e navegação não funcionariam corretamente.
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Sessão de autenticação:</strong> Mantém você logado</li>
              <li><strong>Preferências de segurança:</strong> Proteção contra ataques</li>
              <li><strong>Consentimento de cookies:</strong> Lembra sua escolha</li>
            </ul>

            <h3 className="text-lg font-medium">2.2 Cookies de Preferências</h3>
            <p>
              Permitem que o site lembre de escolhas como idioma, tema (claro/escuro) 
              e região.
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Tema:</strong> Preferência de modo claro ou escuro</li>
              <li><strong>Layout:</strong> Configurações de exibição</li>
            </ul>

            <h3 className="text-lg font-medium">2.3 Cookies de Desempenho</h3>
            <p>
              Coletam informações sobre como você usa o site, ajudando-nos a melhorar 
              sua experiência.
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Analytics:</strong> Páginas visitadas e tempo de permanência</li>
              <li><strong>Erros:</strong> Registro de problemas técnicos</li>
            </ul>

            <h3 className="text-lg font-medium">2.4 Cookies de Marketing</h3>
            <p>
              Utilizados para exibir anúncios relevantes. Atualmente <strong>não utilizamos</strong> 
              {' '}cookies de marketing ou publicidade de terceiros.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">3. Cookies de Terceiros</h2>
            <p>Utilizamos serviços de terceiros que podem definir cookies:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Firebase:</strong> Autenticação e banco de dados
              </li>
              <li>
                <strong>Google Fonts:</strong> Carregamento de fontes tipográficas
              </li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">4. Como Gerenciar Cookies</h2>
            <p>
              Você pode controlar cookies através das configurações do seu navegador:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Chrome:</strong> Configurações → Privacidade e segurança → Cookies
              </li>
              <li>
                <strong>Firefox:</strong> Opções → Privacidade e Segurança → Cookies
              </li>
              <li>
                <strong>Safari:</strong> Preferências → Privacidade → Cookies
              </li>
              <li>
                <strong>Edge:</strong> Configurações → Cookies e permissões do site
              </li>
            </ul>
            <p className="text-muted-foreground">
              Nota: Bloquear cookies essenciais pode afetar o funcionamento do site.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">5. Tempo de Armazenamento</h2>
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Tipo</th>
                  <th className="text-left py-2">Duração</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-2">Cookies de sessão</td>
                  <td className="py-2">Até fechar o navegador</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2">Cookies persistentes</td>
                  <td className="py-2">Até 1 ano</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2">Preferências de tema</td>
                  <td className="py-2">Até 1 ano</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2">Consentimento</td>
                  <td className="py-2">Até 1 ano</td>
                </tr>
              </tbody>
            </table>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">6. Atualizações desta Política</h2>
            <p>
              Esta política pode ser atualizada periodicamente. Recomendamos que você 
              a revise regularmente para estar ciente de quaisquer mudanças.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">7. Contato</h2>
            <p>
              Para dúvidas sobre cookies, entre em contato:{' '}
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
