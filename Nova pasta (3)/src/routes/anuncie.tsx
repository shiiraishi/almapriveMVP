import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Check,
  ChevronDown,
  Crown,
  Eye,
  Gem,
  HeartHandshake,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Star,
  UserCheck,
} from "lucide-react";
import { LogoButton } from "@/components/LogoButton";
import { Logo } from "@/components/Logo";

export const Route = createFileRoute("/anuncie")({
  head: () => ({
    meta: [
      { title: "Anuncie no AlmaPrivé — Plataforma premium para acompanhantes" },
      {
        name: "description",
        content:
          "Receba mais contatos com curadoria humana, verificação de perfil e uma presença profissional online. Plano Silver gratuito por 30 dias para novas anunciantes.",
      },
      { property: "og:title", content: "Anuncie no AlmaPrivé" },
      {
        property: "og:description",
        content:
          "A plataforma premium para acompanhantes que desejam mais visibilidade, confiança e profissionalismo.",
      },
    ],
  }),
  component: AnunciePage,
});

const WA_NUMBER = "5562998212368";
const WA_MSG =
  "Olá! Tenho interesse em anunciar no AlmaPrivé e gostaria de iniciar meu processo de aprovação.";
const waLink = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(WA_MSG)}`;

const benefits = [
  {
    icon: Eye,
    title: "Mais Visibilidade",
    desc: "Destaque seu perfil para pessoas que já estão procurando atendimento na sua região.",
  },
  {
    icon: MessageCircle,
    title: "Contato Direto",
    desc: "Receba contatos diretamente dos clientes, sem intermediários.",
  },
  {
    icon: Sparkles,
    title: "Perfil Profissional",
    desc: "Apresente seus serviços de forma organizada e valorizada.",
  },
  {
    icon: ShieldCheck,
    title: "Mais Confiança",
    desc: "Perfis verificados geram mais credibilidade e interesse.",
  },
];

const curadoria = [
  "Verificação individual",
  "Análise de perfil",
  "Padronização dos anúncios",
  "Acompanhamento humano",
  "Mais qualidade para anunciantes e visitantes",
];

const steps = [
  {
    n: "01",
    title: "Solicite sua participação",
    desc: "Entre em contato com nossa equipe pelo WhatsApp.",
  },
  {
    n: "02",
    title: "Envie suas informações",
    desc: "Fotos, descrição, valores e demais informações necessárias.",
  },
  {
    n: "03",
    title: "Passe pela verificação",
    desc: "Processo que fortalece a confiança e a qualidade da plataforma.",
  },
  {
    n: "04",
    title: "Seu perfil vai ao ar",
    desc: "Após aprovação, seu anúncio é publicado e começa a receber contatos.",
  },
];

const faqs = [
  {
    q: "Como o AlmaPrivé seleciona os perfis?",
    a: "Todos os perfis passam por uma análise antes da publicação para garantir uma experiência mais organizada e confiável para anunciantes e visitantes.",
  },
  {
    q: "O que influencia a visibilidade de um perfil?",
    a: "Perfis completos, com boas fotos, informações detalhadas e recursos de destaque tendem a gerar mais interesse e alcançar mais visitantes.",
  },
  {
    q: "Como aumentar minhas chances de receber contatos?",
    a: "Perfis bem apresentados, atualizados e com verificação costumam transmitir mais confiança e gerar melhores resultados.",
  },
  {
    q: "O que torna o AlmaPrivé diferente de outros classificados?",
    a: "Nossa proposta combina curadoria humana, qualidade dos perfis e uma experiência mais moderna para anunciantes e clientes.",
  },
  {
    q: "Como funciona a oferta de lançamento?",
    a: "Novas anunciantes recebem acesso ao Plano Silver gratuitamente durante os primeiros 30 dias.",
  },
  {
    q: "Por que a verificação é importante?",
    a: "Perfis verificados tendem a transmitir mais confiança aos visitantes e contribuem para uma melhor experiência na plataforma.",
  },
];

function AnunciePage() {
  const DAYS = [
    { key: 0, label: "Dom", full: "Domingo" },
    { key: 1, label: "Seg", full: "Segunda" },
    { key: 2, label: "Ter", full: "Terça" },
    { key: 3, label: "Qua", full: "Quarta" },
    { key: 4, label: "Qui", full: "Quinta" },
    { key: 5, label: "Sex", full: "Sexta" },
    { key: 6, label: "Sáb", full: "Sábado" },
  ];
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [perDay, setPerDay] = useState<number>(3);
  const [ticket, setTicket] = useState<number>(400);

  const toggleDay = (d: number) =>
    setSelectedDays((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d].sort(),
    );

  const dailyEarnings = useMemo(() => perDay * ticket, [perDay, ticket]);
  const weekly = useMemo(
    () => dailyEarnings * selectedDays.length,
    [dailyEarnings, selectedDays],
  );
  const monthly = useMemo(() => weekly * 4, [weekly]);
  const fmt = (n: number) =>
    n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="min-h-screen bg-[#FBF6F4] text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border/40 bg-[#FBF6F4]/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
          <LogoButton size={36} showWordmark />
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-brand-gradient px-4 py-2 text-xs font-semibold text-white shadow-soft transition-transform hover:-translate-y-0.5 sm:text-sm"
          >
            Quero anunciar
          </a>
        </div>
      </header>

      <main>
        {/* HERO */}
        <section className="relative overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(60% 50% at 50% 0%, rgb(253 41 123 / 0.10), transparent 70%), radial-gradient(40% 40% at 90% 30%, rgb(255 107 107 / 0.08), transparent 70%)",
            }}
          />
          <div className="relative mx-auto max-w-5xl px-5 py-16 sm:py-24 text-center">
            <div className="mx-auto mb-8 flex justify-center">
              <div className="relative">
                <div
                  aria-hidden
                  className="absolute inset-0 -z-10 rounded-full bg-brand-gradient opacity-30 blur-2xl animate-brand-pulse"
                />
                <div className="rounded-full bg-brand-gradient p-[3px] shadow-glow">
                  <div className="rounded-full bg-white px-6 py-4 sm:px-8 sm:py-5">
                    <Logo size={64} showWordmark={false} />
                  </div>
                </div>
              </div>
            </div>

            <span className="inline-flex items-center gap-2 rounded-full border border-[#FD297B]/25 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#FD297B] shadow-soft">
              🔥 Oferta de Lançamento
            </span>

            <h1 className="mt-6 text-3xl font-semibold leading-[1.08] tracking-tight sm:text-5xl">
              Receba mais contatos e <span className="text-brand-gradient">aumente seus ganhos</span>.
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base text-muted-foreground sm:text-lg">
              Plataforma premium para acompanhantes que desejam mais visibilidade,
              mais confiança e uma presença profissional online.
            </p>

            <div className="mx-auto mt-7 inline-flex items-center gap-2 rounded-full border border-border/60 bg-white px-4 py-2 text-sm font-medium shadow-soft">
              <span aria-hidden>🎉</span>
              <span>
                Acesso ao <span className="font-semibold">Plano Silver gratuito por 30 dias</span>.
              </span>
            </div>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full items-center justify-center rounded-full bg-brand-gradient px-7 py-3.5 text-sm font-semibold text-white shadow-glow transition-transform hover:-translate-y-0.5 sm:w-auto sm:text-base"
              >
                Quero anunciar no AlmaPrivé
              </a>
              <a
                href="#planos"
                className="inline-flex w-full items-center justify-center rounded-full border border-border/60 bg-white px-7 py-3.5 text-sm font-semibold text-foreground shadow-soft transition-colors hover:bg-white/70 sm:w-auto sm:text-base"
              >
                Ver planos
              </a>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              Cadastro acompanhado pela nossa equipe · Processo de aprovação · Vagas limitadas
            </p>
          </div>
        </section>

        {/* BENEFITS */}
        <section className="mx-auto max-w-6xl px-5 py-14 sm:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Por que anunciantes escolhem o AlmaPrivé?
            </h2>
            <p className="mt-3 text-sm text-muted-foreground sm:text-base">
              Uma plataforma desenvolvida para ajudar você a conquistar mais visibilidade,
              transmitir mais confiança e ampliar suas oportunidades.
            </p>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {benefits.map((b) => (
              <div
                key={b.title}
                className="rounded-2xl border border-border/60 bg-white p-6 shadow-soft transition-transform hover:-translate-y-1"
              >
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-brand-gradient text-white shadow-soft">
                  <b.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-base font-semibold">{b.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{b.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CURADORIA HUMANA */}
        <section className="bg-white border-y border-border/60">
          <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 sm:py-20 lg:grid-cols-2 lg:items-center">
            <div>
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-brand-gradient text-white shadow-soft">
                <HeartHandshake className="h-6 w-6" />
              </div>
              <h2 className="mt-5 text-2xl font-semibold tracking-tight sm:text-3xl">
                Curadoria humana em todos os perfis.
              </h2>
              <p className="mt-3 text-sm text-muted-foreground sm:text-base">
                Diferente de plataformas automatizadas, cada perfil passa por análise
                e acompanhamento da nossa equipe.
              </p>
            </div>
            <ul className="grid gap-3 rounded-3xl border border-border/60 bg-[#FBF6F4] p-7 sm:p-9">
              {curadoria.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm sm:text-base">
                  <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-gradient text-white">
                    <Check className="h-3.5 w-3.5" />
                  </span>
                  <span className="font-medium">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* COMO FUNCIONA */}
        <section className="mx-auto max-w-6xl px-5 py-14 sm:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Um processo simples, acompanhado do início ao fim.
            </h2>
            <p className="mt-3 text-sm text-muted-foreground sm:text-base">
              Nossa equipe auxilia você durante todo o processo de entrada no AlmaPrivé.
            </p>
          </div>
          <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s) => (
              <li
                key={s.n}
                className="relative rounded-2xl border border-border/60 bg-white p-6 shadow-soft"
              >
                <span className="text-brand-gradient text-xs font-bold tracking-[0.25em]">
                  PASSO {s.n}
                </span>
                <h3 className="mt-3 text-base font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
              </li>
            ))}
          </ol>
          <div className="mt-8 text-center">
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-full bg-brand-gradient px-6 py-3 text-sm font-semibold text-white shadow-glow transition-transform hover:-translate-y-0.5"
            >
              Quero anunciar no AlmaPrivé
            </a>
          </div>
        </section>

        {/* CALCULADORA */}
        <section className="bg-white border-y border-border/60">
          <div className="mx-auto max-w-5xl px-5 py-14 sm:py-20">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                Quanto um novo cliente por dia pode representar para você?
              </h2>
              <p className="mt-3 text-sm text-muted-foreground sm:text-base">
                Faça uma simulação simples e descubra o impacto que mais visibilidade pode gerar.
              </p>
            </div>
            <div className="mt-10 overflow-hidden rounded-3xl border border-border/60 bg-[#FBF6F4] shadow-soft">
              <div className="grid gap-0 lg:grid-cols-2">
                <div className="p-7 sm:p-10">
                  <div className="space-y-6">
                    <div>
                      <label className="text-sm font-medium">Dias da semana que você atende</label>
                      <div className="mt-3 grid grid-cols-7 gap-1.5">
                        {DAYS.map((d) => {
                          const active = selectedDays.includes(d.key);
                          return (
                            <button
                              key={d.key}
                              type="button"
                              onClick={() => toggleDay(d.key)}
                              aria-pressed={active}
                              aria-label={d.full}
                              className={`rounded-lg border px-1 py-2 text-xs font-semibold transition-all ${
                                active
                                  ? "border-transparent bg-brand-gradient text-white shadow-soft"
                                  : "border-border/60 bg-white text-muted-foreground hover:border-[#FD297B]/40"
                              }`}
                            >
                              {d.label}
                            </button>
                          );
                        })}
                      </div>
                      <p className="mt-2 text-xs text-muted-foreground">
                        {selectedDays.length} {selectedDays.length === 1 ? "dia" : "dias"} selecionado{selectedDays.length === 1 ? "" : "s"}
                      </p>
                    </div>
                    <div>
                      <label htmlFor="perDay" className="text-sm font-medium">
                        Atendimentos por dia
                      </label>
                      <input
                        id="perDay"
                        type="number"
                        min={0}
                        max={20}
                        value={perDay}
                        onChange={(e) => setPerDay(Math.max(0, Number(e.target.value) || 0))}
                        className="mt-2 w-full rounded-lg border border-border/60 bg-white px-4 py-2.5 text-sm focus:border-[#FD297B] focus:outline-none focus:ring-2 focus:ring-[#FD297B]/20"
                      />
                    </div>
                    <div>
                      <label htmlFor="ticket" className="text-sm font-medium">
                        Valor médio por atendimento (R$)
                      </label>
                      <input
                        id="ticket"
                        type="number"
                        min={0}
                        step={50}
                        value={ticket}
                        onChange={(e) => setTicket(Math.max(0, Number(e.target.value) || 0))}
                        className="mt-2 w-full rounded-lg border border-border/60 bg-white px-4 py-2.5 text-sm focus:border-[#FD297B] focus:outline-none focus:ring-2 focus:ring-[#FD297B]/20"
                      />
                    </div>
                  </div>
                </div>
                <div className="bg-brand-gradient p-7 text-white sm:p-10">
                  <p className="text-xs uppercase tracking-[0.25em] opacity-80">Projeção</p>
                  <div className="mt-4">
                    <p className="text-sm opacity-90">Faturamento diário</p>
                    <p className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
                      {fmt(dailyEarnings)}
                    </p>
                  </div>
                  <div className="mt-5">
                    <p className="text-sm opacity-90">Faturamento semanal</p>
                    <p className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
                      {fmt(weekly)}
                    </p>
                  </div>
                  <div className="mt-6">
                    <p className="text-sm opacity-90">Faturamento mensal estimado</p>
                    <p className="mt-1 text-4xl font-semibold tracking-tight sm:text-5xl">
                      {fmt(monthly)}
                    </p>
                  </div>
                  <p className="mt-6 text-[11px] leading-relaxed opacity-80">
                    * Projeção matemática baseada nos valores informados. Não constitui
                    promessa de resultados.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PLANOS */}
        <section id="planos" className="mx-auto max-w-6xl px-5 py-14 sm:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Escolha o nível de visibilidade ideal para seu perfil.
            </h2>
            <p className="mt-3 text-sm text-muted-foreground sm:text-base">
              Comece gratuitamente e evolua conforme seus objetivos.
            </p>
          </div>

          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {/* Free */}
            <div className="flex flex-col rounded-2xl border border-border/60 bg-white p-7 shadow-soft">
              <div className="flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-muted-foreground" />
                <h3 className="text-lg font-semibold">Plano Free</h3>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Comece gratuitamente e conheça a plataforma.
              </p>
              <ul className="mt-5 space-y-2 text-sm">
                <li className="flex gap-2"><Check className="h-4 w-4 text-[#FD297B]" /> Perfil publicado</li>
                <li className="flex gap-2"><Check className="h-4 w-4 text-[#FD297B]" /> Contato direto</li>
                <li className="flex gap-2"><Check className="h-4 w-4 text-[#FD297B]" /> Exposição básica</li>
                <li className="flex gap-2"><Check className="h-4 w-4 text-[#FD297B]" /> Participação na plataforma</li>
              </ul>
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-7 inline-flex items-center justify-center rounded-full border border-border/60 bg-white px-5 py-3 text-sm font-semibold shadow-soft transition-colors hover:bg-[#FBF6F4]"
              >
                Começar Gratuitamente
              </a>
            </div>

            {/* Silver — Mais Popular */}
            <div className="relative flex flex-col rounded-2xl border-2 border-[#FD297B] bg-white p-7 shadow-glow lg:-translate-y-2">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand-gradient px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white shadow-soft">
                Mais Popular
              </span>
              <div className="flex items-center gap-2">
                <Gem className="h-5 w-5 text-slate-500" />
                <h3 className="text-lg font-semibold">Plano Silver</h3>
                <span className="ml-auto rounded-full bg-[#FD297B]/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-[#FD297B]">
                  30 dias grátis
                </span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Mais visibilidade para conquistar novos clientes.
              </p>
              <ul className="mt-5 space-y-2 text-sm">
                <li className="flex gap-2"><Check className="h-4 w-4 text-[#FD297B]" /> Tudo do Free</li>
                <li className="flex gap-2"><Check className="h-4 w-4 text-[#FD297B]" /> Maior destaque</li>
                <li className="flex gap-2"><Check className="h-4 w-4 text-[#FD297B]" /> Galeria completa</li>
                <li className="flex gap-2"><Check className="h-4 w-4 text-[#FD297B]" /> Melhor posicionamento</li>
                <li className="flex gap-2"><Check className="h-4 w-4 text-[#FD297B]" /> Selo de destaque</li>
              </ul>
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-7 inline-flex items-center justify-center rounded-full bg-brand-gradient px-5 py-3 text-sm font-semibold text-white shadow-glow transition-transform hover:-translate-y-0.5"
              >
                Experimentar Silver Grátis
              </a>
            </div>

            {/* Gold */}
            <div className="relative flex flex-col overflow-hidden rounded-2xl border border-[#C9A84C]/40 bg-gradient-to-b from-[#FFF8E8] to-white p-7 shadow-soft">
              <div className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-[#C9A84C]" />
                <h3 className="text-lg font-semibold">Plano Gold</h3>
                <span className="ml-auto rounded-full bg-gradient-to-r from-[#C9A84C] to-[#E8C77A] px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-white">
                  Premium
                </span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Máxima exposição para quem busca os melhores resultados.
              </p>
              <ul className="mt-5 space-y-2 text-sm">
                <li className="flex gap-2"><Star className="h-4 w-4 text-[#C9A84C]" /> Tudo do Silver</li>
                <li className="flex gap-2"><Star className="h-4 w-4 text-[#C9A84C]" /> Prioridade máxima</li>
                <li className="flex gap-2"><Star className="h-4 w-4 text-[#C9A84C]" /> Destaque premium</li>
                <li className="flex gap-2"><Star className="h-4 w-4 text-[#C9A84C]" /> Exposição ampliada</li>
                <li className="flex gap-2"><Star className="h-4 w-4 text-[#C9A84C]" /> Recursos exclusivos</li>
              </ul>
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-7 inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#C9A84C] to-[#E8C77A] px-5 py-3 text-sm font-semibold text-white shadow-soft transition-transform hover:-translate-y-0.5"
              >
                Quero o Gold
              </a>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="bg-white border-y border-border/60">
          <div className="mx-auto max-w-3xl px-5 py-14 sm:py-20">
            <div className="text-center">
              <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                O que você precisa saber antes de anunciar
              </h2>
            </div>
            <div className="mt-10 divide-y divide-border/60 rounded-2xl border border-border/60 bg-[#FBF6F4]">
              {faqs.map((f, i) => {
                const open = openFaq === i;
                return (
                  <button
                    key={f.q}
                    type="button"
                    onClick={() => setOpenFaq(open ? null : i)}
                    className="block w-full px-5 py-4 text-left"
                    aria-expanded={open}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-sm font-semibold sm:text-base">{f.q}</span>
                      <ChevronDown
                        className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${
                          open ? "rotate-180" : ""
                        }`}
                      />
                    </div>
                    {open && (
                      <p className="mt-3 text-sm text-muted-foreground animate-fade-in-up">
                        {f.a}
                      </p>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA FINAL */}
        <section className="mx-auto max-w-4xl px-5 py-16 sm:py-24">
          <div className="relative overflow-hidden rounded-3xl bg-brand-gradient p-10 text-center text-white shadow-glow sm:p-14">
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Pronta para anunciar no AlmaPrivé?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm opacity-95 sm:text-base">
              Nossa equipe acompanha todo o processo de aprovação e publicação do perfil.
            </p>
            <div className="mx-auto mt-6 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-medium backdrop-blur">
              <span aria-hidden>🎉</span>
              <span>Plano Silver gratuito por 30 dias para novas anunciantes.</span>
            </div>
            <div className="mt-7">
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-[#FD297B] shadow-soft transition-transform hover:-translate-y-0.5 sm:text-base"
              >
                Quero anunciar no AlmaPrivé
              </a>
            </div>
            <p className="mt-4 text-xs opacity-90">
              Fale com nossa equipe pelo WhatsApp e solicite sua participação.
            </p>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/60 bg-[#FBF6F4]">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-5 py-6 text-xs text-muted-foreground sm:flex-row">
          <div className="flex items-center gap-2">
            <LogoButton size={22} />
            <p>© {new Date().getFullYear()} AlmaPrivé · Conteúdo destinado a maiores de 18 anos.</p>
          </div>
          <nav className="flex items-center gap-4">
            <Link to="/termos" className="hover:text-foreground transition-colors">Termos de Uso</Link>
            <Link to="/privacidade" className="hover:text-foreground transition-colors">Privacidade</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}