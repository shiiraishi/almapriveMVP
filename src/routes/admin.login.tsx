import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { adminLogin } from "@/lib/admin.functions";

export const Route = createFileRoute("/admin/login")({
  head: () => ({
    meta: [
      { title: "Acesso restrito · AlmaPrivé" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminLoginPage,
});

function AdminLoginPage() {
  const router = useRouter();
  const login = useServerFn(adminLogin);
  const [pwd, setPwd] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErr(null);
    try {
      const res = await login({ data: { password: pwd } });
      if (res.ok) {
        router.navigate({ to: "/admin" });
      } else {
        setErr(res.error);
      }
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm rounded-2xl border border-[#D4AF37]/30 bg-black/70 p-8 shadow-2xl"
      >
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold tracking-wide">
            <span className="text-[#D4AF37]">AlmaPrivé</span>
          </h1>
          <p className="mt-1 text-sm text-white/60">Acesso restrito</p>
        </div>
        <label className="block text-xs uppercase tracking-wider text-white/60">
          Senha
        </label>
        <input
          type="password"
          autoFocus
          value={pwd}
          onChange={(e) => setPwd(e.target.value)}
          className="mt-2 w-full rounded-md border border-white/15 bg-black/60 px-3 py-2 text-white outline-none focus:border-[#D4AF37]"
          placeholder="••••••••"
        />
        {err && <p className="mt-3 text-sm text-red-400">{err}</p>}
        <button
          type="submit"
          disabled={loading || !pwd}
          className="mt-6 w-full rounded-md bg-gradient-to-r from-[#D4AF37] to-[#B8860B] py-2 font-medium text-black disabled:opacity-50"
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
}