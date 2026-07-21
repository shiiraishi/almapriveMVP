import { useEffect, useState, useCallback } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { X, ChevronLeft, ChevronRight, Play, Images, Film } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { Logo } from "@/components/Logo";
import { ReportProfileButton } from "@/components/ReportProfileButton";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type ProfileExtended = Profile & {
  service_location?: string[] | null;
  payment_methods?: string[] | null;
  cover_image?: string | null;
  services_not_offered?: string[] | null;
  availability?: string | null;
  is_online?: boolean | null;
  video_360_url?: string | null;
  gallery_videos?: string[] | null;
  height_cm?: number | null;
  weight_kg?: number | null;
  dress_size?: string | null;
  eye_color?: string | null;
  hair_color?: string | null;
  has_silicone?: boolean | null;
  has_tattoo?: boolean | null;
  has_piercing?: boolean | null;
  is_pioneer?: boolean | null;
};

const isMp4 = (url: string) => /\.mp4(\?.*)?$/i.test(url);

export const Route = createFileRoute("/perfil/$id")({
  head: () => ({
    meta: [
      { title: "Perfil" },
      { name: "description", content: "Detalhes do perfil." },
    ],
  }),
  component: ProfilePage,
  errorComponent: ({ error }) => (
    <div className="mx-auto max-w-2xl px-6 py-16 text-center">
      <h1 className="text-2xl font-medium">Erro ao carregar perfil</h1>
      <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
      <Link to="/" className="mt-6 inline-block text-sm underline">
        Voltar para a Home
      </Link>
    </div>
  ),
  notFoundComponent: () => (
    <div className="mx-auto max-w-2xl px-6 py-16 text-center">
      <h1 className="text-2xl font-medium">Perfil não encontrado</h1>
      <Link to="/" className="mt-6 inline-block text-sm underline">
        Voltar para a Home
      </Link>
    </div>
  ),
});

