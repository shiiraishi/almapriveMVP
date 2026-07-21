import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  listAdminProfiles,
  toggleProfileSuspended,
  deleteAdminProfile,
} from "@/lib/profiles-admin.functions";

export const Route = createFileRoute("/admin/perfis/")({
  head: () => ({
    meta: [
      { title: "Perfis · AlmaPrivé" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: PerfisList,
});

function PerfisList() {
  const list = useServerFn(listAdminProfiles);
  const toggle = useServerFn(toggleProfileSuspended);
  const del = useServerFn(deleteAdminProfile);
  const qc = useQueryClient();

  const [q, setQ] = useState("");
  const [plan, setPlan] = useState("");
  const [status, setStatus] = useState("");
  const [city, setCity] = useState("");
  const [verified, setVerified] = useState<string>("");
  const [pioneer, setPioneer] = useState<string>("");

  const filters = { q, plan, status, city, verified, pioneer };

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-profiles", filters],
    queryFn: () =>
      list({
        data: {
          q: q || undefined,
          plan: plan || undefined,
          status: status || undefined,
          city: city || undefined,
          verified: verified === "" ? undefined : verified === "true",
          pioneer: pioneer === "" ? undefined : pioneer === "true",
        },
      }),
  });

  async function onToggle(id: string, cur: boolean) {
    await toggle({ data: { id, is_suspended: !cur } });
    qc.invalidateQueries({ queryKey: ["admin-profiles"] });
  }
  async function onDelete(id: string, name: string) {
    if (!confirm(`Excluir o perfil "${name}"? Esta ação é permanente.`)) return;
    await del({ data: { id } });
    qc.invalidateQueries({ queryKey: ["admin-profiles"] });
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">Perfis</h1>
        <Link
          to="/admin/perfis/novo"
          className="rounded-md bg-gradient-to-r from-[#D4AF37] to-[#B8860B] px-4 py-2 text-sm font-medium text-black"
        >
          + Novo Perfil
        </Link>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-2 md:grid-cols-6">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Nome"
          className="col-span-2 rounded-md border border-white/15 bg-black/40 px-3 py-2 text-sm"
        />
        <input
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Cidade"
          className="rounded-md border border-white/15 bg-black/40 px-3 py-2 text-sm"
        />
        <select
          value={plan}
          onChange={(e) => setPlan(e.target.value)}
          className="rounded-md border border-white/15 bg-black/40 px-3 py-2 text-sm"
        >
          <option value="">Plano</option>
          <option value="ouro">Ouro</option>
          <option value="prata">Prata</option>
          <option value="bronze">Bronze</option>
        </select>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-md border border-white/15 bg-black/40 px-3 py-2 text-sm"
        >
          <option value="">Status</option>
          <option value="ativo">Ativo</option>
          <option value="vencido">Vencido</option>
          <option value="cancelado">Cancelado</option>
          <option value="pausado">Pausado</option>
        </select>
        <div className="flex gap-2">
          <select
            value={verified}
            onChange={(e) => setVerified(e.target.value)}
            className="flex-1 rounded-md border border-white/15 bg-black/40 px-2 py-2 text-sm"
          >
            <option value="">Verif.</option>
            <option value="true">Sim</option>
            <option value="false">Não</option>
          </select>
          <select
            value={pioneer}
            onChange={(e) => setPioneer(e.target.value)}
            className="flex-1 rounded-md border border-white/15 bg-black/40 px-2 py-2 text-sm"
          >
            <option value="">Pion.</option>
            <option value="true">Sim</option>
            <option value="false">Não</option>
          </select>
        </div>
      </div>

      {error && (
        <p className="mb-3 text-sm text-red-400">{(error as Error).message}</p>
      )}
      {isLoading && <p className="text-sm text-white/60">Carregando...</p>}

      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full min-w-[900px] text-sm">
          <thead className="bg-white/5 text-left text-xs uppercase tracking-wider text-white/60">
            <tr>
              <th className="px-3 py-2">Perfil</th>
              <th className="px-3 py-2">Cidade</th>
              <th className="px-3 py-2">Plano</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Flags</th>
              <th className="px-3 py-2">Criado</th>
              <th className="px-3 py-2 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {(data ?? []).map((p) => (
              <tr key={p.id} className="border-t border-white/5">
                <td className="px-3 py-2">
                  <div className="flex items-center gap-2">
                    {p.main_image ? (
                      <img
                        src={p.main_image}
                        alt=""
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-white/10" />
                    )}
                    <div>
                      <div className="font-medium">{p.name}</div>
                      {p.is_suspended && (
                        <div className="text-[10px] text-red-300">Suspensa</div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-3 py-2 text-white/70">{p.location ?? "—"}</td>
                <td className="px-3 py-2 capitalize">{p.plan ?? "—"}</td>
                <td className="px-3 py-2">{p.subscription_status ?? "—"}</td>
                <td className="px-3 py-2 text-xs text-white/70">
                  {p.is_verified && <span className="mr-1">✔ Verif.</span>}
                  {p.is_pioneer && <span className="mr-1">🏆 Pion.</span>}
                  {p.subscription_type === "partnership" && (
                    <span className="mr-1 rounded bg-[#D4AF37]/15 px-1.5 py-0.5 text-[10px] text-[#D4AF37]">
                      🤝 Parceira
                    </span>
                  )}
                  {p.is_online && <span>🟢 Online</span>}
                </td>
                <td className="px-3 py-2 text-white/60">
                  {p.created_at
                    ? new Date(p.created_at).toLocaleDateString("pt-BR")
                    : "—"}
                </td>
                <td className="px-3 py-2 text-right">
                  <div className="inline-flex gap-1">
                    <Link
                      to="/admin/perfis/$id/editar"
                      params={{ id: p.id }}
                      className="rounded border border-white/15 px-2 py-1 text-xs hover:bg-white/5"
                    >
                      Editar
                    </Link>
                    <a
                      href={`/perfil/${p.id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded border border-white/15 px-2 py-1 text-xs hover:bg-white/5"
                    >
                      Ver
                    </a>
                    <button
                      onClick={() => onToggle(p.id, p.is_suspended)}
                      className="rounded border border-white/15 px-2 py-1 text-xs hover:bg-white/5"
                    >
                      {p.is_suspended ? "Ativar" : "Desativar"}
                    </button>
                    <button
                      onClick={() => onDelete(p.id, p.name)}
                      className="rounded border border-red-500/40 px-2 py-1 text-xs text-red-300 hover:bg-red-500/10"
                    >
                      Excluir
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!isLoading && (data ?? []).length === 0 && (
              <tr>
                <td colSpan={7} className="px-3 py-6 text-center text-white/50">
                  Nenhum perfil encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}