import { useState } from "react";
import { TagInput } from "./TagInput";
import {
  SingleImageUpload,
  MultiMediaUpload,
  SingleVideoUpload,
} from "./StorageUpload";
import { ProfilePreview } from "./ProfilePreview";

export type ProfileFormValues = {
  name: string | null;
  plan: "ouro" | "prata" | "bronze";
  cadastro_type: "paid" | "partnership";
  partnership_reason: string | null;
  partnership_notes: string | null;
  partnership_start_date: string | null;
  partnership_review_date: string | null;
  partnership_status: "ativa" | "pausada" | "encerrada";
  age: number | null;
  location: string | null;
  bio: string | null;
  services: string[];
  services_not_offered: string[];
  price_display: string | null;
  whatsapp_number: string | null;
  service_location: string[];
  payment_methods: string[];
  availability: string | null;
  height_cm: number | null;
  weight_kg: number | null;
  dress_size: string | null;
  eye_color: string | null;
  hair_color: string | null;
  has_silicone: boolean | null;
  has_tattoo: boolean | null;
  has_piercing: boolean | null;
  priority_level: number | null;
  manual_position: number | null;
  is_verified: boolean;
  is_pioneer: boolean;
  is_online: boolean;
  is_suspended: boolean;
  is_black: boolean;
  main_image: string | null;
  cover_image: string | null;
  gallery_images: string[];
  gallery_videos: string[];
  video_url: string | null;
};

export const emptyProfile: ProfileFormValues = {
  name: "",
  plan: "bronze",
  cadastro_type: "paid",
  partnership_reason: "",
  partnership_notes: "",
  partnership_start_date: null,
  partnership_review_date: null,
  partnership_status: "ativa",
  age: null,
  location: "",
  bio: "",
  services: [],
  services_not_offered: [],
  price_display: "",
  whatsapp_number: "",
  service_location: [],
  payment_methods: [],
  availability: "",
  height_cm: null,
  weight_kg: null,
  dress_size: "",
  eye_color: "",
  hair_color: "",
  has_silicone: null,
  has_tattoo: null,
  has_piercing: null,
  priority_level: 1,
  manual_position: null,
  is_verified: false,
  is_pioneer: false,
  is_online: false,
  is_suspended: false,
  is_black: false,
  main_image: null,
  cover_image: null,
  gallery_images: [],
  gallery_videos: [],
  video_url: "",
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="mb-1 text-xs uppercase tracking-wider text-white/60">
        {label}
      </div>
      {children}
    </label>
  );
}

const inputCls =
  "w-full rounded-md border border-white/15 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-[#D4AF37]";

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <label className="flex items-center gap-2 text-sm text-white/80">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 accent-[#D4AF37]"
      />
      {label}
    </label>
  );
}