function ProfilePage() {
  const { id } = Route.useParams();
  const [profile, setProfile] = useState<ProfileExtended | null>(null);
  const [goldSuggestions, setGoldSuggestions] = useState<ProfileExtended[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [mediaTab, setMediaTab] = useState<"fotos" | "videos">("fotos");
  const [videoLightbox, setVideoLightbox] = useState<string | null>(null);
  const [showWaModal, setShowWaModal] = useState(false);

  // Status online exclusivo Ouro: "Online agora" ou "Online há X min" (0–20)
  const [goldOnlineLabel] = useState<string>(() => {
    const m = Math.floor(Math.random() * 21);
    return m === 0 ? "Online agora" : `Online há ${m} ${m === 1 ? "minuto" : "minutos"}`;
  });
  // Contador de visualizações — estável por perfil/dia via localStorage
  const todayKey = new Date().toISOString().slice(0, 10);
  const viewStorageKey = `ap_views_${id}_${todayKey}`;
  const [viewCount] = useState<number>(() => {
    try {
      const stored = localStorage.getItem(viewStorageKey);
      if (stored) return parseInt(stored, 10);
    } catch { /* storage disabled */ }
    const value = Math.floor(300 + Math.random() * 701);
    try {
      localStorage.setItem(viewStorageKey, String(value));
    } catch { /* storage disabled */ }
    return value;
  });

  const gallery = profile?.gallery_images ?? [];

  const closeLightbox = useCallback(() => setLightboxIndex(null), []);
  const prevImage = useCallback(() => {
    setLightboxIndex((i) => (i === null ? i : (i - 1 + gallery.length) % gallery.length));
  }, [gallery.length]);
  const nextImage = useCallback(() => {
    setLightboxIndex((i) => (i === null ? i : (i + 1) % gallery.length));
  }, [gallery.length]);

  useEffect(() => {
    if (lightboxIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      else if (e.key === "ArrowLeft") prevImage();
      else if (e.key === "ArrowRight") nextImage();
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [lightboxIndex, closeLightbox, prevImage, nextImage]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    supabase
      .from("profiles")
      .select("*")
      .eq("id", id)
      .eq("is_suspended", false)
      .maybeSingle()
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) setError(error.message);
        else setProfile(data);
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  // Sugestões de perfis Ouro (não exibe quando o próprio é Ouro)
  useEffect(() => {
    if (!profile) return;
    if ((profile.priority_level ?? 0) >= 3) {
      setGoldSuggestions([]);
      return;
    }
    let cancelled = false;
    supabase
      .from("profiles")
      .select("*")
      .gte("priority_level", 3)
      .neq("id", profile.id)
      .limit(30)
      .then(({ data }) => {
        if (cancelled || !data) return;
        const shuffled = [...data].sort(() => Math.random() - 0.5).slice(0, 6);
        setGoldSuggestions(shuffled);
      });
    return () => {
      cancelled = true;
    };
  }, [profile]);

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-10">
        <div className="h-4 w-20 animate-pulse rounded bg-muted" />
        <div className="mt-8 aspect-video w-full animate-pulse rounded-2xl bg-muted" />
        <div className="mt-10 grid grid-cols-1 gap-10 md:grid-cols-2">
          <div className="aspect-[4/5] w-full animate-pulse rounded-2xl bg-muted" />
          <div className="space-y-4">
            <div className="h-7 w-2/3 animate-pulse rounded bg-muted" />
            <div className="h-4 w-1/3 animate-pulse rounded bg-muted" />
            <div className="h-20 w-full animate-pulse rounded-2xl bg-muted" />
            <div className="h-4 w-full animate-pulse rounded bg-muted" />
            <div className="h-4 w-5/6 animate-pulse rounded bg-muted" />
            <div className="mt-4 h-12 w-full animate-pulse rounded-2xl bg-muted" />
          </div>
        </div>
      </div>
    );
  }

  if (error) throw new Error(error);
  if (!profile) throw notFound();

  let waNumber: string | null = null;
  if (profile.whatsapp_number) {
    const digits = profile.whatsapp_number.replace(/\D/g, "");
    if (digits) waNumber = digits.startsWith("55") ? digits : `55${digits}`;
  }
  const waMessage =
    "Olá! Vi seu perfil no AlmaPrivé e gostaria de obter mais informações.";
  const waLink = waNumber
    ? `https://wa.me/${waNumber}?text=${encodeURIComponent(waMessage)}`
    : null;

  const isVideoFile = profile.video_url ? /\.mp4(\?.*)?$/i.test(profile.video_url) : false;
  const level = profile.priority_level ?? 0;
  const isGold = level >= 3;
  // Experiência unificada: todos os perfis exibem a mesma estrutura premium
  // dentro da página. A diferenciação entre planos vive apenas na Home/cards
  // e nos mecanismos de exposição (ex.: sugestões Ouro).
  const showOnline = profile.is_online ?? true;
  const coverImage = profile.cover_image ?? profile.main_image ?? null;
  const limitedGallery = profile.gallery_images ?? [];
  const limitedBio = profile.bio;
  const isPioneer = !!(profile as ProfileExtended & { is_pioneer?: boolean | null }).is_pioneer;

  // Galeria de vídeos: exclui o vídeo de apresentação (já em destaque no topo)
  const galleryVideos = (profile.gallery_videos ?? []).filter(
    (v) => v && v !== profile.video_url
  );
  const photoCount = limitedGallery.length;
  const videoCount = galleryVideos.length;
  const hasMedia = photoCount > 0 || videoCount > 0;

  return (
    <div className="min-h-screen bg-[#F7F7F8]">
      <div className="animate-fade-in-up mx-auto max-w-3xl px-4 sm:px-6 py-6 sm:py-10">
        <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors">
          ← Voltar
        </Link>

        {/* CAPA — padrão premium para todos os perfis */}
        {coverImage && (
          <div className="mt-4 overflow-hidden rounded-3xl shadow-soft border border-black/[0.04] relative">
            <img
              src={coverImage}
              alt="Capa do perfil"
              loading="eager"
              className="aspect-[16/7] w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/0 to-black/0" />
            {isGold && (
              <span className="absolute top-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-black/60 backdrop-blur-md px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-white ring-1 ring-white/20">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2l2.6 5.4 5.9.6-4.4 4 1.2 5.8L12 15l-5.3 2.8 1.2-5.8-4.4-4 5.9-.6L12 2z" fill="#FFD166"/>
                </svg>
                Destaque Premium
              </span>
            )}
            {/* Botão denunciar — desktop (canto superior direito) */}
            <div className="absolute top-3 left-3 hidden sm:block">
              <ReportProfileButton
                profileId={profile.id}
                profileName={profile.name ?? null}
                variant="floating"
              />
            </div>
          </div>
        )}

        {/* HEADER do perfil — estilo rede social */}
        <section
          className={[
            "rounded-3xl bg-white p-5 sm:p-7 shadow-soft border border-black/[0.04] relative",
            coverImage ? "mt-[-40px] sm:mt-[-56px] relative z-10" : "mt-6",
            "gold-glow-soft",
          ].join(" ")}
        >
          <div className="flex items-center gap-4 sm:gap-5">
            <div
              className={[
                "relative shrink-0 overflow-hidden rounded-full bg-muted",
                "h-24 w-24 sm:h-28 sm:w-28",
                "gold-border-animated",
              ].join(" ")}
            >
              {profile.main_image ? (
                <img
                  src={profile.main_image}
                  alt={profile.name ?? "Perfil"}
                  loading="eager"
                  decoding="async"
                  fetchPriority="high"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                  sem foto
                </div>
              )}
              {showOnline && (
                <span className="online-dot absolute bottom-1 right-1 block h-4 w-4 rounded-full bg-emerald-500 ring-2 ring-white" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-baseline gap-x-2">
                <h1 className="truncate text-xl sm:text-2xl font-semibold tracking-tight">
                  {profile.name ?? "Sem nome"}
                </h1>
                {profile.age != null && (
                  <span className="text-lg sm:text-xl font-light text-muted-foreground">
                    {profile.age}
                  </span>
                )}
              </div>
              {profile.location && (
                <p className="mt-0.5 text-sm text-muted-foreground">📍 {profile.location}</p>
              )}
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                {profile.is_verified && (
                  <span
                    className="inline-flex items-center gap-1 rounded-full bg-brand-gradient text-white shadow-soft px-2.5 py-0.5 text-[11px] font-semibold"
                  >
                    ✓ Verificada
                  </span>
                )}
                {isPioneer && (
                  <span
                    className="inline-flex items-center gap-1 rounded-full bg-[#1c1917] px-2.5 py-0.5 text-[11px] font-semibold text-[#E8D9A8] ring-1 ring-[#E8D9A8]/30"
                    title="Anunciante pioneira do AlmaPrivé"
                  >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                      <path d="M12 2l2.6 5.4 5.9.6-4.4 4 1.2 5.8L12 15l-5.3 2.8 1.2-5.8-4.4-4 5.9-.6L12 2z" />
                    </svg>
                    Pioneira
                  </span>
                )}
                {showOnline && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-200">
                    <span className="online-dot block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    {isGold ? goldOnlineLabel : "Online agora"}
                  </span>
                )}
              </div>
              {isGold && (
                <p className="mt-1.5 text-[11px] font-medium text-muted-foreground">
                  👁 {viewCount.toLocaleString("pt-BR")} visualizações
                </p>
              )}
            </div>
          </div>

          {profile.price_display && (
            <div className="mt-5 flex items-center justify-between rounded-2xl bg-[#F7F7F8] px-4 py-3">
              <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Valor
              </span>
              <span className="text-xl font-bold text-brand-gradient">
                {profile.price_display}
              </span>
            </div>
          )}
        </section>

        {/* Botão denunciar — mobile (abaixo das informações principais) */}
        <div className="mt-3 flex justify-end sm:hidden">
          <ReportProfileButton
            profileId={profile.id}
            profileName={profile.name ?? null}
            variant="inline"
          />
        </div>

        {/* VÍDEO DE APRESENTAÇÃO — obrigatório, formato mobile 9:16 */}
        {profile.video_url && (
          <section className="mt-6">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Vídeo de apresentação
              </h2>
              <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-foreground shadow-soft border border-black/[0.04]">
                ✓ Autenticidade verificada
              </span>
            </div>
            <div
              className={[
                "mx-auto overflow-hidden rounded-3xl bg-black shadow-soft relative max-w-sm sm:max-w-md",
                "gold-border-animated gold-glow-soft p-[3px]",
              ].join(" ")}
            >
              {isVideoFile ? (
                <video
                  src={profile.video_url}
                  controls
                  playsInline
                  preload="metadata"
                  className="aspect-[9/16] w-full bg-black object-cover rounded-[20px]"
                />
              ) : (
                <iframe
                  src={profile.video_url}
                  title="Vídeo de apresentação"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="aspect-[9/16] w-full rounded-[20px]"
                />
              )}
              <span className="absolute top-3 left-3 z-10 inline-flex items-center gap-1 rounded-full bg-black/60 backdrop-blur-md px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white ring-1 ring-white/20">
                ✓ Perfil Verificado por Vídeo
              </span>
            </div>
          </section>
        )}


        {/* BIO */}
        {profile.bio && (
          <section className="mt-6 rounded-3xl bg-white p-5 sm:p-7 shadow-soft border border-black/[0.04]">
            <h2 className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Sobre
            </h2>
            <p
              className="whitespace-pre-line leading-[1.75] text-foreground/90 text-base"
            >
              {limitedBio}
            </p>
          </section>
        )}

        {/* CARACTERÍSTICAS FÍSICAS */}
        {(profile.height_cm || profile.weight_kg || profile.dress_size ||
          profile.eye_color || profile.hair_color ||
          profile.has_silicone != null || profile.has_tattoo != null || profile.has_piercing != null) && (
          <section className="mt-6 rounded-3xl bg-white p-5 sm:p-7 shadow-soft border border-black/[0.04]">
            <h2 className="mb-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Características
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {profile.height_cm && (
                <div className="rounded-2xl bg-[#F7F7F8] px-4 py-3">
                  <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Altura</p>
                  <p className="mt-1 text-base font-semibold text-foreground">{(profile.height_cm / 100).toFixed(2).replace('.', ',')}m</p>
                </div>
              )}
              {profile.weight_kg && (
                <div className="rounded-2xl bg-[#F7F7F8] px-4 py-3">
                  <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Peso</p>
                  <p className="mt-1 text-base font-semibold text-foreground">{profile.weight_kg}kg</p>
                </div>
              )}
              {profile.dress_size && (
                <div className="rounded-2xl bg-[#F7F7F8] px-4 py-3">
                  <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Manequim</p>
                  <p className="mt-1 text-base font-semibold text-foreground">{profile.dress_size}</p>
                </div>
              )}
              {profile.eye_color && (
                <div className="rounded-2xl bg-[#F7F7F8] px-4 py-3">
                  <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Olhos</p>
                  <p className="mt-1 text-base font-semibold text-foreground">{profile.eye_color}</p>
                </div>
              )}
              {profile.hair_color && (
                <div className="rounded-2xl bg-[#F7F7F8] px-4 py-3">
                  <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Cabelo</p>
                  <p className="mt-1 text-base font-semibold text-foreground">{profile.hair_color}</p>
                </div>
              )}
              {profile.has_silicone != null && (
                <div className="rounded-2xl bg-[#F7F7F8] px-4 py-3">
                  <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Silicone</p>
                  <p className="mt-1 text-base font-semibold text-foreground">{profile.has_silicone ? "Sim" : "Não"}</p>
                </div>
              )}
              {profile.has_tattoo != null && (
                <div className="rounded-2xl bg-[#F7F7F8] px-4 py-3">
                  <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Tatuagem</p>
                  <p className="mt-1 text-base font-semibold text-foreground">{profile.has_tattoo ? "Sim" : "Não"}</p>
                </div>
              )}
              {profile.has_piercing != null && (
                <div className="rounded-2xl bg-[#F7F7F8] px-4 py-3">
                  <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Piercing</p>
                  <p className="mt-1 text-base font-semibold text-foreground">{profile.has_piercing ? "Sim" : "Não"}</p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* SERVIÇOS */}
        {profile.services && profile.services.length > 0 && (
          <section className="mt-6 rounded-3xl bg-white p-5 sm:p-7 shadow-soft border border-black/[0.04]">
            <h2 className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Serviços realizados
            </h2>
            <ul className="flex flex-wrap gap-2">
              {profile.services.map((s) => (
                <li
                  key={s}
                  className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 text-emerald-700 px-3.5 py-1.5 text-sm font-medium ring-1 ring-emerald-200"
                >
                  <span className="text-emerald-500">✓</span>
                  {s}
                </li>
              ))}
            </ul>
            {profile.services_not_offered && profile.services_not_offered.length > 0 && (
              <>
                <h3 className="mt-5 mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Não realiza
                </h3>
                <ul className="flex flex-wrap gap-2">
                  {profile.services_not_offered.map((s) => (
                    <li
                      key={s}
                      className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 text-rose-700 px-3.5 py-1.5 text-sm font-medium ring-1 ring-rose-200 line-through decoration-rose-300/70"
                    >
                      <span className="text-rose-500 no-underline">✕</span>
                      {s}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </section>
        )}

        {/* HORÁRIOS DE ATENDIMENTO */}
        {profile.availability && (
          <section className="mt-6 rounded-3xl bg-white p-5 sm:p-7 shadow-soft border border-black/[0.04]">
            <h2 className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Horários de atendimento
            </h2>
            <div className="flex items-start gap-3 rounded-2xl bg-[#F7F7F8] p-4">
              <span className="text-xl">🕐</span>
              <p className="whitespace-pre-line text-sm leading-relaxed text-foreground/90">
                {profile.availability}
              </p>
            </div>
          </section>
        )}

        {/* LOCAIS DE ATENDIMENTO */}
        {profile.service_location && profile.service_location.length > 0 && (
          <section className="mt-6 rounded-3xl bg-white p-5 sm:p-7 shadow-soft border border-black/[0.04]">
            <h2 className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Locais de atendimento
            </h2>
            <ul className="flex flex-wrap gap-2">
              {profile.service_location.map((s) => (
                <li
                  key={s}
                  className="rounded-full bg-[#F7F7F8] px-3.5 py-1.5 text-sm font-medium text-foreground"
                >
                  {s}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* FORMAS DE PAGAMENTO */}
        {profile.payment_methods && profile.payment_methods.length > 0 && (
          <section className="mt-6 rounded-3xl bg-white p-5 sm:p-7 shadow-soft border border-black/[0.04]">
            <h2 className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Formas de pagamento
            </h2>
            <ul className="flex flex-wrap gap-2">
              {profile.payment_methods.map((p) => (
                <li
                  key={p}
                  className="rounded-full bg-[#F7F7F8] px-3.5 py-1.5 text-sm font-medium text-foreground"
                >
                  {p}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* CTA WhatsApp desktop */}
        {waLink && (
          <section className="mt-6 hidden md:block">
            <div className="mx-auto w-full max-w-md rounded-3xl bg-white p-6 shadow-soft border border-black/[0.04]">
              <p className="mb-3 text-center text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Atendimento direto e discreto
              </p>
              <button
                type="button"
                onClick={() => setShowWaModal(true)}
                className="flex w-full items-center justify-center rounded-2xl bg-[#25D366] px-6 py-4 text-center text-base font-semibold text-white shadow-lg transition-transform hover:scale-[1.02] hover:bg-[#20BD5C]"
              >
                Falar no WhatsApp
              </button>
              <p className="mt-2 text-center text-[11px] text-muted-foreground">
                Perfis verificados com contato real
              </p>
            </div>
          </section>
        )}

        {/* MÍDIA — tabs Fotos / Vídeos (padrão rede social premium) */}
        {hasMedia && (
          <section className="mt-6 rounded-3xl bg-white p-5 sm:p-7 shadow-soft border border-black/[0.04]">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Mídia
              </h2>
              <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                {photoCount + videoCount} {photoCount + videoCount === 1 ? "item" : "itens"}
              </span>
            </div>

            {/* Tabs */}
            <div className="mb-5 inline-flex w-full rounded-full bg-[#F2F2F4] p-1 sm:w-auto">
              <button
                type="button"
                onClick={() => setMediaTab("fotos")}
                className={[
                  "flex flex-1 items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-200 sm:flex-none",
                  mediaTab === "fotos"
                    ? "bg-white text-foreground shadow-soft"
                    : "text-muted-foreground hover:text-foreground",
                ].join(" ")}
                aria-pressed={mediaTab === "fotos"}
              >
                <Images className="h-4 w-4" />
                Fotos
                <span
                  className={[
                    "rounded-full px-2 py-0.5 text-[10px] font-bold",
                    mediaTab === "fotos" ? "bg-brand-gradient text-white" : "bg-black/5 text-foreground/70",
                  ].join(" ")}
                >
                  {photoCount}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setMediaTab("videos")}
                className={[
                  "flex flex-1 items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-200 sm:flex-none",
                  mediaTab === "videos"
                    ? "bg-white text-foreground shadow-soft"
                    : "text-muted-foreground hover:text-foreground",
                ].join(" ")}
                aria-pressed={mediaTab === "videos"}
              >
                <Film className="h-4 w-4" />
                Vídeos
                <span
                  className={[
                    "rounded-full px-2 py-0.5 text-[10px] font-bold",
                    mediaTab === "videos" ? "bg-brand-gradient text-white" : "bg-black/5 text-foreground/70",
                  ].join(" ")}
                >
                  {videoCount}
                </span>
              </button>
            </div>

            {/* Painel: Fotos */}
            {mediaTab === "fotos" && (
              <div className="animate-fade-in-up">
                {photoCount === 0 ? (
                  <p className="py-10 text-center text-sm text-muted-foreground">
                    Nenhuma foto disponível ainda.
                  </p>
                ) : (
                  <div className="grid grid-cols-3 gap-2 sm:gap-3">
                    {limitedGallery.map((src, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setLightboxIndex(i)}
                        className="group block overflow-hidden rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        aria-label={`Abrir foto ${i + 1}`}
                      >
                        <img
                          src={src}
                          alt={`Foto ${i + 1}`}
                          loading="lazy"
                          decoding="async"
                          className="aspect-square w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Painel: Vídeos */}
            {mediaTab === "videos" && (
              <div className="animate-fade-in-up">
                {videoCount === 0 ? (
                  <p className="py-10 text-center text-sm text-muted-foreground">
                    Nenhum vídeo adicional disponível.
                  </p>
                ) : (
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3">
                    {galleryVideos.map((src, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setVideoLightbox(src)}
                        className="group relative block overflow-hidden rounded-2xl bg-black focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        aria-label={`Abrir vídeo ${i + 1}`}
                      >
                        {isMp4(src) ? (
                          <video
                            src={src}
                            muted
                            playsInline
                            preload="metadata"
                            className="aspect-[3/4] w-full object-cover opacity-90 transition-transform duration-500 group-hover:scale-[1.04]"
                          />
                        ) : (
                          <div className="aspect-[3/4] w-full bg-gradient-to-br from-black/80 to-black/50" />
                        )}
                        <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                        <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
                          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/95 text-foreground shadow-glow transition-transform group-hover:scale-110">
                            <Play className="ml-0.5 h-5 w-5 fill-current" />
                          </span>
                        </span>
                        <span className="pointer-events-none absolute bottom-2 left-2 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur">
                          Vídeo {i + 1}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </section>
        )}

        {/* extra spacing so fixed mobile CTA never covers content */}
        {/* SUGESTÕES OURO — apenas em perfis Prata/Bronze */}
        {goldSuggestions.length > 0 && (
          <section className="mt-8">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold tracking-tight text-foreground">
                Veja também acompanhantes <span className="text-brand-gradient">Ouro</span>
              </h2>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Premium
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {goldSuggestions.map((g) => (
                <Link
                  key={g.id}
                  to="/perfil/$id"
                  params={{ id: g.id }}
                  className="group block overflow-hidden rounded-2xl bg-white shadow-soft gold-border-animated"
                >
                  <div className="relative">
                    {g.main_image ? (
                      <img
                        src={g.main_image}
                        alt={g.name ?? "Perfil Ouro"}
                        loading="lazy"
                        className="aspect-[4/5] w-full rounded-[14px] object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                      />
                    ) : (
                      <div className="flex aspect-[4/5] w-full items-center justify-center rounded-[14px] bg-muted text-xs text-muted-foreground">
                        sem foto
                      </div>
                    )}
                    <span className="absolute top-2 left-2 rounded-full bg-brand-gradient px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-white shadow-soft">
                      Ouro
                    </span>
                    <div className="absolute inset-x-0 bottom-0 rounded-b-[14px] bg-gradient-to-t from-black/70 to-transparent p-2">
                      <p className="truncate text-xs font-semibold text-white">
                        {g.name ?? "—"}
                        {g.age != null && <span className="ml-1 font-light opacity-80">{g.age}</span>}
                      </p>
                      {g.location && (
                        <p className="truncate text-[10px] text-white/80">{g.location}</p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        <div className="h-28 md:hidden" />
        </div>

      {/* Gallery Lightbox */}
      {lightboxIndex !== null && gallery[lightboxIndex] && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md animate-fade-in"
          onClick={closeLightbox}
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); closeLightbox(); }}
            className="absolute right-4 top-4 z-10 rounded-full bg-white/10 p-2.5 text-white backdrop-blur transition hover:bg-white/20"
            aria-label="Fechar"
          >
            <X className="h-5 w-5" />
          </button>

          {gallery.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); prevImage(); }}
                className="absolute left-2 sm:left-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/10 p-2.5 text-white backdrop-blur transition hover:bg-white/20"
                aria-label="Foto anterior"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); nextImage(); }}
                className="absolute right-2 sm:right-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/10 p-2.5 text-white backdrop-blur transition hover:bg-white/20"
                aria-label="Próxima foto"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}

          <img
            key={lightboxIndex}
            src={gallery[lightboxIndex]}
            alt={`Galeria ${lightboxIndex + 1}`}
            onClick={(e) => e.stopPropagation()}
            onTouchStart={(e) => setTouchStartX(e.touches[0].clientX)}
            onTouchEnd={(e) => {
              if (touchStartX === null) return;
              const dx = e.changedTouches[0].clientX - touchStartX;
              if (Math.abs(dx) > 50) {
                if (dx < 0) nextImage();
                else prevImage();
              }
              setTouchStartX(null);
            }}
            className="max-h-[90vh] max-w-[92vw] object-contain animate-scale-in select-none"
            draggable={false}
          />

          {gallery.length > 1 && (
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-3 py-1 text-xs text-white backdrop-blur">
              {lightboxIndex + 1} / {gallery.length}
            </div>
          )}
        </div>
      )}

      {/* Fixed mobile CTA — always visible */}
      {waLink && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border/60 bg-background/90 px-4 py-3 backdrop-blur md:hidden">
          <p className="mb-1 text-center text-[11px] font-medium text-muted-foreground">
            Atendimento direto e discreto
          </p>
            <button
              type="button"
              onClick={() => setShowWaModal(true)}
              className="flex w-full items-center justify-center rounded-2xl bg-[#25D366] px-6 py-3 text-center text-sm font-semibold text-white shadow-lg transition-transform hover:scale-[1.02] hover:bg-[#20BD5C]"
            >
              Falar no WhatsApp
            </button>
          <p className="mt-1 text-center text-[10px] text-muted-foreground">
            Perfis verificados com contato real
          </p>
        </div>
      )}

      {/* Video Lightbox — reprodução dentro do perfil */}
      {videoLightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md animate-fade-in"
          onClick={() => setVideoLightbox(null)}
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setVideoLightbox(null); }}
            className="absolute right-4 top-4 z-10 rounded-full bg-white/10 p-2.5 text-white backdrop-blur transition hover:bg-white/20"
            aria-label="Fechar vídeo"
          >
            <X className="h-5 w-5" />
          </button>
          <div
            className="relative max-h-[90vh] w-full max-w-md overflow-hidden rounded-3xl bg-black shadow-glow"
            onClick={(e) => e.stopPropagation()}
          >
            {isMp4(videoLightbox) ? (
              <video
                src={videoLightbox}
                controls
                autoPlay
                playsInline
                className="aspect-[9/16] w-full bg-black object-contain"
              />
            ) : (
              <iframe
                src={videoLightbox}
                title="Vídeo"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="aspect-[9/16] w-full"
              />
            )}
          </div>
        </div>
      )}

      {/* WhatsApp warning modal */}
      {showWaModal && waLink && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setShowWaModal(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="relative mx-4 w-full max-w-sm rounded-3xl bg-white p-7 shadow-glow animate-fade-in-up"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setShowWaModal(false)}
              className="absolute right-4 top-4 rounded-full p-1.5 text-muted-foreground/70 transition hover:bg-black/5 hover:text-foreground"
              aria-label="Fechar"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="mb-6 flex flex-col items-center">
              <Logo size={40} showWordmark={false} alt="AlmaPrivé" />
              <span className="mt-2 text-sm font-semibold tracking-tight text-foreground">
                AlmaPrivé
              </span>
            </div>

            <p className="text-center text-sm leading-relaxed text-foreground/80">
              Ao continuar para o WhatsApp, as negociações ocorrem fora do AlmaPrivé, e não nos responsabilizamos por elas. Tome cuidado e, se houver qualquer problema, denuncie.
            </p>

            <div className="mt-6">
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setShowWaModal(false)}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#25D366] px-6 py-3.5 text-center text-sm font-semibold text-white shadow-lg transition-transform hover:scale-[1.02] hover:bg-[#20BD5C]"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                Continuar para o WhatsApp
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}