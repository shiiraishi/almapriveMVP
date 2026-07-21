import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Fragment, useState } from "react";
import {
  listReports,
  updateReportStatus,
  suspendProfile,
  deleteProfile,
} from "@/lib/reports.functions";

export const Route = createFileRoute("/admin/denuncias")({
  head: () => ({
    meta: [
      { title: "Denúncias · AlmaPrivé" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminReports,
});

type Report = {
  id: string;
  profile_id: string;
  profile_name: string | null;
  reason: string;
  description: string;
  status: string;
  created_at: string;
};

const STATUS_TABS = [
  { key: "pendente", label: "Pendentes", color: "#FBBF24" },
  { key: "resolvido", label: "Resolvidas", color: "#86EFAC" },
  { key: "rejeitado", label: "Rejeitadas", color: "#F87171" },
] as const;

function formatDateTime(iso: string) {
  try {
    return new Date(iso).toLocaleString("pt-BR");
  } catch {
    return iso;
  }
}

function AdminReports() {
  const fetchList = useServerFn(listReports);
  const updateStatus = useServerFn(updateReportStatus);
  const suspendFn = useServerFn(suspendProfile);
  const deleteFn = useServerFn(deleteProfile);
  const qc = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-reports"],
    queryFn: () => fetchList() as Promise<Report[]>,
    refetchOnWindowFocus: false,
  });

  const [tab, setTab] = useState<"pendente" | "resolvido" | "rejeitado">("pendente");
  const [openId, setOpenId] = useState<string | null>(null);

  const statusMut = useMutation({
    mutationFn: (vars: { id: string; status: "pendente" | "resolvido" | "rejeitado" }) =>
      updateStatus({ data: vars }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-reports"] }),
  });
  const suspendMut = useMutation({
    mutationFn: (vars: { profile_id: string; suspended: boolean }) =>
      suspendFn({ data: vars }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-reports"] }),
  });
  const deleteMut = useMutation({
    mutationFn: (vars: { profile_id: string }) => deleteFn({ data: vars }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-reports"] }),
  });

  if (error) {
    return (
      <div className="rounded-md border border-red-500/30 bg-red-500/10 p-4 text-red-300">
        {(error as Error).message}
      </div>
    );
  }
  if (isLoading || !data) {
    return <div className="p-6 text-white/60">Carregando…</div>;
  }

  const counts = {
    pendente: data.filter((r) => r.status === "pendente").length,
    resolvido: data.filter((r) => r.status === "resolvido").length,
    rejeitado: data.filter((r) => r.status === "rejeitado").length,
  };
  const rows = data.filter((r) => r.status === tab);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">🚩 Denúncias</h1>
        <Link to="/admin" className="text-xs text-white/60 hover:text-white">
          ← voltar ao dashboard
        </Link>
      </div>

      <div className="flex flex-wrap gap-2">
        {STATUS_TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`rounded-full border px-3 py-1.5 text-xs uppercase tracking-wider ${
              tab === t.key
                ? "border-[#D4AF37] bg-[#D4AF37]/15 text-[#D4AF37]"
                : "border-white/15 text-white/60 hover:text-white"
            }`}
          >
            {t.label} ({counts[t.key]})
          </button>
        ))}
      </div>

      <div className="overflow-x-auto rounded-lg border border-white/10">
        <table className="min-w-full divide-y divide-white/10">
          <thead className="bg-white/[0.03]">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-white/50">Perfil</th>
              <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-white/50">Motivo</th>
              <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-white/50">Data</th>
              <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-white/50">Status</th>
              <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-white/50">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="px-3 py-6 text-center text-sm text-white/40">
                  Nenhuma denúncia nesta categoria.
                </td>
              </tr>
            )}
            {rows.map((r) => {
              const isOpen = openId === r.id;
              return (
                <Fragment key={r.id}>
                  <tr className="hover:bg-white/[0.03]">
                    <td className="px-3 py-2 text-sm">
                      <Link
                        to="/admin/perfil/$id"
                        params={{ id: r.profile_id }}
                        className="text-[#D4AF37] hover:underline"
                      >
                        {r.profile_name ?? "(sem nome)"}
                      </Link>
                    </td>
                    <td className="px-3 py-2 text-sm">{r.reason}</td>
                    <td className="px-3 py-2 text-sm">{formatDateTime(r.created_at)}</td>
                    <td className="px-3 py-2 text-sm">
                      <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs uppercase tracking-wider">
                        {r.status}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-sm">
                      <button
                        type="button"
                        onClick={() => setOpenId(isOpen ? null : r.id)}
                        className="rounded-md border border-white/15 px-2 py-1 text-xs hover:bg-white/5"
                      >
                        {isOpen ? "Fechar" : "Abrir"}
                      </button>
                    </td>
                  </tr>
                  {isOpen && (
                    <tr>
                      <td colSpan={5} className="bg-white/[0.02] px-4 py-4">
                        <div className="space-y-3">
                          <div>
                            <p className="text-[10px] uppercase tracking-wider text-white/50">Descrição</p>
                            <p className="mt-1 whitespace-pre-wrap text-sm text-white/90">
                              {r.description}
                            </p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => statusMut.mutate({ id: r.id, status: "resolvido" })}
                              disabled={statusMut.isPending}
                              className="rounded-md bg-emerald-500/90 px-3 py-1.5 text-xs font-medium text-black hover:bg-emerald-400 disabled:opacity-50"
                            >
                              ✅ Marcar como resolvida
                            </button>
                            <button
                              type="button"
                              onClick={() => statusMut.mutate({ id: r.id, status: "rejeitado" })}
                              disabled={statusMut.isPending}
                              className="rounded-md bg-white/10 px-3 py-1.5 text-xs font-medium hover:bg-white/15 disabled:opacity-50"
                            >
                              ❌ Rejeitar denúncia
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (confirm("Suspender este perfil? Ele será ocultado da listagem pública.")) {
                                  suspendMut.mutate({ profile_id: r.profile_id, suspended: true });
                                }
                              }}
                              disabled={suspendMut.isPending}
                              className="rounded-md bg-amber-500/90 px-3 py-1.5 text-xs font-medium text-black hover:bg-amber-400 disabled:opacity-50"
                            >
                              ⛔ Suspender perfil
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (confirm("Excluir definitivamente este perfil? Esta ação não pode ser desfeita.")) {
                                  deleteMut.mutate({ profile_id: r.profile_id });
                                  statusMut.mutate({ id: r.id, status: "resolvido" });
                                }
                              }}
                              disabled={deleteMut.isPending}
                              className="rounded-md bg-rose-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-rose-500 disabled:opacity-50"
                            >
                              🗑 Excluir perfil
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}