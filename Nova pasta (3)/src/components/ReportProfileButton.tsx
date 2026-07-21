import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useServerFn } from "@tanstack/react-start";
import { createReport, REPORT_REASONS } from "@/lib/reports.functions";

// Número do WhatsApp da administração para receber denúncias.
// Troque por um número real (somente dígitos, com DDI). Ex.: "5511999999999".
const ADMIN_WHATSAPP = "SEUNUMERO";

type Props = {
  profileId: string;
  profileName: string | null;
  className?: string;
  variant?: "floating" | "inline";
};

export function ReportProfileButton({ profileId, profileName, className, variant = "inline" }: Props) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<string>(REPORT_REASONS[0]);
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const send = useServerFn(createReport);
  const selectRef = useRef<HTMLSelectElement>(null);

  const charCount = description.trim().length;
  const valid = charCount >= 10 && charCount <= 1000;

  // Bloqueia scroll da página e foca o primeiro campo quando o modal abre
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    // Foca o select após o render do portal para acessibilidade
    requestAnimationFrame(() => {
      selectRef.current?.focus();
    });
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      await send({ data: { profile_id: profileId, reason, description: description.trim() } });
      setDone(true);
      // Abre WhatsApp da administração com a denúncia formatada
      const now = new Date().toLocaleString("pt-BR");
      const msg =
        `🚨 NOVA DENÚNCIA\n\n` +
        `Perfil:\n${profileName ?? "(sem nome)"}\n\n` +
        `Motivo:\n${reason}\n\n` +
        `Descrição:\n${description.trim()}\n\n` +
        `Data:\n${now}\n\n` +
        `Verificar painel administrativo.`;
      const url = `https://wa.me/${ADMIN_WHATSAPP}?text=${encodeURIComponent(msg)}`;
      try {
        window.open(url, "_blank", "noopener,noreferrer");
      } catch {
        /* popup blocked */
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao enviar denúncia.");
    } finally {
      setSubmitting(false);
    }
  }

  function resetAndClose() {
    setOpen(false);
    setDone(false);
    setReason(REPORT_REASONS[0]);
    setDescription("");
    setError(null);
  }

  const baseBtn =
    "inline-flex items-center gap-1.5 rounded-full font-medium transition-colors";
  const btnClass =
    variant === "floating"
      ? `${baseBtn} bg-black/55 backdrop-blur-md px-3 py-1.5 text-[11px] text-white ring-1 ring-white/20 hover:bg-black/70`
      : `${baseBtn} bg-rose-50 text-rose-700 ring-1 ring-rose-200 px-3 py-1.5 text-xs hover:bg-rose-100`;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={[btnClass, className ?? ""].join(" ")}
        aria-label="Denunciar perfil"
      >
        🚩 Denunciar perfil
      </button>

      {open &&
        typeof document !== "undefined" &&
        createPortal(
          <>
            {/* Overlay */}
            <div
              className="fixed inset-0 z-[9998] bg-black/60"
              onClick={resetAndClose}
              aria-hidden="true"
            />
            {/* Modal — centralizado no viewport em todos os breakpoints */}
            <div
              className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
              onClick={resetAndClose}
            >
              <div
                className="w-full max-w-[90%] sm:max-w-md max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-5 shadow-xl sm:p-6"
                onClick={(e) => e.stopPropagation()}
              >
                {done ? (
                  <div className="text-center">
                    <div className="text-3xl">✅</div>
                    <h3 className="mt-2 text-lg font-semibold">Denúncia enviada</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Obrigado. Nossa equipe analisará o quanto antes.
                    </p>
                    <button
                      type="button"
                      onClick={resetAndClose}
                      className="mt-5 w-full rounded-xl bg-foreground px-4 py-2.5 text-sm font-medium text-white"
                    >
                      Fechar
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-semibold">🚩 Denunciar perfil</h3>
                        <p className="text-xs text-muted-foreground">
                          {profileName ?? "Perfil"}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={resetAndClose}
                        className="rounded-full p-1 text-muted-foreground hover:bg-black/5"
                        aria-label="Fechar"
                      >
                        ✕
                      </button>
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Motivo
                      </label>
                      <select
                        ref={selectRef}
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        className="w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm outline-none focus:border-foreground"
                      >
                        {REPORT_REASONS.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Descrição
                      </label>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value.slice(0, 1000))}
                        placeholder="Explique o motivo da denúncia."
                        rows={5}
                        className="w-full resize-none rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm outline-none focus:border-foreground"
                        required
                      />
                      <div className="mt-1 flex items-center justify-between text-[11px] text-muted-foreground">
                        <span>Mínimo 10 caracteres</span>
                        <span className={charCount > 1000 ? "text-rose-600" : ""}>{charCount}/1000</span>
                      </div>
                    </div>

                    {error && (
                      <div className="rounded-xl bg-rose-50 px-3 py-2 text-xs text-rose-700 ring-1 ring-rose-200">
                        {error}
                      </div>
                    )}

                    <div className="flex gap-2 pt-1">
                      <button
                        type="button"
                        onClick={resetAndClose}
                        className="flex-1 rounded-xl border border-black/10 px-4 py-2.5 text-sm font-medium hover:bg-black/[0.03]"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={!valid || submitting}
                        className="flex-1 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50"
                      >
                        {submitting ? "Enviando…" : "Enviar denúncia"}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </>,
          document.body,
        )}
    </>
  );
}
