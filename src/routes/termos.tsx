import { createFileRoute, Link } from "@tanstack/react-router";
import { LogoButton } from "@/components/LogoButton";

export const Route = createFileRoute("/termos")({
  head: () => ({
    meta: [
      { title: "Termos de Uso — AlmaPrivé" },
      {
        name: "description",
        content:
          "Termos de Uso do AlmaPrivé: regras, responsabilidades e condições para utilização da plataforma.",
      },
      { property: "og:title", content: "Termos de Uso — AlmaPrivé" },
      {
        property: "og:description",
        content: "Conheça os Termos de Uso do AlmaPrivé.",
      },
    ],
  }),
  component: TermosPage,
});

function TermosPage() {
  return (
    <main className="min-h-screen bg-background px-5 py-12 text-foreground">
      <article className="mx-auto max-w-2xl">
        <div className="mb-8 flex justify-center">
          <LogoButton size={48} />
        </div>
        <Link
          to="/"
          className="text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          ← Voltar
        </Link>

        <h1 className="mt-6 text-3xl font-semibold tracking-tight">
          Termos de Uso — AlmaPrivé
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Última atualização: Maio de 2026
        </p>

        <div className="mt-8 space-y-8 text-[15px] leading-relaxed text-foreground/90">
          <p>
            Bem-vindo ao AlmaPrivé. Ao acessar e utilizar esta plataforma, você
            concorda com os termos abaixo.
          </p>

          <section>
            <h2 className="text-lg font-semibold text-foreground">1. Sobre a plataforma</h2>
            <p className="mt-2">
              O AlmaPrivé é uma plataforma de vitrine digital que exibe perfis
              de acompanhantes para fins de divulgação. A plataforma não realiza
              intermediação direta de serviços nem participa de negociações entre
              usuários.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">2. Maioridade</h2>
            <p className="mt-2">
              O acesso ao site é permitido apenas para maiores de 18 anos. Ao
              utilizar o AlmaPrivé, você declara ser maior de idade.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">
              3. Responsabilidade dos perfis
            </h2>
            <p className="mt-2">
              Os perfis exibidos são de responsabilidade exclusiva das pessoas
              anunciadas. O AlmaPrivé não garante a veracidade total das
              informações publicadas, embora possa realizar verificações básicas.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">4. Contato externo</h2>
            <p className="mt-2">
              O contato entre usuários e perfis ocorre exclusivamente por meios
              externos, como WhatsApp. O AlmaPrivé não se responsabiliza por
              acordos, serviços ou interações realizadas fora da plataforma.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">5. Conteúdo</h2>
            <p className="mt-2">
              Não é permitido conteúdo ilegal, ofensivo ou que viole direitos de
              terceiros. Perfis que descumprirem essas regras poderão ser
              removidos sem aviso prévio.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">6. Privacidade</h2>
            <p className="mt-2">
              O AlmaPrivé não compartilha dados pessoais com terceiros sem
              consentimento, exceto quando exigido por lei.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">7. Alterações</h2>
            <p className="mt-2">
              Os termos podem ser atualizados a qualquer momento para melhoria
              do serviço. Recomendamos revisão periódica.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">8. Contato</h2>
            <p className="mt-2">
              Para dúvidas ou solicitações, entre em contato pelo WhatsApp
              informado no site.
            </p>
          </section>

          <p className="border-t border-border pt-6 text-sm text-muted-foreground">
            Ao continuar utilizando o AlmaPrivé, você concorda com estes Termos
            de Uso.
          </p>
        </div>
      </article>
    </main>
  );
}