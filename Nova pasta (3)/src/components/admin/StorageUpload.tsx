import { useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  uploadProfileAsset,
  deleteProfileAsset,
} from "@/lib/profiles-admin.functions";
import { ImageCropModal } from "./ImageCropModal";

type Kind = "image" | "video";

async function uploadFile(
  fn: ReturnType<typeof useServerFn<typeof uploadProfileAsset>>,
  file: File,
  kind: Kind,
  profileId: string,
) {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("kind", kind);
  fd.append("profileId", profileId);
  return await fn({ data: fd });
}

async function uploadBlob(
  fn: ReturnType<typeof useServerFn<typeof uploadProfileAsset>>,
  blob: Blob,
  kind: Kind,
  profileId: string,
  filename: string,
) {
  const file = new File([blob], filename, { type: blob.type || "image/jpeg" });
  return await uploadFile(fn, file, kind, profileId);
}

export function SingleImageUpload({
  value,
  onChange,
  profileId,
  label,
  aspect = "square",
}: {
  value: string | null;
  onChange: (url: string | null) => void;
  profileId: string;
  label: string;
  aspect?: "square" | "wide";
}) {
  const upload = useServerFn(uploadProfileAsset);
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [pending, setPending] = useState<File | null>(null);
  const aspectRatio = aspect === "square" ? 1 : 16 / 7;
  const cropShape = "rect" as const;

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (inputRef.current) inputRef.current.value = "";
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      setErr("Selecione uma imagem.");
      return;
    }
    setErr(null);
    setPending(f);
  }

  async function onConfirmCrop(blob: Blob) {
    const file = pending;
    setPending(null);
    if (!file) return;
    setBusy(true);
    try {
      const res = await uploadBlob(
        upload,
        blob,
        "image",
        profileId,
        file.name.replace(/\.[^.]+$/, "") + ".jpg",
      );
      onChange(res.url);
    } catch (err) {
      setErr((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div className="mb-1 text-xs uppercase tracking-wider text-white/60">
        {label}
      </div>
      <div
        className={`relative overflow-hidden rounded-md border border-white/15 bg-black/40 ${
          aspect === "square" ? "aspect-square" : "aspect-[16/9]"
        }`}
      >
        {value ? (
          <img
            src={value}
            alt={label}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-white/40">
            Nenhuma imagem
          </div>
        )}
      </div>
      <div className="mt-2 flex gap-2">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="rounded-md border border-white/15 px-3 py-1 text-xs text-white/80 hover:bg-white/5 disabled:opacity-50"
        >
          {busy ? "Enviando..." : value ? "Trocar" : "Enviar foto"}
        </button>
        {value && (
          <button
            type="button"
            onClick={() => onChange(null)}
            className="rounded-md border border-white/15 px-3 py-1 text-xs text-white/70 hover:bg-white/5"
          >
            Remover
          </button>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={onFile}
        />
      </div>
      {err && <p className="mt-1 text-xs text-red-400">{err}</p>}
      {pending && (
        <ImageCropModal
          file={pending}
          aspect={aspectRatio}
          cropShape={cropShape}
          title={
            aspect === "square"
              ? "Ajustar foto de perfil (1:1)"
              : "Ajustar foto de capa (16:7)"
          }
          onCancel={() => setPending(null)}
          onConfirm={onConfirmCrop}
        />
      )}
    </div>
  );
}

export function SingleVideoUpload({
  value,
  onChange,
  profileId,
  label,
}: {
  value: string | null;
  onChange: (url: string | null) => void;
  profileId: string;
  label: string;
}) {
  const upload = useServerFn(uploadProfileAsset);
  const del = useServerFn(deleteProfileAsset);
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [err, setErr] = useState<string | null>(null);
  const [warn, setWarn] = useState<string | null>(null);

  async function checkAspect(file: File): Promise<void> {
    return new Promise((resolve) => {
      const url = URL.createObjectURL(file);
      const v = document.createElement("video");
      v.preload = "metadata";
      v.onloadedmetadata = () => {
        const ratio = v.videoWidth / v.videoHeight;
        const target = 9 / 16;
        if (Math.abs(ratio - target) > 0.1) {
          setWarn(
            "Formato recomendado é 9:16 (vertical). O vídeo pode não ocupar toda a área de exibição no perfil.",
          );
        } else {
          setWarn(null);
        }
        URL.revokeObjectURL(url);
        resolve();
      };
      v.onerror = () => {
        URL.revokeObjectURL(url);
        resolve();
      };
      v.src = url;
    });
  }

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const okType = /\.(mp4|mov|webm)$/i.test(f.name) ||
      ["video/mp4", "video/quicktime", "video/webm"].includes(f.type);
    if (!okType) {
      setErr("Formato não suportado. Use MP4, MOV ou WebM.");
      if (inputRef.current) inputRef.current.value = "";
      return;
    }
    setErr(null);
    await checkAspect(f);
    setBusy(true);
    setProgress(10);
    const tick = setInterval(
      () => setProgress((p) => (p < 85 ? p + 5 : p)),
      300,
    );
    try {
      const res = await uploadFile(upload, f, "video", profileId);
      setProgress(100);
      onChange(res.url);
    } catch (err) {
      setErr((err as Error).message);
    } finally {
      clearInterval(tick);
      setBusy(false);
      setTimeout(() => setProgress(0), 600);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function onRemove() {
    const url = value;
    if (url) {
      const m = url.match(/\/storage\/v1\/object\/public\/([^/]+)\/(.+)$/);
      if (m) {
        try {
          await del({ data: { bucket: m[1], path: m[2] } });
        } catch {
          /* ignore */
        }
      }
    }
    setWarn(null);
    onChange(null);
  }

  return (
    <div>
      <div className="mb-1 text-xs uppercase tracking-wider text-white/60">
        {label}
      </div>
      <div className="relative mx-auto w-full max-w-[220px] overflow-hidden rounded-md border border-white/15 bg-black/40 aspect-[9/16]">
        {value ? (
          <video
            src={value}
            controls
            playsInline
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center px-2 text-center text-xs text-white/40">
            Nenhum vídeo enviado
          </div>
        )}
      </div>
      <p className="mt-1 text-[11px] text-white/50">
        Formato recomendado: vertical 9:16. Aceita MP4, MOV, WebM.
      </p>
      {busy && (
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded bg-white/10">
          <div
            className="h-full bg-[#D4AF37] transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
      <div className="mt-2 flex gap-2">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="rounded-md border border-white/15 px-3 py-1 text-xs text-white/80 hover:bg-white/5 disabled:opacity-50"
        >
          {busy ? "Enviando..." : value ? "Substituir vídeo" : "Enviar vídeo"}
        </button>
        {value && !busy && (
          <button
            type="button"
            onClick={onRemove}
            className="rounded-md border border-white/15 px-3 py-1 text-xs text-red-300 hover:bg-white/5"
          >
            Excluir
          </button>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="video/mp4,video/quicktime,video/webm,.mp4,.mov,.webm"
          hidden
          onChange={onFile}
        />
      </div>
      {warn && <p className="mt-1 text-xs text-amber-300">{warn}</p>}
      {err && <p className="mt-1 text-xs text-red-400">{err}</p>}
    </div>
  );
}

export function MultiMediaUpload({
  value,
  onChange,
  profileId,
  label,
  kind,
}: {
  value: string[];
  onChange: (v: string[]) => void;
  profileId: string;
  label: string;
  kind: Kind;
}) {
  const upload = useServerFn(uploadProfileAsset);
  const del = useServerFn(deleteProfileAsset);
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setBusy(true);
    setErr(null);
    try {
      const urls: string[] = [];
      for (const f of files) {
        const res = await uploadFile(upload, f, kind, profileId);
        urls.push(res.url);
      }
      onChange([...value, ...urls]);
    } catch (err) {
      setErr((err as Error).message);
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function move(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= value.length) return;
    const arr = value.slice();
    [arr[i], arr[j]] = [arr[j], arr[i]];
    onChange(arr);
  }

  async function remove(i: number) {
    const url = value[i];
    // best-effort delete from storage if it looks like our bucket path
    const m = url.match(/\/storage\/v1\/object\/public\/([^/]+)\/(.+)$/);
    if (m) {
      try {
        await del({ data: { bucket: m[1], path: m[2] } });
      } catch {
        /* ignore */
      }
    }
    onChange(value.filter((_, idx) => idx !== i));
  }

  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs uppercase tracking-wider text-white/60">
        <span>{label}</span>
        <span className="text-[10px] normal-case text-white/40">
          {value.length} item(ns)
        </span>
      </div>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
        {value.map((url, i) => (
          <div
            key={`${url}-${i}`}
            className="relative overflow-hidden rounded-md border border-white/15 bg-black/40"
          >
            <div className="aspect-square">
              {kind === "image" ? (
                <img src={url} alt="" className="h-full w-full object-cover" />
              ) : (
                <video src={url} className="h-full w-full object-cover" muted />
              )}
            </div>
            <div className="absolute inset-x-0 bottom-0 flex justify-between bg-black/70 p-1 text-[10px]">
              <button
                type="button"
                onClick={() => move(i, -1)}
                className="px-1 text-white/80 hover:text-white"
              >
                ↑
              </button>
              <button
                type="button"
                onClick={() => remove(i)}
                className="px-1 text-red-300 hover:text-red-200"
              >
                ×
              </button>
              <button
                type="button"
                onClick={() => move(i, 1)}
                className="px-1 text-white/80 hover:text-white"
              >
                ↓
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-2 flex gap-2">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="rounded-md border border-white/15 px-3 py-1 text-xs text-white/80 hover:bg-white/5 disabled:opacity-50"
        >
          {busy ? "Enviando..." : kind === "image" ? "Enviar fotos" : "Enviar vídeos"}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept={kind === "image" ? "image/*" : "video/*"}
          multiple
          hidden
          onChange={onFiles}
        />
      </div>
      {err && <p className="mt-1 text-xs text-red-400">{err}</p>}
    </div>
  );
}