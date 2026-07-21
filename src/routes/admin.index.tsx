import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { getDashboardData, searchProfiles } from "@/lib/admin.functions";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "Painel · AlmaPrivé" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminDashboard,
});

const WHATSAPP_BASE = "https://wa.me/";

function waLink(num: string | null | undefined, msg: string) {
  if (!num) return "#";
  const digits = num.replace(/\D/g, "");
  return `${WHATSAPP_BASE}${digits}?text=${encodeURIComponent(msg)}`;
}

function cobrancaMsg(nome: string, plano: string) {
  return `Olá, ${nome}.\n\nSeu plano ${plano} no AlmaPrivé está próximo do vencimento.\n\nCaso deseje renovar seu anúncio e manter sua visibilidade, entre em contato conosco.\n\nEquipe AlmaPrivé.`;
}

function atrasoMsg(nome: string, plano: string, dias: number) {
  return `Olá, ${nome}.\n\nSeu plano ${plano} no AlmaPrivé está em atraso há ${dias} dia(s).\n\nPor favor entre em contato para regularizar e manter seu anúncio ativo.\n\nEquipe AlmaPrivé.`;
}

function formatDate(iso: string | null | undefined) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("pt-BR");
  } catch {
    return iso;
  }
}

function formatMoney(v: number | null | undefined) {
  if (v == null) return "—";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(v);
}

function Card({
  emoji,
  title,
  value,
  accent,
}: {
  emoji: string;
  title: string;
  value: number;
  accent?: string;
}) {
  return (
    <div
      className="rounded-xl border border-white/10 bg-gradient-to-br from-white/[0.04] to-white/[0.01] p-4"
      style={{ borderColor: accent ? `${accent}55` : undefined }}
    >
      <div className="flex items-center justify-between text-xs uppercase tracking-wider text-white/60">
        <span>{title}</span>
        <span className="text-base">{emoji}</span>
      </div>
      <div
        className="mt-2 text-3xl font-semibold"
        style={{ color: accent ?? "white" }}
      >
        {value}
      </div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-3 mt-8 text-sm font-semibold uppercase tracking-wider text-white/70">
      {children}
    </h2>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-white/50">
      {children}
    </th>
  );
}
function Td({ children }: { children: React.ReactNode }) {
  return <td className="px-3 py-2 text-sm">{children}</td>;
}

