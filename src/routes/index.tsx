import { useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  Search,
  ShieldCheck,
  Images,
  Film,
  Sparkles,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { LogoButton } from "@/components/LogoButton";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type PlanTier = "ouro" | "prata" | "bronze";

/** priority: ouro=3+, prata=2, bronze=1 (ou 0). Black é feature (is_black), não plano. */
function tierOf(p: Profile): PlanTier {
  const lvl = p.priority_level ?? 0;
  if (lvl >= 3) return "ouro";
  if (lvl === 2) return "prata";
  return "bronze";
}

function sortWithinPlan(bucket: Profile[]): Profile[] {
  const pinned = bucket
    .filter((p) => p.manual_position != null)
    .sort(
      (a, b) => (a.manual_position as number) - (b.manual_position as number),
    );
  const rest = bucket.filter((p) => p.manual_position == null);
  for (let i = rest.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [rest[i], rest[j]] = [rest[j], rest[i]];
  }
  return [...pinned, ...rest];
}

function groupProfilesByPlan(list: Profile[]): Record<PlanTier, Profile[]> {
  const raw: Record<PlanTier, Profile[]> = {
    ouro: [],
    prata: [],
    bronze: [],
  };
  for (const p of list) raw[tierOf(p)].push(p);
  return {
    ouro: sortWithinPlan(raw.ouro),
    prata: sortWithinPlan(raw.prata),
    bronze: sortWithinPlan(raw.bronze),
  };
}

function profilePhotos(profile: Profile): string[] {
  const list = [profile.main_image, ...(profile.gallery_images ?? [])].filter(
    (u): u is string => !!u && u.trim().length > 0,
  );
  return Array.from(new Set(list));
}

function bioSnippet(bio: string | null | undefined, max = 140): string | null {
  if (!bio?.trim()) return null;
  const t = bio.trim().replace(/\s+/g, " ");
  return t.length > max ? `${t.slice(0, max).trim()}…` : t;
}

/** Monta link WhatsApp do número cadastrado no perfil (DDI 55 se faltar). */
function profileWhatsAppLink(
  whatsapp: string | null | undefined,
  name?: string | null,
): string | null {
  if (!whatsapp) return null;
  const digits = whatsapp.replace(/\D/g, "");
  if (!digits) return null;
  const num = digits.startsWith("55") ? digits : `55${digits}`;
  const msg = encodeURIComponent(
    `Olá${name ? `, ${name}` : ""}! Vi seu perfil no AlmaPrivé e gostaria de obter mais informações.`,
  );
  return `https://wa.me/${num}?text=${msg}`;
}

const searchSchema = z.object({
  q: z.string().optional(),
});

export const Route = createFileRoute("/")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      {
        title: "Acompanhantes em Goiânia — AlmaPrivé",
      },
      {
        name: "description",
        content:
          "Encontre acompanhantes verificadas em Goiânia. Perfis com fotos reais, vídeo e contato direto no WhatsApp. Discreto e premium.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const { q } = Route.useSearch();
  const [allProfiles, setAllProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recent, setRecent] = useState<Profile[]>([]);
  const [searchInput, setSearchInput] = useState(q ?? "");
  const searchTerm = (searchInput || q || "").trim().toLowerCase();

  const [headerVisible, setHeaderVisible] = useState(true);
  const lastScrollY = useRef(0);
  const scrollDir = useRef<"up" | "down">("up");

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      if (Math.abs(y - lastScrollY.current) < 8) return;
      if (y > lastScrollY.current && y > 60) {
        if (scrollDir.current !== "down") {
          scrollDir.current = "down";
          setHeaderVisible(false);
        }
      } else if (scrollDir.current !== "up") {
        scrollDir.current = "up";
        setHeaderVisible(true);
      }
      lastScrollY.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const recentScrollRef = useRef<HTMLDivElement>(null);
  const dragState = useRef({
    isDown: false,
    startX: 0,
    scrollLeft: 0,
    moved: false,
  });

  const onDragStart = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = recentScrollRef.current;
    if (!el) return;
    dragState.current = {
      isDown: true,
      moved: false,
      startX: e.pageX - el.offsetLeft,
      scrollLeft: el.scrollLeft,
    };
  };
  const onDragEnd = () => {
    dragState.current.isDown = false;
  };
  const onDragMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!dragState.current.isDown) return;
    const el = recentScrollRef.current;
    if (!el) return;
    e.preventDefault();
    const x = e.pageX - el.offsetLeft;
    const walk = x - dragState.current.startX;
    if (Math.abs(walk) > 4) dragState.current.moved = true;
    el.scrollLeft = dragState.current.scrollLeft - walk;
  };
  const onDragClickCapture = (e: React.MouseEvent<HTMLDivElement>) => {
    if (dragState.current.moved) {
      e.preventDefault();
      e.stopPropagation();
      dragState.current.moved = false;
    }
  };

  useEffect(() => {
    setSearchInput(q ?? "");
  }, [q]);

  useEffect(() => {
    let cancelled = false;
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    supabase
      .from("profiles")
      .select("*")
      .eq("is_suspended", false)
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .limit(12)
      .then(({ data }) => {
        if (!cancelled) setRecent(data ?? []);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    supabase
      .from("profiles")
      .select("*")
      .eq("is_suspended", false)
      .order("priority_level", { ascending: false, nullsFirst: false })
      .then(({ data, error: err }) => {
        if (cancelled) return;
        if (err) setError(err.message);
        else setAllProfiles(data ?? []);
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    if (!searchTerm) return allProfiles;
    return allProfiles.filter((p) => {
      const name = (p.name ?? "").toLowerCase();
      const location = (p.location ?? "").toLowerCase();
      const services = (p.services ?? []).join(" ").toLowerCase();
      return (
        name.includes(searchTerm) ||
        location.includes(searchTerm) ||
        services.includes(searchTerm)
      );
    });
  }, [allProfiles, searchTerm]);

  const byPlan = useMemo(() => groupProfilesByPlan(filtered), [filtered]);

  const updateSearch = (value: string) => {
    setSearchInput(value);
    const url = new URL(window.location.href);
    if (value.trim()) url.searchParams.set("q", value.trim());
    else url.searchParams.delete("q");
    window.history.replaceState({}, "", url.toString());
  };

  const onlineCount = useMemo(
    () => filtered.filter((p) => p.is_online).length,
    [filtered],
  );

  return (
    <div className="min-h-screen bg-[#F4F4F6]">
      {/* HEADER sticky estilo marketplace */}
      <header
        className={`fixed top-0 left-0 right-0 z-30 border-b border-black/[0.06] bg-white/90 backdrop-blur-md transition-transform duration-300 ease-out ${
          headerVisible ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3 sm:px-5">
          <LogoButton
            size={36}
            showWordmark
            className="origin-left shrink-0 sm:scale-110"
          />
          <div className="relative mx-auto hidden w-full max-w-md sm:block">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              placeholder="Buscar por nome, bairro ou serviço"
              value={searchInput}
              onChange={(e) => updateSearch(e.target.value)}
              className="h-10 w-full rounded-full border border-black/[0.08] bg-[#F7F7F8] pl-10 pr-4 text-sm outline-none transition focus:border-[#FD297B]/40 focus:bg-white focus:ring-2 focus:ring-[#FD297B]/15"
            />
          </div>
          <Link
            to="/anuncie"
            className="ml-auto shrink-0 rounded-full bg-brand-gradient px-3.5 py-2 text-xs font-semibold text-white shadow-soft sm:ml-0 sm:px-4 sm:text-sm"
          >
            Anunciar
          </Link>
        </div>
        <div className="border-t border-black/[0.04] px-4 py-2.5 sm:hidden">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              placeholder="Nome, bairro ou serviço"
              value={searchInput}
              onChange={(e) => updateSearch(e.target.value)}
              className="h-11 w-full rounded-full border border-black/[0.08] bg-[#F7F7F8] pl-10 pr-4 text-sm outline-none focus:border-[#FD297B]/40 focus:bg-white"
            />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 pb-10 pt-[120px] sm:px-5 sm:pt-[72px]">
        {/* TÍTULO LOCAL + confiança */}
        <section className="pt-5 sm:pt-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#FD297B]">
            AlmaPrivé · Goiânia
          </p>
          <h1 className="mt-1.5 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Encontre acompanhantes em{" "}
            <span className="text-brand-gradient">Goiânia</span>
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-[15px]">
            Perfis com curadoria, fotos reais e contato direto. Discrição e
            verificação em primeiro lugar.
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <TrustChip icon={<ShieldCheck className="h-3.5 w-3.5" />}>
              Perfis verificados
            </TrustChip>
            <TrustChip>
              {loading ? "…" : `${filtered.length} anúncios`}
            </TrustChip>
            {onlineCount > 0 && (
              <TrustChip>
                <span className="online-dot mr-1.5" />
                {onlineCount} online
              </TrustChip>
            )}
            <TrustChip>Contato no WhatsApp</TrustChip>
          </div>
        </section>

        {/* FAIXA PREMIUM */}
        {byPlan.ouro.length > 0 && !loading && (
          <section className="mt-7 overflow-hidden rounded-2xl border border-[#FD297B]/20 bg-gradient-to-br from-[#FFF5F8] via-white to-[#FFF8F0] p-4 shadow-soft sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-gradient text-white shadow-glow">
                  <Sparkles className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    Destaques Premium
                  </p>
                  <p className="text-xs text-muted-foreground sm:text-sm">
                    Máxima exposição e sofisticação — escolhidos para você
                  </p>
                </div>
              </div>
              <span className="rounded-full bg-brand-gradient px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                Ouro · {byPlan.ouro.length}
              </span>
            </div>
          </section>
        )}

        {/* NOVIDADES — trilho horizontal */}
        {recent.length > 0 && (
          <section className="mt-8">
            <div className="mb-3 flex items-end justify-between">
              <div>
                <h2 className="text-base font-semibold tracking-tight sm:text-lg">
                  Recém-chegadas
                </h2>
                <p className="text-xs text-muted-foreground">
                  Publicadas nos últimos 7 dias
                </p>
              </div>
              <span className="rounded-full bg-brand-gradient px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">
                Novo
              </span>
            </div>
            <div className="relative -mx-4 sm:-mx-5">
              <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-8 bg-gradient-to-r from-[#F4F4F6] to-transparent" />
              <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-gradient-to-l from-[#F4F4F6] to-transparent" />
              <div
                ref={recentScrollRef}
                onMouseDown={onDragStart}
                onMouseLeave={onDragEnd}
                onMouseUp={onDragEnd}
                onMouseMove={onDragMove}
                onClickCapture={onDragClickCapture}
                className="flex gap-3 overflow-x-auto scroll-smooth px-4 pb-1 snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:px-5"
              >
                {recent.map((p) => (
                  <Link
                    key={p.id}
                    to="/perfil/$id"
                    params={{ id: p.id }}
                    className="group w-[148px] shrink-0 snap-start overflow-hidden rounded-2xl border border-black/[0.06] bg-white shadow-sm sm:w-[168px]"
                  >
                    <div className="relative aspect-[3/4] bg-muted">
                      {p.main_image ? (
                        <img
                          src={p.main_image}
                          alt={p.name ?? "Perfil"}
                          loading="lazy"
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                          sem foto
                        </div>
                      )}
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2.5 pt-8 text-white">
                        <p className="truncate text-sm font-semibold">
                          {p.name ?? "Sem nome"}
                          {p.age != null && (
                            <span className="font-normal opacity-90">
                              , {p.age}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {error && (
          <div className="mt-6 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {loading ? (
          <div className="mt-8 space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-52 animate-pulse rounded-2xl bg-white shadow-sm"
              />
            ))}
          </div>
        ) : (
          <div className="mt-8 space-y-10">
            {/* OURO — foto em cima, infos embaixo */}
            {byPlan.ouro.length > 0 && (
              <ListingSection
                title="Ouro"
                subtitle="Destaques premium da plataforma"
                accent="ouro"
                count={byPlan.ouro.length}
              >
                <ul className="mx-auto grid max-w-xl grid-cols-1 gap-5 sm:max-w-none sm:grid-cols-2">
                  {byPlan.ouro.map((p, i) => (
                    <ListingCard key={p.id} profile={p} tier="ouro" index={i} />
                  ))}
                </ul>
              </ListingSection>
            )}

            {/* PRATA — mesma estrutura vertical */}
            {byPlan.prata.length > 0 && (
              <ListingSection
                title="Prata"
                subtitle="Boa visibilidade e perfis em evidência"
                accent="prata"
                count={byPlan.prata.length}
              >
                <ul className="mx-auto grid max-w-xl grid-cols-1 gap-4 sm:max-w-none sm:grid-cols-2">
                  {byPlan.prata.map((p, i) => (
                    <ListingCard
                      key={p.id}
                      profile={p}
                      tier="prata"
                      index={i}
                    />
                  ))}
                </ul>
              </ListingSection>
            )}

            {/* BRONZE — mesmo modelo vertical (foto em cima, info embaixo) */}
            {byPlan.bronze.length > 0 && (
              <ListingSection
                title="Bronze"
                subtitle="Mais perfis para explorar"
                accent="bronze"
                count={byPlan.bronze.length}
              >
                <ul className="grid grid-cols-2 gap-3 sm:gap-4">
                  {byPlan.bronze.map((p, i) => (
                    <ListingCard
                      key={p.id}
                      profile={p}
                      tier="bronze"
                      index={i}
                    />
                  ))}
                </ul>
              </ListingSection>
            )}
          </div>
        )}

        {!loading && filtered.length === 0 && !error && (
          <p className="mt-12 text-center text-sm text-muted-foreground">
            Nenhum perfil encontrado para essa busca.
          </p>
        )}

        {/* CTA anunciante */}
        <section className="mt-14">
          <div className="relative overflow-hidden rounded-3xl bg-brand-gradient p-8 text-center text-white shadow-glow sm:p-12">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/80">
              Para anunciantes
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
              Quer aparecer no AlmaPrivé?
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm text-white/90">
              Curadoria humana, perfis verificados e contato direto com quem
              busca atendimento na sua região.
            </p>
            <Link
              to="/anuncie"
              className="mt-6 inline-flex rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#FD297B] shadow-soft transition hover:-translate-y-0.5"
            >
              Quero anunciar
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-black/[0.06] bg-white">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-3 px-4 py-6 text-xs text-muted-foreground sm:flex-row sm:px-5">
          <div className="flex items-center gap-2">
            <LogoButton size={22} />
            <p>
              © {new Date().getFullYear()} AlmaPrivé · Conteúdo destinado a
              maiores de 18 anos.
            </p>
          </div>
          <nav className="flex items-center gap-4">
            <Link
              to="/termos"
              className="transition-colors hover:text-foreground"
            >
              Termos de Uso
            </Link>
            <Link
              to="/privacidade"
              className="transition-colors hover:text-foreground"
            >
              Privacidade
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}

function TrustChip({
  children,
  icon,
}: {
  children: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-black/[0.06] bg-white px-3 py-1.5 text-[11px] font-medium text-foreground/80 shadow-sm">
      {icon}
      {children}
    </span>
  );
}

function ListingSection({
  title,
  subtitle,
  accent,
  count,
  children,
}: {
  title: string;
  subtitle: string;
  accent: PlanTier;
  count: number;
  children: React.ReactNode;
}) {
  const dot =
    accent === "ouro"
      ? "bg-brand-gradient"
      : accent === "prata"
        ? "bg-slate-400"
        : "bg-amber-800/70";

  return (
    <section aria-label={title}>
      <div className="mb-4 flex items-end justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className={`h-2.5 w-2.5 rounded-full ${dot}`} aria-hidden />
          <div>
            <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          </div>
        </div>
        <span className="rounded-full border border-black/[0.06] bg-white px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
          {count}
        </span>
      </div>
      {children}
    </section>
  );
}

/** Card vertical: foto em cima, informações embaixo (estilo listagem Fatal). */
function ListingCard({
  profile,
  tier,
  index = 0,
}: {
  profile: Profile;
  tier: PlanTier;
  index?: number;
}) {
  const photos = useMemo(() => profilePhotos(profile), [profile]);
  const [photoIdx, setPhotoIdx] = useState(0);
  const multi = photos.length > 1;
  const isGold = tier === "ouro";
  const isBronze = tier === "bronze";
  // Feature Black: gradiente dark no card (independente do plano)
  const isBlack = !!(profile as Profile & { is_black?: boolean }).is_black;
  const photoCount = photos.length;
  const videoCount =
    (profile.gallery_videos?.length ?? 0) + (profile.video_url ? 1 : 0);
  const services = (profile.services ?? []).slice(0, isBronze ? 2 : 3);
  const snippet = bioSnippet(
    profile.bio,
    isGold ? 130 : isBronze ? 80 : 100,
  );
  const hasLocal =
    (profile.service_location ?? []).some((s) =>
      /local|apartamento|residência|residencia/i.test(s),
    ) || false;

  // WhatsApp à mostra só em Ouro (número do cadastro do perfil)
  const waLink = isGold
    ? profileWhatsAppLink(profile.whatsapp_number, profile.name)
    : null;

  const go = (dir: -1 | 1, e?: React.SyntheticEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (!multi) return;
    setPhotoIdx((i) => (i + dir + photos.length) % photos.length);
  };

  const cardInner = (
    <>
      {/* FOTO EM CIMA */}
      <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden bg-neutral-100 sm:aspect-[5/4]">
        {photos.length > 0 ? (
          <img
            key={photos[photoIdx]}
            src={photos[photoIdx]}
            alt={profile.name ?? "Perfil"}
            loading={index < 2 ? "eager" : "lazy"}
            draggable={false}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-neutral-100 text-sm text-muted-foreground">
            sem foto
          </div>
        )}

        {/* Setas de fotos */}
        {multi && (
          <>
            <button
              type="button"
              aria-label="Foto anterior"
              onClick={(e) => go(-1, e)}
              className="absolute left-2 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/55 text-white ring-1 ring-white/20 backdrop-blur transition active:scale-95 hover:bg-black/70"
            >
              <ChevronLeft className="h-5 w-5" strokeWidth={2.5} />
            </button>
            <button
              type="button"
              aria-label="Próxima foto"
              onClick={(e) => go(1, e)}
              className="absolute right-2 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/55 text-white ring-1 ring-white/20 backdrop-blur transition active:scale-95 hover:bg-black/70"
            >
              <ChevronRight className="h-5 w-5" strokeWidth={2.5} />
            </button>
            <div className="absolute bottom-2.5 left-1/2 z-10 flex -translate-x-1/2 gap-1">
              {photos.slice(0, 8).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`Foto ${i + 1}`}
                  onClick={(e) => {
                    e.preventDefault();
                    setPhotoIdx(i);
                  }}
                  className={[
                    "h-1.5 rounded-full transition-all",
                    i === photoIdx ? "w-4 bg-white" : "w-1.5 bg-white/50",
                  ].join(" ")}
                />
              ))}
            </div>
          </>
        )}

        {/* Badges sobre a foto */}
        <div className="absolute left-2 top-2 z-10 flex flex-wrap gap-1.5">
          {isBlack && (
            <span className="rounded-full bg-black-gradient px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#C9A84C] ring-1 ring-[#C9A84C]/45 shadow-soft">
              Black
            </span>
          )}
          {isGold && (
            <span className="rounded-full bg-brand-gradient px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow-soft">
              Premium
            </span>
          )}
          {profile.is_verified && (
            <span className="inline-flex items-center gap-1 rounded-full bg-white/95 px-2 py-0.5 text-[10px] font-semibold text-foreground shadow-sm">
              <ShieldCheck
                className={[
                  "h-3 w-3",
                  isBlack ? "text-[#C9A84C]" : "text-[#FD297B]",
                ].join(" ")}
              />
              Verificado
            </span>
          )}
        </div>

        {(photoCount > 0 || videoCount > 0) && (
          <div className="absolute right-2 top-2 z-10 flex gap-1.5">
            {photoCount > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-black/55 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur">
                <Images className="h-3 w-3" />
                {photoCount}
              </span>
            )}
            {videoCount > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-black/55 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur">
                <Film className="h-3 w-3" />
                {videoCount}
              </span>
            )}
          </div>
        )}

        {(profile.is_online ?? false) && (
          <span className="absolute left-2 bottom-2 z-10 inline-flex items-center gap-1.5 rounded-full bg-black/55 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur ring-1 ring-white/15">
            <span className="online-dot" />
            Online
          </span>
        )}
      </div>

      {/* INFORMAÇÕES EMBAIXO — Black = fundo dark aqui (não moldura em volta) */}
      <div
        className={[
          "flex min-w-0 flex-1 flex-col p-3.5 sm:p-4",
          isBlack
            ? "bg-gradient-to-b from-[#141414] via-[#0c0c0c] to-[#080808] text-white"
            : "bg-white",
        ].join(" ")}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <Link
              to="/perfil/$id"
              params={{ id: profile.id }}
              className={[
                "block truncate text-base font-semibold tracking-tight sm:text-lg",
                isBlack
                  ? "text-white hover:text-[#C9A84C]"
                  : "text-foreground hover:text-[#FD297B]",
              ].join(" ")}
            >
              {profile.name ?? "Sem nome"}
              {profile.age != null && (
                <span
                  className={[
                    "font-normal",
                    isBlack ? "text-white/55" : "text-muted-foreground",
                  ].join(" ")}
                >
                  , {profile.age}
                </span>
              )}
            </Link>
            {profile.location && (
              <p
                className={[
                  "mt-0.5 flex items-center gap-1 text-xs sm:text-sm",
                  isBlack ? "text-white/55" : "text-muted-foreground",
                ].join(" ")}
              >
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{profile.location}</span>
              </p>
            )}
          </div>
          {profile.price_display && (
            <div className="shrink-0 text-right">
              <p
                className={[
                  "text-[9px] font-medium uppercase tracking-wider",
                  isBlack ? "text-white/40" : "text-muted-foreground",
                ].join(" ")}
              >
                A partir de
              </p>
              <p
                className={[
                  "text-base font-bold sm:text-lg",
                  isBlack ? "text-[#C9A84C]" : "text-brand-gradient",
                ].join(" ")}
              >
                {profile.price_display}
              </p>
            </div>
          )}
        </div>

        {services.length > 0 && (
          <ul className="mt-2.5 flex flex-wrap gap-1.5">
            {services.map((s) => (
              <li
                key={s}
                className={[
                  "rounded-full px-2.5 py-1 text-[11px] font-medium",
                  isBlack
                    ? "bg-white/10 text-white/85 ring-1 ring-white/10"
                    : "bg-[#F7F7F8] text-foreground/80",
                ].join(" ")}
              >
                {s}
              </li>
            ))}
          </ul>
        )}

        {snippet && (
          <p
            className={[
              "mt-2.5 line-clamp-2 text-sm leading-relaxed",
              isBlack ? "text-white/60" : "text-foreground/70",
            ].join(" ")}
          >
            {snippet}
          </p>
        )}

        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          {hasLocal && (
            <span
              className={[
                "rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1",
                isBlack
                  ? "bg-emerald-500/15 text-emerald-300 ring-emerald-400/25"
                  : "bg-emerald-50 text-emerald-700 ring-emerald-100",
              ].join(" ")}
            >
              Com local
            </span>
          )}
          {profile.video_url && (
            <span
              className={[
                "rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1",
                isBlack
                  ? "bg-[#C9A84C]/15 text-[#C9A84C] ring-[#C9A84C]/30"
                  : "bg-[#FFF0F5] text-[#FD297B] ring-[#FD297B]/15",
              ].join(" ")}
            >
              Vídeo verificado
            </span>
          )}
          {profile.is_pioneer && (
            <span className="rounded-full bg-[#1c1917] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#E8D9A8] ring-1 ring-[#E8D9A8]/30">
              Pioneira
            </span>
          )}
        </div>

        <div
          className={[
            "mt-3.5 flex flex-col gap-2",
            isGold && waLink ? "sm:flex-row" : "",
          ].join(" ")}
        >
          <Link
            to="/perfil/$id"
            params={{ id: profile.id }}
            className={[
              "inline-flex w-full items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold transition hover:-translate-y-0.5",
              isBlack
                ? "bg-gradient-to-r from-[#C9A84C] to-[#E8C77A] text-[#0a0a0a] shadow-soft"
                : isGold
                  ? "bg-brand-gradient text-white shadow-glow"
                  : isBronze
                    ? "border border-black/[0.08] bg-[#F7F7F8] text-foreground hover:bg-white"
                    : "bg-neutral-900 text-white hover:bg-neutral-800",
              isGold && waLink ? "sm:flex-1" : "",
            ].join(" ")}
          >
            Ver perfil
          </Link>

          {isGold && waLink && (
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#20BD5C] sm:flex-1"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              WhatsApp
            </a>
          )}
        </div>
      </div>
    </>
  );

  return (
    <li
      className={[
        "animate-fade-in-up flex flex-col overflow-hidden rounded-2xl border shadow-sm transition hover:shadow-md",
        isBlack
          ? "border-[#C9A84C]/35 bg-[#0a0a0a] shadow-[0_12px_40px_-16px_rgba(0,0,0,0.55)]"
          : isGold
            ? "border-[#FD297B]/25 bg-white shadow-[0_8px_30px_-12px_rgba(253,41,123,0.35)]"
            : "border-black/[0.06] bg-white",
      ].join(" ")}
      style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}
    >
      {cardInner}
    </li>
  );
}
