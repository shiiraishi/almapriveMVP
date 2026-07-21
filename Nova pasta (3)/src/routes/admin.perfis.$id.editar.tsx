import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  getAdminProfile,
  updateAdminProfile,
} from "@/lib/profiles-admin.functions";
import {
  ProfileForm,
  emptyProfile,
  toFormValues,
  type ProfileFormValues,
} from "@/components/admin/ProfileForm";

export const Route = createFileRoute("/admin/perfis/$id/editar")({
  head: () => ({
    meta: [
      { title: "Editar perfil · AlmaPrivé" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: EditarPerfil,
});

function money(v: number | null | undefined) {
  if (v == null) return "—";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(v);
}
function date(v: string | null | undefined) {
  if (!v) return "—";
  try {
    return new Date(v).toLocaleDateString("pt-BR");
  } catch {
    return v;
  }
}

function EditarPerfil() {
  const { id } = Route.useParams();
  const router = useRouter();
  const qc = useQueryClient();
  const fetchProfile = useServerFn(getAdminProfile);
  const update = useServerFn(updateAdminProfile);

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-profile", id],
    queryFn: () => fetchProfile({ data: { id } }),
  });

  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  async function onSubmit(v: ProfileFormValues) {
    setBusy(true);
    setErr(null);
    setOk(false);
    try {
      await update({ data: { id, patch: v as never } });
      setOk(true);
      qc.invalidateQueries({ queryKey: ["admin-profile", id] });
      qc.invalidateQueries({ queryKey: ["admin-profiles"] });
      setTimeout(() => setOk(false), 2000);
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  if (isLoading) return <p className="text-white/60">Carregando...</p>;
  if (error)
    return <p className="text-red-400">{(error as Error).message}</p>;
  if (!data) return null;

  const sub = data.subscription;
  const pay = data.lastPayment;
  const initial = {
    ...(toFormValues(data.profile as Record<string, unknown>) ?? emptyProfile),
    plan: (["ouro", "prata", "bronze"].includes(
      ((sub?.plan_type as string) ?? "").toLowerCase(),
    )
      ? ((sub!.plan_type as string).toLowerCase() as "ouro" | "prata" | "bronze")
      : "bronze"),
    cadastro_type: ((sub as any)?.subscription_type === "partnership"
      ? "partnership"
      : "paid") as "paid" | "partnership",
    partnership_reason: ((sub as any)?.partnership_reason ?? "") as string,
    partnership_notes: ((sub as any)?.partnership_notes ?? "") as string,
    partnership_start_date: ((sub as any)?.partnership_start_date ?? null) as
      | string
      | null,
    partnership_review_date: ((sub as any)?.partnership_review_date ?? null) as
      | string
      | null,
    partnership_status: (((sub as any)?.partnership_status as
      | "ativa"
      | "pausada"
      | "encerrada") ?? "ativa"),
  };

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-xl font-semibold">
          Editar: <span className="text-[#D4AF37]">{initial.name || id}</span>
        </h1>
        <div className="flex gap-2">
          <a
            href={`/perfil/${id}`}
            target="_blank"
            rel="noreferrer"
            className="rounded-md border border-white/15 px-3 py-1.5 text-sm text-white/80 hover:bg-white/5"
          >
            Visualizar site
          </a>
          <Link
            to="/admin/perfis"
            className="rounded-md border border-white/15 px-3 py-1.5 text-sm text-white/80 hover:bg-white/5"
          >
            ← Voltar
          </Link>
        </div>
      </div>

      <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-2">
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3 text-sm">
          <div className="text-xs uppercase tracking-wider text-white/60">
            Assinatura
          </div>
          <div className="mt-1">
            Plano: <span className="capitalize">{sub?.plan_type ?? "—"}</span> ·
            Status: {sub?.subscription_status ?? "—"} · Vencimento:{" "}
            {date(sub?.expiration_date)}
          </div>
          <Link
            to="/admin/perfil/$id"
            params={{ id }}
            className="mt-2 inline-block rounded border border-white/15 px-2 py-1 text-xs hover:bg-white/5"
          >
            Abrir assinatura
          </Link>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3 text-sm">
          <div className="text-xs uppercase tracking-wider text-white/60">
            Último pagamento
          </div>
          <div className="mt-1">
            {money(pay?.amount)} · {pay?.payment_status ?? "—"} ·{" "}
            {date(pay?.payment_date)}
          </div>
          <Link
            to="/admin/perfil/$id"
            params={{ id }}
            className="mt-2 inline-block rounded border border-white/15 px-2 py-1 text-xs hover:bg-white/5"
          >
            Ver financeiro
          </Link>
        </div>
      </div>

      {err && <p className="mb-3 text-sm text-red-400">{err}</p>}
      {ok && <p className="mb-3 text-sm text-emerald-400">Salvo!</p>}

      <ProfileForm
        initial={initial}
        profileId={id}
        onSubmit={onSubmit}
        submitting={busy}
        submitLabel="Salvar alterações"
      />
    </div>
  );
}