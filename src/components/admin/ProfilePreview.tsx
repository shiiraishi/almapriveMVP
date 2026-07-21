import { useMemo, useState } from "react";
import { X, Play, Images, Film } from "lucide-react";
import type { ProfileFormValues } from "./ProfileForm";

type EditSection =
  | "basico"
  | "servicos"
  | "caracteristicas"
  | "midia"
  | "publicacao";

function validate(v: ProfileFormValues): string[] {
  const missing: string[] = [];
  if (!v.main_image) missing.push("Foto de perfil");
  if (!v.cover_image) missing.push("Foto de capa");
  if (!v.video_url) missing.push("Vídeo de apresentação");
  if (!v.whatsapp_number?.trim()) missing.push("WhatsApp");
  if (!v.plan) missing.push("Plano");
  if (!v.cadastro_type) missing.push("Tipo do cadastro");
  if (!v.name?.trim()) missing.push("Nome");
  if (v.age == null) missing.push("Idade");
  if (!v.location?.trim()) missing.push("Cidade");
  return missing;
}

function isMp4(url: string) {
  return /\.mp4(\?.*)?$/i.test(url);
}

function EditBtn({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1 rounded-full bg-black/70 px-3 py-1 text-[11px] font-medium text-white backdrop-blur hover:bg-black/85"
    >
      {label}
    </button>
  );
}

