import { useCallback, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";

type Props = {
  file: File;
  aspect: number;
  cropShape?: "rect" | "round";
  title?: string;
  onCancel: () => void;
  onConfirm: (blob: Blob) => void;
};

async function getCroppedBlob(
  imageSrc: string,
  area: Area,
  mime = "image/jpeg",
): Promise<Blob> {
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const i = new Image();
    i.crossOrigin = "anonymous";
    i.onload = () => resolve(i);
    i.onerror = reject;
    i.src = imageSrc;
  });
  const canvas = document.createElement("canvas");
  // Cap output to keep file size reasonable
  const maxSide = 2000;
  const scale = Math.min(1, maxSide / Math.max(area.width, area.height));
  canvas.width = Math.round(area.width * scale);
  canvas.height = Math.round(area.height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas indisponível");
  ctx.drawImage(
    img,
    area.x,
    area.y,
    area.width,
    area.height,
    0,
    0,
    canvas.width,
    canvas.height,
  );
  return await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Falha ao gerar imagem"))),
      mime,
      0.92,
    );
  });
}

export function ImageCropModal({
  file,
  aspect,
  cropShape = "rect",
  title = "Ajustar enquadramento",
  onCancel,
  onConfirm,
}: Props) {
  const [src] = useState(() => URL.createObjectURL(file));
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [area, setArea] = useState<Area | null>(null);
  const [busy, setBusy] = useState(false);

  const onComplete = useCallback((_: Area, pixels: Area) => setArea(pixels), []);

  async function confirm() {
    if (!area) return;
    setBusy(true);
    try {
      const blob = await getCroppedBlob(src, area);
      URL.revokeObjectURL(src);
      onConfirm(blob);
    } finally {
      setBusy(false);
    }
  }

  function cancel() {
    URL.revokeObjectURL(src);
    onCancel();
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4">
      <div className="w-full max-w-3xl overflow-hidden rounded-xl border border-white/15 bg-neutral-950 shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <h3 className="text-sm font-semibold text-white">{title}</h3>
          <button
            type="button"
            onClick={cancel}
            className="text-white/60 hover:text-white"
          >
            ✕
          </button>
        </div>
        <div className="relative h-[60vh] w-full bg-black">
          <Cropper
            image={src}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            cropShape={cropShape}
            showGrid
            restrictPosition
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onComplete}
          />
        </div>
        <div className="flex flex-wrap items-center gap-3 border-t border-white/10 px-4 py-3">
          <button
            type="button"
            onClick={() => setZoom((z) => Math.max(1, z - 0.2))}
            className="rounded border border-white/15 px-2 py-1 text-xs text-white/80 hover:bg-white/5"
          >
            Zoom −
          </button>
          <input
            type="range"
            min={1}
            max={4}
            step={0.01}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="flex-1 accent-[#D4AF37]"
          />
          <button
            type="button"
            onClick={() => setZoom((z) => Math.min(4, z + 0.2))}
            className="rounded border border-white/15 px-2 py-1 text-xs text-white/80 hover:bg-white/5"
          >
            Zoom +
          </button>
          <button
            type="button"
            onClick={() => {
              setCrop({ x: 0, y: 0 });
              setZoom(1);
            }}
            className="rounded border border-white/15 px-2 py-1 text-xs text-white/70 hover:bg-white/5"
          >
            Reiniciar
          </button>
          <div className="ml-auto flex gap-2">
            <button
              type="button"
              onClick={cancel}
              className="rounded border border-white/15 px-3 py-1.5 text-xs text-white/80 hover:bg-white/5"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={confirm}
              disabled={busy || !area}
              className="rounded bg-[#D4AF37] px-3 py-1.5 text-xs font-semibold text-black hover:brightness-110 disabled:opacity-50"
            >
              {busy ? "Processando..." : "Confirmar enquadramento"}
            </button>
          </div>
        </div>
        <p className="border-t border-white/10 px-4 py-2 text-[11px] text-white/50">
          Arraste para posicionar e use o zoom para enquadrar. Nada é enviado
          até confirmar.
        </p>
      </div>
    </div>
  );
}