function PlanColumn({
  title,
  emoji,
  accent,
  rows,
  freeBadge,
}: {
  title: string;
  emoji: string;
  accent: string;
  rows: any[];
  freeBadge?: boolean;
}) {
  return (
    <div
      className="rounded-xl border bg-white/[0.02] p-4"
      style={{ borderColor: `${accent}55` }}
    >
      <div className="mb-3 flex items-center justify-between">
        <h3
          className="text-sm font-semibold uppercase tracking-wider"
          style={{ color: accent }}
        >
          <span className="mr-1">{emoji}</span>
          {title}
        </h3>
        <div className="flex items-center gap-2">
          {freeBadge && (
            <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-emerald-300">
              Gratuito
            </span>
          )}
          <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-white/70">
            {rows.length}
          </span>
        </div>
      </div>
      <ul className="max-h-72 space-y-1 overflow-y-auto pr-1">
        {rows.length === 0 && (
          <li className="text-xs text-white/40">Nenhum perfil.</li>
        )}
        {rows.map((r, i) => (
          <li
            key={r.id ?? i}
            className="flex items-center justify-between rounded-md px-2 py-1 hover:bg-white/[0.04]"
          >
            <span className="truncate text-sm">{r.name ?? "(sem nome)"}</span>
            {r.id && (
              <Link
                to="/admin/perfil/$id"
                params={{ id: r.id }}
                className="ml-2 shrink-0 text-xs text-[#D4AF37] hover:underline"
              >
                abrir
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function AdminDashboard() {
  const fetchData = useServerFn(getDashboardData);
  const fetchSearch = useServerFn(searchProfiles);
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: () => fetchData(),
    refetchOnWindowFocus: false,
  });

  const [q, setQ] = useState("");
  const [planFilter, setPlanFilter] = useState<
    "todos" | "ouro" | "prata" | "bronze" | "parceria"
  >("todos");
  const search = useQuery({
    queryKey: ["admin-search", q],
    queryFn: () => fetchSearch({ data: { q } }),
    enabled: q.trim().length >= 2 || q === "",
    refetchOnWindowFocus: false,
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

  const c = data.counts;
  const GOLD = "#D4AF37";

  const filteredSearch = (search.data ?? []).filter((r) => {
    if (planFilter === "todos") return true;
    if (planFilter === "parceria") return r.type === "partnership";
    return (r.plan ?? "").toLowerCase() === planFilter;
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Dashboard</h1>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-7">
        <Card emoji="👑" title="Ouro Ativos" value={c.ouro} accent={GOLD} />
        <Card emoji="🥈" title="Prata Ativos" value={c.prata} accent="#C0C0C0" />
        <Card emoji="🥉" title="Bronze Ativos" value={c.bronze} accent="#CD7F32" />
        <Card emoji="🤝" title="Parceiras" value={c.parcerias} />
        <Card emoji="⚠️" title="Vencendo 7d" value={c.vencendo} accent="#FBBF24" />
        <Card emoji="🚨" title="Atrasadas" value={c.atrasadas} accent="#F87171" />
        <Card emoji="💰" title="Pgtos Pendentes" value={c.pendentes} accent="#86EFAC" />
      </div>

      {/* Colunas por plano */}
      <SectionTitle>📋 Perfis por plano</SectionTitle>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <PlanColumn
          title="Ouro"
          emoji="👑"
          accent={GOLD}
          rows={(data as any).ouro ?? []}
        />
        <PlanColumn
          title="Prata"
          emoji="🥈"
          accent="#C0C0C0"
          rows={(data as any).prata ?? []}
        />
        <PlanColumn
          title="Bronze"
          emoji="🥉"
          accent="#CD7F32"
          rows={(data as any).bronze ?? []}
          freeBadge
        />
        <PlanColumn
          title="Parcerias"
          emoji="🤝"
          accent="#A78BFA"
          rows={data.parcerias ?? []}
        />
      </div>

      {/* Busca */}
      <SectionTitle>🔎 Buscar perfil</SectionTitle>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Buscar por nome, WhatsApp ou plano…"
        className="w-full rounded-md border border-white/15 bg-black/60 px-3 py-2 text-sm outline-none focus:border-[#D4AF37]"
      />
      <div className="flex flex-wrap gap-2">
        {(["todos", "ouro", "prata", "bronze", "parceria"] as const).map(
          (key) => (
            <button
              key={key}
              type="button"
              onClick={() => setPlanFilter(key)}
              className={`rounded-full border px-3 py-1 text-xs uppercase tracking-wider ${
                planFilter === key
                  ? "border-[#D4AF37] bg-[#D4AF37]/15 text-[#D4AF37]"
                  : "border-white/15 text-white/60 hover:text-white"
              }`}
            >
              {key === "todos" ? "Todos" : key}
            </button>
          ),
        )}
      </div>
      <div className="overflow-x-auto rounded-lg border border-white/10">
        <table className="min-w-full divide-y divide-white/10">
          <thead className="bg-white/[0.03]">
            <tr>
              <Th>Nome</Th>
              <Th>Plano</Th>
              <Th>Tipo</Th>
              <Th>Status</Th>
              <Th>Vencimento</Th>
              <Th>WhatsApp</Th>
              <Th>Ações</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredSearch.map((r) => (
              <tr key={r.id} className="hover:bg-white/[0.03]">
                <Td>{r.name}</Td>
                <Td>{r.plan ?? "—"}</Td>
                <Td>{r.type === "partnership" ? "Parceira" : "Pagante"}</Td>
                <Td>{r.status ?? "—"}</Td>
                <Td>{formatDate(r.expiration)}</Td>
                <Td>{r.whatsapp ?? "—"}</Td>
                <Td>
                  <Link
                    to="/admin/perfil/$id"
                    params={{ id: r.id }}
                    className="text-[#D4AF37] hover:underline"
                  >
                    Abrir
                  </Link>
                </Td>
              </tr>
            ))}
            {filteredSearch.length === 0 && (
              <tr>
                <Td>—</Td>
                <Td>—</Td>
                <Td>—</Td>
                <Td>—</Td>
                <Td>—</Td>
                <Td>—</Td>
                <Td>—</Td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Próximos Vencimentos */}
      <SectionTitle>⚠️ Próximos vencimentos (7 dias)</SectionTitle>
      <div className="overflow-x-auto rounded-lg border border-white/10">
        <table className="min-w-full divide-y divide-white/10">
          <thead className="bg-white/[0.03]">
            <tr>
              <Th>Nome</Th>
              <Th>Plano</Th>
              <Th>Vencimento</Th>
              <Th>WhatsApp</Th>
              <Th>Cobrança</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {data.vencendo.map((r: any, i: number) => (
              <tr key={i} className="hover:bg-white/[0.03]">
                <Td>{r.name}</Td>
                <Td>{r.plan_type}</Td>
                <Td>{formatDate(r.expiration_date)}</Td>
                <Td>{r.whatsapp_number ?? "—"}</Td>
                <Td>
                  <a
                    href={waLink(
                      r.whatsapp_number,
                      cobrancaMsg(r.name, r.plan_type),
                    )}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-md bg-[#D4AF37] px-2.5 py-1 text-xs font-medium text-black hover:opacity-90"
                  >
                    Enviar
                  </a>
                </Td>
              </tr>
            ))}
            {data.vencendo.length === 0 && (
              <tr>
                <Td>Nenhuma assinatura vencendo.</Td>
                <Td>—</Td>
                <Td>—</Td>
                <Td>—</Td>
                <Td>—</Td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Atrasadas */}
      <SectionTitle>🚨 Assinaturas atrasadas</SectionTitle>
      <div className="overflow-x-auto rounded-lg border border-white/10">
        <table className="min-w-full divide-y divide-white/10">
          <thead className="bg-white/[0.03]">
            <tr>
              <Th>Nome</Th>
              <Th>Plano</Th>
              <Th>Dias em atraso</Th>
              <Th>WhatsApp</Th>
              <Th>Cobrança</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {data.atrasadas.map((r: any, i: number) => (
              <tr key={i} className="hover:bg-white/[0.03]">
                <Td>{r.name}</Td>
                <Td>{r.plan_type}</Td>
                <Td>
                  <span className="text-red-400">{r.dias_em_atraso}</span>
                </Td>
                <Td>{r.whatsapp_number ?? "—"}</Td>
                <Td>
                  <a
                    href={waLink(
                      r.whatsapp_number,
                      atrasoMsg(r.name, r.plan_type, r.dias_em_atraso),
                    )}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-md bg-red-500 px-2.5 py-1 text-xs font-medium text-white hover:opacity-90"
                  >
                    Enviar
                  </a>
                </Td>
              </tr>
            ))}
            {data.atrasadas.length === 0 && (
              <tr>
                <Td>Nenhuma assinatura atrasada.</Td>
                <Td>—</Td>
                <Td>—</Td>
                <Td>—</Td>
                <Td>—</Td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagamentos Pendentes */}
      <SectionTitle>💰 Pagamentos pendentes</SectionTitle>
      <div className="overflow-x-auto rounded-lg border border-white/10">
        <table className="min-w-full divide-y divide-white/10">
          <thead className="bg-white/[0.03]">
            <tr>
              <Th>Nome</Th>
              <Th>Plano</Th>
              <Th>Valor</Th>
              <Th>Status</Th>
              <Th>Data prevista</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {data.pendentes.map((r: any, i: number) => (
              <tr key={i} className="hover:bg-white/[0.03]">
                <Td>{r.name}</Td>
                <Td>{r.plan_type}</Td>
                <Td>{formatMoney(r.amount)}</Td>
                <Td>
                  <span className="rounded bg-yellow-500/15 px-2 py-0.5 text-xs text-yellow-300">
                    pendente
                  </span>
                </Td>
                <Td>{formatDate(r.data_prevista)}</Td>
              </tr>
            ))}
            {data.pendentes.length === 0 && (
              <tr>
                <Td>Nenhum pagamento pendente.</Td>
                <Td>—</Td>
                <Td>—</Td>
                <Td>—</Td>
                <Td>—</Td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Parceiras */}
      <SectionTitle>🤝 Parceiras ativas</SectionTitle>
      <div className="overflow-x-auto rounded-lg border border-white/10">
        <table className="min-w-full divide-y divide-white/10">
          <thead className="bg-white/[0.03]">
            <tr>
              <Th>Nome</Th>
              <Th>Plano</Th>
              <Th>Observação</Th>
              <Th>Cadastro</Th>
              <Th>WhatsApp</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {data.parcerias.map((r: any, i: number) => (
              <tr key={i} className="hover:bg-white/[0.03]">
                <Td>{r.name}</Td>
                <Td>{r.plan_type}</Td>
                <Td>
                  <span className="text-white/70">{r.notes ?? "—"}</span>
                </Td>
                <Td>{formatDate(r.created_at)}</Td>
                <Td>{r.whatsapp_number ?? "—"}</Td>
              </tr>
            ))}
            {data.parcerias.length === 0 && (
              <tr>
                <Td>Nenhuma parceria ativa.</Td>
                <Td>—</Td>
                <Td>—</Td>
                <Td>—</Td>
                <Td>—</Td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}