export function ProfilePreview({
  open,
  values,
  onClose,
  onEdit,
  onSaveDraft,
  onPublish,
  saving,
}: {
  open: boolean;
  values: ProfileFormValues;
  onClose: () => void;
  onEdit: (section: EditSection) => void;
  onSaveDraft: () => void;
  onPublish: () => void;
  saving?: boolean;
}) {
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const [tab, setTab] = useState<"fotos" | "videos">("fotos");
  const missing = useMemo(() => validate(values), [values]);

  if (!open) return null;

  const v = values;
  const galleryVideos = (v.gallery_videos ?? []).filter(
    (x) => x && x !== v.video_url,
  );
  const photoCount = v.gallery_images.length;
  const videoCount = galleryVideos.length;
  const hasMedia = photoCount + videoCount > 0;
  const showOnline = v.is_online;
  const isGold = v.plan === "ouro";
  const isBlack = !!v.is_black;

  const frameWidth =
    device === "mobile" ? "max-w-[420px]" : "max-w-[900px]";

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/95 backdrop-blur">
      {/* Top bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-black/80 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-white">
            Pré-visualização do perfil
          </span>
          <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-white/70">
            somente visualização
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-full bg-white/10 p-1">
            {(["desktop", "mobile"] as const).map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDevice(d)}
                className={[
                  "rounded-full px-3 py-1 text-xs font-medium capitalize",
                  device === d
                    ? "bg-white text-black"
                    : "text-white/70 hover:text-white",
                ].join(" ")}
              >
                {d}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
            aria-label="Fechar pré-visualização"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Validation banner */}
      {missing.length > 0 && (
        <div className="border-b border-amber-500/30 bg-amber-500/10 px-4 py-2 text-xs text-amber-200">
          <span className="font-semibold">Pendências para publicação: </span>
          {missing.join(" · ")}
        </div>
      )}

      {/* Preview surface */}
      <div className="flex-1 overflow-y-auto">
        <div className={`mx-auto w-full ${frameWidth} px-3 py-6`}>
          <div className="overflow-hidden rounded-3xl bg-[#F7F7F8] shadow-2xl">
            <div className="p-4 sm:p-6">
              {/* COVER */}
              <div className="relative overflow-hidden rounded-3xl border border-black/[0.04] bg-black/10">
                {v.cover_image ? (
                  <img
                    src={v.cover_image}
                    alt="Capa"
                    className="aspect-[16/7] w-full object-cover"
                  />
                ) : (
                  <div className="flex aspect-[16/7] w-full items-center justify-center text-xs text-white/60">
                    Sem foto de capa
                  </div>
                )}
                <div className="absolute right-2 top-2">
                  <EditBtn
                    label="🖼️ Editar fotos"
                    onClick={() => onEdit("midia")}
                  />
                </div>
              </div>

              {/* HEADER */}
              <section className="relative -mt-10 rounded-3xl border border-black/[0.04] bg-white p-5 shadow-sm">
                <div className="absolute right-3 top-3">
                  <EditBtn
                    label="✏️ Editar informações básicas"
                    onClick={() => onEdit("basico")}
                  />
                </div>
                <div className="flex items-center gap-4">
                  <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full bg-black/10">
                    {v.main_image ? (
                      <img
                        src={v.main_image}
                        alt={v.name ?? "Perfil"}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[10px] text-black/50">
                        sem foto
                      </div>
                    )}
                    {showOnline && (
                      <span className="absolute bottom-1 right-1 block h-4 w-4 rounded-full bg-emerald-500 ring-2 ring-white" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline gap-x-2">
                      <h1 className="truncate text-xl font-semibold">
                        {v.name || "Sem nome"}
                      </h1>
                      {v.age != null && (
                        <span className="text-lg font-light text-black/60">
                          {v.age}
                        </span>
                      )}
                    </div>
                    {v.location && (
                      <p className="mt-0.5 text-sm text-black/60">
                        📍 {v.location}
                      </p>
                    )}
                    <div className="mt-2 flex flex-wrap items-center gap-1.5">
                      <span
                        className={[
                          "rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize",
                          v.plan === "ouro"
                            ? "bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-black"
                            : v.plan === "prata"
                              ? "bg-slate-300 text-slate-900"
                              : "bg-amber-700/20 text-amber-900",
                        ].join(" ")}
                      >
                        {v.plan}
                      </span>
                      {isBlack && (
                        <span className="rounded-full bg-gradient-to-r from-[#0a0a0a] to-[#2a2a2a] px-2.5 py-0.5 text-[11px] font-semibold text-[#C9A84C] ring-1 ring-[#C9A84C]/40">
                          Black
                        </span>
                      )}
                      {v.is_verified && (
                        <span className="rounded-full bg-emerald-600 px-2.5 py-0.5 text-[11px] font-semibold text-white">
                          ✓ Verificada
                        </span>
                      )}
                      {v.is_pioneer && (
                        <span className="rounded-full bg-[#1c1917] px-2.5 py-0.5 text-[11px] font-semibold text-[#E8D9A8] ring-1 ring-[#E8D9A8]/30">
                          ★ Pioneira
                        </span>
                      )}
                      {showOnline && (
                        <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-200">
                          Online agora
                        </span>
                      )}
                      {v.cadastro_type === "partnership" && (
                        <span className="rounded-full bg-[#D4AF37]/20 px-2.5 py-0.5 text-[11px] font-semibold text-[#8a6d1a]">
                          🤝 Parceira
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                {v.price_display && (
                  <div className="mt-4 flex items-center justify-between rounded-2xl bg-[#F7F7F8] px-4 py-3">
                    <span className="text-[11px] font-medium uppercase tracking-wider text-black/60">
                      Valor
                    </span>
                    <span className="text-lg font-bold text-[#B8860B]">
                      {v.price_display}
                    </span>
                  </div>
                )}
              </section>

              {/* MAIN VIDEO */}
              {v.video_url && (
                <section className="relative mt-6">
                  <div className="mb-2 flex items-center justify-between">
                    <h2 className="text-xs font-medium uppercase tracking-wider text-black/60">
                      Vídeo de apresentação
                    </h2>
                    <EditBtn
                      label="🎥 Editar vídeo"
                      onClick={() => onEdit("midia")}
                    />
                  </div>
                  <div className="mx-auto max-w-sm overflow-hidden rounded-3xl bg-black p-[3px] shadow-lg">
                    {isMp4(v.video_url) ? (
                      <video
                        src={v.video_url}
                        controls
                        playsInline
                        preload="metadata"
                        className="aspect-[9/16] w-full rounded-[20px] bg-black object-cover"
                      />
                    ) : (
                      <iframe
                        src={v.video_url}
                        title="Vídeo"
                        allow="accelerometer; autoplay; encrypted-media; picture-in-picture"
                        allowFullScreen
                        className="aspect-[9/16] w-full rounded-[20px]"
                      />
                    )}
                  </div>
                </section>
              )}

              {/* BIO */}
              {v.bio && (
                <section className="relative mt-6 rounded-3xl border border-black/[0.04] bg-white p-5">
                  <div className="mb-2 flex items-center justify-between">
                    <h2 className="text-xs font-medium uppercase tracking-wider text-black/60">
                      Sobre
                    </h2>
                    <EditBtn
                      label="📝 Editar informações"
                      onClick={() => onEdit("basico")}
                    />
                  </div>
                  <p className="whitespace-pre-line text-sm leading-relaxed text-black/85">
                    {v.bio}
                  </p>
                </section>
              )}

              {/* CARACTERÍSTICAS */}
              {(v.height_cm ||
                v.weight_kg ||
                v.dress_size ||
                v.eye_color ||
                v.hair_color ||
                v.has_silicone != null ||
                v.has_tattoo != null ||
                v.has_piercing != null) && (
                <section className="relative mt-6 rounded-3xl border border-black/[0.04] bg-white p-5">
                  <div className="mb-3 flex items-center justify-between">
                    <h2 className="text-xs font-medium uppercase tracking-wider text-black/60">
                      Características
                    </h2>
                    <EditBtn
                      label="📏 Editar características"
                      onClick={() => onEdit("caracteristicas")}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                    {v.height_cm && (
                      <Info label="Altura" value={`${(v.height_cm / 100).toFixed(2).replace(".", ",")}m`} />
                    )}
                    {v.weight_kg && (
                      <Info label="Peso" value={`${v.weight_kg}kg`} />
                    )}
                    {v.dress_size && <Info label="Manequim" value={v.dress_size} />}
                    {v.eye_color && <Info label="Olhos" value={v.eye_color} />}
                    {v.hair_color && <Info label="Cabelo" value={v.hair_color} />}
                    {v.has_silicone != null && (
                      <Info label="Silicone" value={v.has_silicone ? "Sim" : "Não"} />
                    )}
                    {v.has_tattoo != null && (
                      <Info label="Tatuagem" value={v.has_tattoo ? "Sim" : "Não"} />
                    )}
                    {v.has_piercing != null && (
                      <Info label="Piercing" value={v.has_piercing ? "Sim" : "Não"} />
                    )}
                  </div>
                </section>
              )}

              {/* SERVIÇOS */}
              {(v.services.length > 0 || v.services_not_offered.length > 0) && (
                <section className="relative mt-6 rounded-3xl border border-black/[0.04] bg-white p-5">
                  <div className="mb-3 flex items-center justify-between">
                    <h2 className="text-xs font-medium uppercase tracking-wider text-black/60">
                      Serviços
                    </h2>
                    <EditBtn
                      label="📝 Editar informações"
                      onClick={() => onEdit("servicos")}
                    />
                  </div>
                  {v.services.length > 0 && (
                    <ul className="flex flex-wrap gap-2">
                      {v.services.map((s) => (
                        <li
                          key={s}
                          className="rounded-full bg-emerald-50 px-3 py-1.5 text-sm text-emerald-700 ring-1 ring-emerald-200"
                        >
                          ✓ {s}
                        </li>
                      ))}
                    </ul>
                  )}
                  {v.services_not_offered.length > 0 && (
                    <>
                      <h3 className="mb-2 mt-4 text-xs font-medium uppercase tracking-wider text-black/60">
                        Não realiza
                      </h3>
                      <ul className="flex flex-wrap gap-2">
                        {v.services_not_offered.map((s) => (
                          <li
                            key={s}
                            className="rounded-full bg-rose-50 px-3 py-1.5 text-sm text-rose-700 line-through ring-1 ring-rose-200"
                          >
                            {s}
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </section>
              )}

              {/* HORÁRIOS */}
              {v.availability && (
                <section className="mt-6 rounded-3xl border border-black/[0.04] bg-white p-5">
                  <h2 className="mb-2 text-xs font-medium uppercase tracking-wider text-black/60">
                    Horários
                  </h2>
                  <p className="whitespace-pre-line rounded-2xl bg-[#F7F7F8] p-3 text-sm text-black/85">
                    🕐 {v.availability}
                  </p>
                </section>
              )}

              {/* LOCAIS */}
              {v.service_location.length > 0 && (
                <section className="mt-6 rounded-3xl border border-black/[0.04] bg-white p-5">
                  <h2 className="mb-2 text-xs font-medium uppercase tracking-wider text-black/60">
                    Locais de atendimento
                  </h2>
                  <ul className="flex flex-wrap gap-2">
                    {v.service_location.map((s) => (
                      <li
                        key={s}
                        className="rounded-full bg-[#F7F7F8] px-3 py-1.5 text-sm text-black/80"
                      >
                        {s}
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {/* PAGAMENTO */}
              {v.payment_methods.length > 0 && (
                <section className="mt-6 rounded-3xl border border-black/[0.04] bg-white p-5">
                  <h2 className="mb-2 text-xs font-medium uppercase tracking-wider text-black/60">
                    Formas de pagamento
                  </h2>
                  <ul className="flex flex-wrap gap-2">
                    {v.payment_methods.map((p) => (
                      <li
                        key={p}
                        className="rounded-full bg-[#F7F7F8] px-3 py-1.5 text-sm text-black/80"
                      >
                        {p}
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {/* WHATSAPP */}
              {v.whatsapp_number && (
                <section className="mt-6 rounded-3xl border border-black/[0.04] bg-white p-5">
                  <p className="mb-2 text-center text-[11px] font-medium uppercase tracking-wider text-black/60">
                    Atendimento direto e discreto
                  </p>
                  <div className="pointer-events-none flex w-full items-center justify-center rounded-2xl bg-[#25D366] px-6 py-4 text-center text-base font-semibold text-white opacity-90">
                    Falar no WhatsApp (simulação)
                  </div>
                </section>
              )}

              {/* MÍDIA */}
              {hasMedia && (
                <section className="relative mt-6 rounded-3xl border border-black/[0.04] bg-white p-5">
                  <div className="mb-3 flex items-center justify-between">
                    <h2 className="text-xs font-medium uppercase tracking-wider text-black/60">
                      Mídia
                    </h2>
                    <EditBtn
                      label="🖼️ Editar galeria"
                      onClick={() => onEdit("midia")}
                    />
                  </div>
                  <div className="mb-4 inline-flex rounded-full bg-[#F2F2F4] p-1">
                    <button
                      type="button"
                      onClick={() => setTab("fotos")}
                      className={[
                        "flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium",
                        tab === "fotos" ? "bg-white shadow" : "text-black/60",
                      ].join(" ")}
                    >
                      <Images className="h-4 w-4" /> Fotos ({photoCount})
                    </button>
                    <button
                      type="button"
                      onClick={() => setTab("videos")}
                      className={[
                        "flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium",
                        tab === "videos" ? "bg-white shadow" : "text-black/60",
                      ].join(" ")}
                    >
                      <Film className="h-4 w-4" /> Vídeos ({videoCount})
                    </button>
                  </div>
                  {tab === "fotos" ? (
                    photoCount === 0 ? (
                      <p className="py-6 text-center text-sm text-black/50">
                        Nenhuma foto.
                      </p>
                    ) : (
                      <div className="grid grid-cols-3 gap-2">
                        {v.gallery_images.map((src, i) => (
                          <img
                            key={i}
                            src={src}
                            alt=""
                            className="aspect-square w-full rounded-2xl object-cover"
                          />
                        ))}
                      </div>
                    )
                  ) : videoCount === 0 ? (
                    <p className="py-6 text-center text-sm text-black/50">
                      Nenhum vídeo adicional.
                    </p>
                  ) : (
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {galleryVideos.map((src, i) => (
                        <div
                          key={i}
                          className="relative overflow-hidden rounded-2xl bg-black"
                        >
                          {isMp4(src) ? (
                            <video
                              src={src}
                              muted
                              playsInline
                              preload="metadata"
                              className="aspect-[3/4] w-full object-cover opacity-90"
                            />
                          ) : (
                            <div className="aspect-[3/4] w-full bg-gradient-to-br from-black/80 to-black/50" />
                          )}
                          <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
                            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-black">
                              <Play className="ml-0.5 h-4 w-4 fill-current" />
                            </span>
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 bg-black/90 px-4 py-3">
        <div className="text-xs text-white/60">
          {missing.length === 0 ? (
            <span className="text-emerald-300">
              ✓ Pronto para publicação
            </span>
          ) : (
            <span>{missing.length} pendência(s) antes de publicar</span>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-white/15 px-4 py-2 text-sm text-white/80 hover:bg-white/5"
          >
            ⬅ Voltar para edição
          </button>
          <button
            type="button"
            onClick={onSaveDraft}
            disabled={saving}
            className="rounded-md border border-white/25 bg-white/5 px-4 py-2 text-sm font-medium text-white hover:bg-white/10 disabled:opacity-50"
          >
            💾 Salvar como rascunho
          </button>
          <button
            type="button"
            onClick={onPublish}
            disabled={saving || missing.length > 0}
            title={missing.length > 0 ? "Resolva as pendências para publicar" : ""}
            className="rounded-md bg-gradient-to-r from-[#D4AF37] to-[#B8860B] px-4 py-2 text-sm font-semibold text-black disabled:opacity-40"
          >
            🚀 Publicar perfil
          </button>
        </div>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-[#F7F7F8] px-3 py-2">
      <p className="text-[10px] font-medium uppercase tracking-wider text-black/60">
        {label}
      </p>
      <p className="mt-0.5 text-sm font-semibold text-black">{value}</p>
    </div>
  );
}