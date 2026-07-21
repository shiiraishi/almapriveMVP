import { useEffect, useState } from "react";
import { LogoButton } from "./LogoButton";

export function AgeGate() {
  const [verified, setVerified] = useState<boolean | null>(null);
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    try {
      const ok = localStorage.getItem("age_verified") === "true";
      setVerified(ok);
    } catch {
      setVerified(false);
    }
  }, []);

  useEffect(() => {
    if (verified === false) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [verified]);

  if (verified === null || verified === true) return null;

  const handleYes = () => {
    if (!accepted) return;
    try {
      localStorage.setItem("age_verified", "true");
    } catch {}
    setVerified(true);
  };

  const handleNo = () => {
    window.location.replace("https://www.google.com");
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center px-4 animate-fade-in-up"
      style={{
        backgroundColor: "rgba(0,0,0,0.7)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="age-gate-title"
    >
      <div
        className="w-full max-w-md rounded-2xl p-8 sm:p-10 shadow-2xl text-center"
        style={{ backgroundColor: "#F7F7F8" }}
      >
        <div className="flex justify-center mb-5">
          <LogoButton size={72} ariaLabel="AlmaPrivé" />
        </div>
        <p className="text-xs uppercase tracking-[0.25em] text-neutral-500 mb-4">
          AlmaPrivé
        </p>
        <h2
          id="age-gate-title"
          className="text-2xl sm:text-3xl font-semibold text-neutral-900 mb-3"
        >
          Você tem mais de 18 anos?
        </h2>
        <p className="text-sm text-neutral-600 mb-8">
          Este site contém conteúdo destinado exclusivamente a maiores de 18 anos.
        </p>

        <div className="flex flex-col gap-3">
          <label className="flex items-start gap-2 text-left text-xs text-neutral-700 mb-1 cursor-pointer">
            <input
              type="checkbox"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
              className="mt-0.5 size-4 shrink-0 accent-[#FD297B]"
            />
            <span>
              Li e concordo com os{" "}
              <a href="/termos" className="underline hover:text-neutral-900">Termos de Uso</a>{" "}
              e a{" "}
              <a href="/privacidade" className="underline hover:text-neutral-900">Política de Privacidade</a>.
            </span>
          </label>
          <button
            onClick={handleYes}
            disabled={!accepted}
            className="w-full rounded-xl py-3 px-6 text-white font-semibold text-base shadow-lg transition-transform active:scale-[0.98] hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
            style={{
              backgroundImage: "linear-gradient(135deg, #FD297B 0%, #FF6B6B 100%)",
            }}
          >
            Sim, tenho +18
          </button>
          <button
            onClick={handleNo}
            className="w-full rounded-xl py-3 px-6 font-medium text-neutral-700 bg-transparent hover:bg-neutral-200/60 transition-colors"
          >
            Não
          </button>
        </div>

        <p className="mt-6 text-[11px] text-neutral-400">
          Ao continuar, você confirma ser maior de idade conforme a legislação local.
        </p>
      </div>
    </div>
  );
}
