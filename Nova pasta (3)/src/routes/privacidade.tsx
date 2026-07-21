import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/privacidade")({
  head: () => ({
    meta: [
      { title: "Política de Privacidade — AlmaPrivé" },
      {
        name: "description",
        content:
          "Política de Privacidade do AlmaPrivé: como coletamos, usamos e protegemos suas informações.",
      },
      { property: "og:title", content: "Política de Privacidade — AlmaPrivé" },
      {
        property: "og:description",
        content: "Saiba como o AlmaPrivé trata seus dados.",
      },
    ],
  }),
  component: PrivacidadePage,
});

function PrivacidadePage() {
  return (
    <main className="min-h-screen bg-background px-5 py-12 text-foreground">
      <article className="mx-auto max-w-2xl">
        <Link
          to="/"
          className="text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          ← Voltar
        </Link>

        <h1 className="mt-6 text-3xl font-semibold tracking-tight">
          Política de Privacidade — AlmaPrivé
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Última atualização: Maio de 2026
        </p>

        <div className="mt-8 space-y-8 text-[15px] leading-relaxed text-foreground/90">
          <p>
            Esta Política descreve como o AlmaPrivé coleta e utiliza informações.
          </p>

          <section>
            <h2 className="text-lg font-semibold text-foreground">1. Dados coletados</h2>
            <p className="mt-2">Coletamos apenas o mínimo necessário:</p>
            <ul className="mt-2 list-disc space-y-1 pl-6">
              <li>Dados de navegação (IP, dispositivo, páginas acessadas)</li>
              <li>Cookies e tecnologias similares</li>
              <li>Informações fornecidas voluntariamente via WhatsApp</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">2. Uso das informações</h2>
            <p className="mt-2">Utilizamos os dados para:</p>
            <ul className="mt-2 list-disc space-y-1 pl-6">
              <li>Melhorar a experiência do usuário</li>
              <li>Analisar uso da plataforma</li>
              <li>Responder contatos via WhatsApp</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">3. Compartilhamento</h2>
            <p className="mt-2">
              Não vendemos dados pessoais. Podemos compartilhar informações quando:
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-6">
              <li>Exigido por lei</li>
              <li>Necessário para funcionamento do serviço</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">4. Cookies</h2>
            <p className="mt-2">Usamos cookies para:</p>
            <ul className="mt-2 list-disc space-y-1 pl-6">
              <li>Manter preferências</li>
              <li>Analisar tráfego</li>
              <li>Melhorar navegação</li>
            </ul>
            <p className="mt-2">Você pode desativar cookies no navegador.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">5. Segurança</h2>
            <p className="mt-2">
              Adotamos medidas básicas para proteger informações, mas nenhum
              sistema é 100% seguro. Implementamos medidas razoáveis, mas o
              usuário deve estar ciente de que nenhum sistema online é imune a
              falhas.
            </p>
          </section>
        </div>
      </article>
    </main>
  );
}