export function ProfileForm({
  initial,
  profileId,
  onSubmit,
  submitting,
  submitLabel,
}: {
  initial: ProfileFormValues;
  profileId: string;
  onSubmit: (v: ProfileFormValues) => Promise<void> | void;
  submitting?: boolean;
  submitLabel: string;
}) {
  const [v, setV] = useState<ProfileFormValues>(initial);
  const set = <K extends keyof ProfileFormValues>(k: K, val: ProfileFormValues[K]) =>
    setV((p) => ({ ...p, [k]: val }));
  const [previewOpen, setPreviewOpen] = useState(false);

  const scrollToSection = (id: string) => {
    setPreviewOpen(false);
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        el.classList.add("ring-2", "ring-[#D4AF37]");
        setTimeout(() => el.classList.remove("ring-2", "ring-[#D4AF37]"), 1500);
      }
    }, 50);
  };

  return (
    <>
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(v);
      }}
      className="grid grid-cols-1 gap-6 lg:grid-cols-3"
    >
      {/* Left: main fields */}
      <div className="space-y-4 lg:col-span-2">
        <div id="section-basico" className="rounded-xl border border-white/10 bg-white/[0.02] p-4 transition-shadow">
          <h2 className="mb-3 text-sm font-semibold text-white/80">Básico</h2>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <Field label="Nome">
              <input
                className={inputCls}
                value={v.name ?? ""}
                onChange={(e) => set("name", e.target.value)}
              />
            </Field>
            <Field label="Idade">
              <input
                type="number"
                className={inputCls}
                value={v.age ?? ""}
                onChange={(e) =>
                  set("age", e.target.value ? Number(e.target.value) : null)
                }
              />
            </Field>
            <Field label="Cidade">
              <input
                className={inputCls}
                value={v.location ?? ""}
                onChange={(e) => set("location", e.target.value)}
              />
            </Field>
            <Field label="WhatsApp">
              <input
                className={inputCls}
                value={v.whatsapp_number ?? ""}
                onChange={(e) => set("whatsapp_number", e.target.value)}
                placeholder="55XXXXXXXXXXX"
              />
            </Field>
            <Field label="Valor exibido">
              <input
                className={inputCls}
                value={v.price_display ?? ""}
                onChange={(e) => set("price_display", e.target.value)}
              />
            </Field>
            <Field label="Disponibilidade">
              <input
                className={inputCls}
                value={v.availability ?? ""}
                onChange={(e) => set("availability", e.target.value)}
              />
            </Field>
          </div>
          <div className="mt-3">
            <Field label="Bio">
              <textarea
                rows={4}
                className={inputCls}
                value={v.bio ?? ""}
                onChange={(e) => set("bio", e.target.value)}
              />
            </Field>
          </div>
        </div>

        <div id="section-servicos" className="rounded-xl border border-white/10 bg-white/[0.02] p-4 transition-shadow">
          <h2 className="mb-3 text-sm font-semibold text-white/80">
            Serviços & Atendimento
          </h2>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <Field label="Serviços oferecidos">
              <TagInput
                value={v.services}
                onChange={(x) => set("services", x)}
              />
            </Field>
            <Field label="Serviços não oferecidos">
              <TagInput
                value={v.services_not_offered}
                onChange={(x) => set("services_not_offered", x)}
              />
            </Field>
            <Field label="Locais de atendimento">
              <TagInput
                value={v.service_location}
                onChange={(x) => set("service_location", x)}
              />
            </Field>
            <Field label="Formas de pagamento">
              <TagInput
                value={v.payment_methods}
                onChange={(x) => set("payment_methods", x)}
              />
            </Field>
          </div>
        </div>

        <div id="section-caracteristicas" className="rounded-xl border border-white/10 bg-white/[0.02] p-4 transition-shadow">
          <h2 className="mb-3 text-sm font-semibold text-white/80">Características</h2>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <Field label="Altura (cm)">
              <input
                type="number"
                className={inputCls}
                value={v.height_cm ?? ""}
                onChange={(e) =>
                  set("height_cm", e.target.value ? Number(e.target.value) : null)
                }
              />
            </Field>
            <Field label="Peso (kg)">
              <input
                type="number"
                className={inputCls}
                value={v.weight_kg ?? ""}
                onChange={(e) =>
                  set("weight_kg", e.target.value ? Number(e.target.value) : null)
                }
              />
            </Field>
            <Field label="Manequim">
              <input
                className={inputCls}
                value={v.dress_size ?? ""}
                onChange={(e) => set("dress_size", e.target.value)}
              />
            </Field>
            <Field label="Olhos">
              <input
                className={inputCls}
                value={v.eye_color ?? ""}
                onChange={(e) => set("eye_color", e.target.value)}
              />
            </Field>
            <Field label="Cabelo">
              <input
                className={inputCls}
                value={v.hair_color ?? ""}
                onChange={(e) => set("hair_color", e.target.value)}
              />
            </Field>
          </div>
          <div className="mt-3 flex flex-wrap gap-4">
            <Toggle
              checked={!!v.has_silicone}
              onChange={(x) => set("has_silicone", x)}
              label="Silicone"
            />
            <Toggle
              checked={!!v.has_tattoo}
              onChange={(x) => set("has_tattoo", x)}
              label="Tatuagem"
            />
            <Toggle
              checked={!!v.has_piercing}
              onChange={(x) => set("has_piercing", x)}
              label="Piercing"
            />
          </div>
        </div>

        <div id="section-midia" className="rounded-xl border border-white/10 bg-white/[0.02] p-4 transition-shadow">
          <h2 className="mb-3 text-sm font-semibold text-white/80">Mídia</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <SingleImageUpload
              label="Foto de perfil"
              value={v.main_image}
              onChange={(x) => set("main_image", x)}
              profileId={profileId}
              aspect="square"
            />
            <SingleImageUpload
              label="Foto de capa"
              value={v.cover_image}
              onChange={(x) => set("cover_image", x)}
              profileId={profileId}
              aspect="wide"
            />
          </div>
          <div className="mt-4">
            <SingleVideoUpload
              label="Vídeo de apresentação (principal)"
              value={v.video_url}
              onChange={(x) => set("video_url", x)}
              profileId={profileId}
            />
          </div>
          <div className="mt-4">
            <MultiMediaUpload
              label="Galeria de fotos"
              value={v.gallery_images}
              onChange={(x) => set("gallery_images", x)}
              profileId={profileId}
              kind="image"
            />
          </div>
          <div className="mt-4">
            <MultiMediaUpload
              label="Galeria de vídeos"
              value={v.gallery_videos}
              onChange={(x) => set("gallery_videos", x)}
              profileId={profileId}
              kind="video"
            />
          </div>
        </div>
      </div>

      {/* Right: publish + admin controls */}
      <aside className="space-y-4">
        <div id="section-publicacao" className="rounded-xl border border-white/10 bg-white/[0.02] p-4 transition-shadow">
          <h2 className="mb-3 text-sm font-semibold text-white/80">Publicação</h2>
          <div className="space-y-2">
            <Field label="Plano">
              <select
                className={inputCls}
                value={v.plan}
                onChange={(e) => {
                  const plan = e.target.value as ProfileFormValues["plan"];
                  setV((prev) => ({
                    ...prev,
                    plan,
                    priority_level:
                      plan === "ouro" ? 3 : plan === "prata" ? 2 : 1,
                  }));
                }}
              >
                <option value="ouro">Ouro</option>
                <option value="prata">Prata</option>
                <option value="bronze">Bronze</option>
              </select>
            </Field>
            <Field label="Tipo do cadastro">
              <select
                className={inputCls}
                value={v.cadastro_type}
                onChange={(e) =>
                  set(
                    "cadastro_type",
                    e.target.value as ProfileFormValues["cadastro_type"],
                  )
                }
              >
                <option value="paid">Pagante</option>
                <option value="partnership">Parceria</option>
              </select>
            </Field>
            <Toggle
              checked={v.is_verified}
              onChange={(x) => set("is_verified", x)}
              label="Verificada"
            />
            <Toggle
              checked={v.is_pioneer}
              onChange={(x) => set("is_pioneer", x)}
              label="Pioneira"
            />
            <Toggle
              checked={v.is_online}
              onChange={(x) => set("is_online", x)}
              label="Online agora"
            />
            <Toggle
              checked={v.is_black}
              onChange={(x) => set("is_black", x)}
              label="Black (gradiente dark no card)"
            />
            <Toggle
              checked={v.is_suspended}
              onChange={(x) => set("is_suspended", x)}
              label="Suspensa (não aparece no site)"
            />
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Field label="Prioridade">
              <input
                type="number"
                className={inputCls}
                value={v.priority_level ?? ""}
                onChange={(e) =>
                  set(
                    "priority_level",
                    e.target.value ? Number(e.target.value) : null,
                  )
                }
              />
            </Field>
            <Field label="Posição manual">
              <input
                type="number"
                className={inputCls}
                value={v.manual_position ?? ""}
                onChange={(e) =>
                  set(
                    "manual_position",
                    e.target.value ? Number(e.target.value) : null,
                  )
                }
              />
            </Field>
          </div>
        </div>

        {v.cadastro_type === "partnership" && (
          <div className="rounded-xl border border-[#D4AF37]/30 bg-[#D4AF37]/[0.04] p-4">
            <h2 className="mb-3 text-sm font-semibold text-[#D4AF37]">
              🤝 Parceria
            </h2>
            <div className="space-y-3">
              <Field label="Motivo da parceria">
                <input
                  className={inputCls}
                  value={v.partnership_reason ?? ""}
                  onChange={(e) => set("partnership_reason", e.target.value)}
                  placeholder="Ex.: Influenciadora, permuta, embaixadora..."
                />
              </Field>
              <Field label="Observações">
                <textarea
                  rows={4}
                  className={inputCls}
                  value={v.partnership_notes ?? ""}
                  onChange={(e) => set("partnership_notes", e.target.value)}
                  placeholder="Detalhes do acordo..."
                />
              </Field>
              <div className="grid grid-cols-2 gap-2">
                <Field label="Data de início">
                  <input
                    type="date"
                    className={inputCls}
                    value={v.partnership_start_date ?? ""}
                    onChange={(e) =>
                      set("partnership_start_date", e.target.value || null)
                    }
                  />
                </Field>
                <Field label="Data de revisão">
                  <input
                    type="date"
                    className={inputCls}
                    value={v.partnership_review_date ?? ""}
                    onChange={(e) =>
                      set("partnership_review_date", e.target.value || null)
                    }
                  />
                </Field>
              </div>
              <Field label="Status da parceria">
                <select
                  className={inputCls}
                  value={v.partnership_status}
                  onChange={(e) =>
                    set(
                      "partnership_status",
                      e.target.value as ProfileFormValues["partnership_status"],
                    )
                  }
                >
                  <option value="ativa">Ativa</option>
                  <option value="pausada">Pausada</option>
                  <option value="encerrada">Encerrada</option>
                </select>
              </Field>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <button
            type="button"
            onClick={() => setPreviewOpen(true)}
            className="w-full rounded-md border border-white/25 bg-white/5 py-2 text-sm font-medium text-white hover:bg-white/10"
          >
            👁 Visualizar perfil
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-md bg-gradient-to-r from-[#D4AF37] to-[#B8860B] py-2 text-sm font-medium text-black disabled:opacity-50"
          >
            {submitting ? "Salvando..." : submitLabel}
          </button>
        </div>
      </aside>
    </form>
    <ProfilePreview
      open={previewOpen}
      values={v}
      saving={submitting}
      onClose={() => setPreviewOpen(false)}
      onEdit={(section) => scrollToSection(`section-${section}`)}
      onSaveDraft={async () => {
        await onSubmit({ ...v, is_suspended: true });
        setPreviewOpen(false);
      }}
      onPublish={async () => {
        await onSubmit({ ...v, is_suspended: false });
        setPreviewOpen(false);
      }}
    />
    </>
  );
}

export function toFormValues(row: Record<string, unknown>): ProfileFormValues {
  const g = (k: string) => (row[k] as any) ?? null;
  const arr = (k: string) => ((row[k] as any) ?? []) as string[];
  return {
    name: g("name"),
    plan: "bronze",
    cadastro_type: "paid",
    partnership_reason: "",
    partnership_notes: "",
    partnership_start_date: null,
    partnership_review_date: null,
    partnership_status: "ativa",
    age: g("age"),
    location: g("location"),
    bio: g("bio"),
    services: arr("services"),
    services_not_offered: arr("services_not_offered"),
    price_display: g("price_display"),
    whatsapp_number: g("whatsapp_number"),
    service_location: arr("service_location"),
    payment_methods: arr("payment_methods"),
    availability: g("availability"),
    height_cm: g("height_cm"),
    weight_kg: g("weight_kg"),
    dress_size: g("dress_size"),
    eye_color: g("eye_color"),
    hair_color: g("hair_color"),
    has_silicone: g("has_silicone"),
    has_tattoo: g("has_tattoo"),
    has_piercing: g("has_piercing"),
    priority_level: g("priority_level"),
    manual_position: g("manual_position"),
    is_verified: !!g("is_verified"),
    is_pioneer: !!g("is_pioneer"),
    is_online: !!g("is_online"),
    is_suspended: !!g("is_suspended"),
    is_black: !!g("is_black"),
    main_image: g("main_image"),
    cover_image: g("cover_image"),
    gallery_images: arr("gallery_images"),
    gallery_videos: arr("gallery_videos"),
    video_url: g("video_url"),
  };
}