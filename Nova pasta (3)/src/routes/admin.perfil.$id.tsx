import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
  getProfileDetail,
  updateSubscription,
  renewSubscription,
  markPaymentReceived,
  createPayment,
} from "@/lib/admin.functions";

export const Route = createFileRoute("/admin/perfil/$id")({
  head: () => ({
    meta: [
      { title: "Perfil · Painel · AlmaPrivé" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminProfileDetail,
});

function fmtDate(iso: string | null | undefined) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("pt-BR");
  } catch {
    return iso;
  }
}
function fmtMoney(v: number | null | undefined) {
  if (v == null) return "—";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(v);
}

function AdminProfileDetail() {
  const { id } = Route.useParams();
  const fetchDetail = useServerFn(getProfileDetail);
  const qc = useQueryClient();
  const key = ["admin-profile", id];

  const { data, isLoading, error } = useQuery({
    queryKey: key,
    queryFn: () => fetchDetail({ data: { id } }),
    refetchOnWindowFocus: false,
  });

  const updateSub = useServerFn(updateSubscription);
  const renewSub = useServerFn(renewSubscription);
  const markPaid = useServerFn(markPaymentReceived);
  const addPayment = useServerFn(createPayment);

  const invalidate = () => qc.invalidateQueries({ queryKey: key });

  const updateMut = useMutation({
    mutationFn: (p: Parameters<typeof updateSub>[0]["data"]) =>
      updateSub({ data: p }),
    onSuccess: invalidate,
  });
  const renewMut = useMutation({
    mutationFn: (p: Parameters<typeof renewSub>[0]["data"]) =>
      renewSub({ data: p }),
    onSuccess: invalidate,
  });
  const payMut = useMutation({
    mutationFn: (p: Parameters<typeof markPaid>[0]["data"]) =>
      markPaid({ data: p }),
    onSuccess: invalidate,
  });
  const addPayMut = useMutation({
    mutationFn: (p: Parameters<typeof addPayment>[0]["data"]) =>
      addPayment({ data: p }),
    onSuccess: invalidate,
  });

  const [plan, setPlan] = useState("");
  const [status, setStatus] = useState("");
  const [type, setType] = useState("");
  const [expDate, setExpDate] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (data?.subscription) {
      setPlan(data.subscription.plan_type ?? "");
      setStatus(data.subscription.subscription_status ?? "");
      setType(data.subscription.subscription_type ?? "paid");
      setExpDate(
        data.subscription.expiration_date
          ? data.subscription.expiration_date.slice(0, 10)
          : "",
      );
      setNotes(data.subscription.notes ?? "");
    }
  }, [data?.subscription?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (error)
    return (
      <div className="rounded-md border border-red-500/30 bg-red-500/10 p-4 text-red-300">
        {(error as Error).message}
      </div>
    );
  if (isLoading || !data) return <div className="text-white/60">Carregando…</div>;

  const { profile, subscription, payments } = data;

  return (
    <div className="space-y-6">
      <div>
        <Link to="/admin" className="text-sm text-[#D4AF37] hover:underline">
          ← Voltar ao painel
        </Link>
        <h1 className="mt-2 text-2xl font-semibold">{profile.name}</h1>
        <p className="text-sm text-white/60">
          WhatsApp: {profile.whatsapp_number ?? "—"}
        </p>
      </div>

      {!subscription ? (
        <div className="rounded-md border border-yellow-500/30 bg-yellow-500/10 p-4 text-yellow-200">
          Este perfil ainda não possui nenhuma assinatura cadastrada.
        </div>
      ) : (
        <section className="rounded-xl border border-white/10 bg-white/[0.02] p-5">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white/70">
            Assinatura atual
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Plano">
              <select
                value={plan}
                onChange={(e) => setPlan(e.target.value)}
                className="input"
              >
                <option value="bronze">Bronze</option>
                <option value="prata">Prata</option>
                <option value="ouro">Ouro</option>
              </select>
            </Field>
            <Field label="Status">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="input"
              >
                <option value="ativo">ativo</option>
                <option value="vencido">vencido</option>
                <option value="cancelado">cancelado</option>
                <option value="pausado">pausado</option>
              </select>
            </Field>
            <Field label="Tipo de assinatura">
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="input"
              >
                <option value="paid">Pagante</option>
                <option value="partnership">Parceria</option>
              </select>
            </Field>
            <Field label="Vencimento">
              <input
                type="date"
                value={expDate}
                onChange={(e) => setExpDate(e.target.value)}
                className="input"
              />
            </Field>
            <div className="md:col-span-2">
              <Field label="Observações">
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="input"
                />
              </Field>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              disabled={updateMut.isPending}
              onClick={() =>
                updateMut.mutate({
                  subscriptionId: subscription.id,
                  plan_type: plan,
                  subscription_status: status as any,
                  subscription_type: type as any,
                  expiration_date: expDate
                    ? new Date(expDate).toISOString()
                    : null,
                  notes: notes || null,
                })
              }
              className="rounded-md bg-[#D4AF37] px-3 py-1.5 text-sm font-medium text-black hover:opacity-90 disabled:opacity-50"
            >
              Salvar alterações
            </button>
            <button
              disabled={renewMut.isPending}
              onClick={() =>
                renewMut.mutate({ subscriptionId: subscription.id, days: 30 })
              }
              className="rounded-md border border-white/15 px-3 py-1.5 text-sm hover:bg-white/5 disabled:opacity-50"
            >
              Renovar +30 dias
            </button>
            <button
              disabled={renewMut.isPending}
              onClick={() =>
                renewMut.mutate({ subscriptionId: subscription.id, days: 90 })
              }
              className="rounded-md border border-white/15 px-3 py-1.5 text-sm hover:bg-white/5 disabled:opacity-50"
            >
              Renovar +90 dias
            </button>
          </div>
          {(updateMut.isSuccess || renewMut.isSuccess) && (
            <p className="mt-2 text-xs text-green-400">Atualizado ✓</p>
          )}
        </section>
      )}

      <section className="rounded-xl border border-white/10 bg-white/[0.02] p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-white/70">
            Histórico de pagamentos
          </h2>
        </div>
        {subscription && subscription.plan_type !== "bronze" && (
          <ManualPaymentForm
            planType={subscription.plan_type}
            onSubmit={(p) =>
              addPayMut.mutate({
                profile_id: id,
                subscription_id: subscription.id,
                plan_type: subscription.plan_type,
                ...p,
              })
            }
            pending={addPayMut.isPending}
            success={addPayMut.isSuccess}
          />
        )}
        {subscription?.plan_type === "bronze" && (
          <div className="mb-4 rounded-md border border-green-500/20 bg-green-500/5 px-3 py-2 text-xs text-green-300">
            Plano Bronze é gratuito — não há cobrança associada.
          </div>
        )}
        <div className="overflow-x-auto rounded-lg border border-white/10">
          <table className="min-w-full divide-y divide-white/10 text-sm">
            <thead className="bg-white/[0.03] text-xs uppercase tracking-wider text-white/50">
              <tr>
                <th className="px-3 py-2 text-left">Data</th>
                <th className="px-3 py-2 text-left">Plano</th>
                <th className="px-3 py-2 text-left">Método</th>
                <th className="px-3 py-2 text-left">Valor</th>
                <th className="px-3 py-2 text-left">Desconto</th>
                <th className="px-3 py-2 text-left">Status</th>
                <th className="px-3 py-2 text-left">Vencimento</th>
                <th className="px-3 py-2 text-left">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {payments.map((p: any) => (
                <tr key={p.id}>
                  <td className="px-3 py-2">{fmtDate(p.payment_date ?? p.created_at)}</td>
                  <td className="px-3 py-2">{p.plan_type}</td>
                  <td className="px-3 py-2 capitalize">{p.payment_method ?? "—"}</td>
                  <td className="px-3 py-2">{fmtMoney(p.amount)}</td>
                  <td className="px-3 py-2">
                    {p.discount_percent && Number(p.discount_percent) > 0 ? (
                      <span className="rounded bg-[#D4AF37]/15 px-2 py-0.5 text-xs text-[#D4AF37]">
                        {Number(p.discount_percent)}%
                        {p.promo_label ? ` · ${p.promo_label}` : ""}
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <span
                      className={
                        p.payment_status === "pago"
                          ? "rounded bg-green-500/15 px-2 py-0.5 text-xs text-green-300"
                          : p.payment_status === "atrasado"
                            ? "rounded bg-red-500/15 px-2 py-0.5 text-xs text-red-300"
                            : "rounded bg-yellow-500/15 px-2 py-0.5 text-xs text-yellow-300"
                      }
                    >
                      {p.payment_status}
                    </span>
                  </td>
                  <td className="px-3 py-2">{fmtDate(p.expiration_date)}</td>
                  <td className="px-3 py-2">
                    {p.payment_status !== "pago" && (
                      <ConfirmPaymentButton
                        payment={p}
                        pending={payMut.isPending}
                        onConfirm={(patch) =>
                          payMut.mutate({ paymentId: p.id, ...patch })
                        }
                      />
                    )}
                  </td>
                </tr>
              ))}
              {payments.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-3 py-4 text-center text-white/60">
                    Nenhum pagamento registrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

/* ------------ Manual Payment Form ------------ */

const DEFAULT_PRICES: Record<string, number> = {
  ouro: 300,
  prata: 150,
  bronze: 0,
};

function ManualPaymentForm({
  planType,
  onSubmit,
  pending,
  success,
}: {
  planType: string;
  onSubmit: (p: {
    amount: number | null;
    original_amount: number | null;
    discount_percent: number;
    promo_label: string | null;
    payment_method: string | null;
    payment_date: string | null;
    payment_status: string;
  }) => void;
  pending: boolean;
  success: boolean;
}) {
  const plan = (planType ?? "").toLowerCase();
  const defaultAmount = DEFAULT_PRICES[plan] ?? 0;
  const [original, setOriginal] = useState(String(defaultAmount));
  const [method, setMethod] = useState("pix");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [status, setStatus] = useState<"pago" | "pendente">("pago");
  const [ouroPromo, setOuroPromo] = useState(false);
  const [prataFree, setPrataFree] = useState(false);

  useEffect(() => {
    setOriginal(String(DEFAULT_PRICES[plan] ?? 0));
    setOuroPromo(false);
    setPrataFree(false);
  }, [plan]);

  const origNum = Number(original) || 0;
  let discount = 0;
  let promoLabel: string | null = null;
  if (plan === "ouro" && ouroPromo) {
    discount = 50;
    promoLabel = "ouro_50_lancamento";
  } else if (plan === "prata" && prataFree) {
    discount = 100;
    promoLabel = "prata_mes_gratis";
  }
  const finalAmount = +(origNum * (1 - discount / 100)).toFixed(2);

  return (
    <div className="mb-4 rounded-lg border border-white/10 bg-white/[0.03] p-4">
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/60">
        Registrar pagamento manual
      </h3>
      <div className="grid gap-3 md:grid-cols-4">
        <Field label="Valor original (R$)">
          <input
            type="number"
            min="0"
            step="0.01"
            value={original}
            onChange={(e) => setOriginal(e.target.value)}
            className="input"
          />
        </Field>
        <Field label="Data">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="input"
          />
        </Field>
        <Field label="Método">
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            className="input"
          >
            <option value="pix">PIX</option>
            <option value="transferencia">Transferência</option>
            <option value="dinheiro">Dinheiro</option>
            <option value="cartao">Cartão</option>
            <option value="outro">Outro</option>
          </select>
        </Field>
        <Field label="Status">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as "pago" | "pendente")}
            className="input"
          >
            <option value="pago">Pago</option>
            <option value="pendente">Pendente</option>
          </select>
        </Field>
      </div>

      {plan === "ouro" && (
        <label className="mt-3 flex items-center gap-2 text-sm text-white/80">
          <input
            type="checkbox"
            checked={ouroPromo}
            onChange={(e) => setOuroPromo(e.target.checked)}
          />
          <span>
            Aplicar <strong className="text-[#D4AF37]">50% OFF</strong> — Promoção
            de lançamento (plano Ouro)
          </span>
        </label>
      )}
      {plan === "prata" && (
        <label className="mt-3 flex items-center gap-2 text-sm text-white/80">
          <input
            type="checkbox"
            checked={prataFree}
            onChange={(e) => setPrataFree(e.target.checked)}
          />
          <span>
            Ativar <strong className="text-[#C0C0C0]">1º mês grátis</strong> —
            Promoção de lançamento (plano Prata)
          </span>
        </label>
      )}

      <div className="mt-3 flex items-center justify-between rounded-md bg-black/40 px-3 py-2 text-sm">
        <span className="text-white/60">Valor final a cobrar:</span>
        <span className="font-semibold text-white">
          {new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
          }).format(finalAmount)}
          {discount > 0 && (
            <span className="ml-2 text-xs text-[#D4AF37]">
              (−{discount}%)
            </span>
          )}
        </span>
      </div>

      <div className="mt-3 flex gap-2">
        <button
          disabled={pending}
          onClick={() =>
            onSubmit({
              amount: finalAmount,
              original_amount: origNum,
              discount_percent: discount,
              promo_label: promoLabel,
              payment_method: method,
              payment_date: date ? new Date(date).toISOString() : null,
              payment_status: status,
            })
          }
          className="rounded-md bg-[#D4AF37] px-3 py-1.5 text-sm font-medium text-black hover:opacity-90 disabled:opacity-50"
        >
          {status === "pago" ? "Confirmar pagamento" : "Registrar pendente"}
        </button>
        {success && <span className="self-center text-xs text-green-400">Salvo ✓</span>}
      </div>
    </div>
  );
}

/* ------------ Confirm Existing Payment ------------ */

function ConfirmPaymentButton({
  payment,
  pending,
  onConfirm,
}: {
  payment: any;
  pending: boolean;
  onConfirm: (p: {
    amount: number | null;
    payment_method: string | null;
    payment_date: string | null;
  }) => void;
}) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(
    payment.amount != null ? String(payment.amount) : "",
  );
  const [method, setMethod] = useState(payment.payment_method ?? "pix");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded-md bg-green-500 px-2.5 py-1 text-xs font-medium text-black hover:opacity-90"
      >
        Marcar pago
      </button>
    );
  }
  return (
    <div className="flex flex-wrap items-center gap-1">
      <input
        type="number"
        step="0.01"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="R$"
        className="w-20 rounded border border-white/15 bg-black/40 px-1.5 py-0.5 text-xs text-white"
      />
      <select
        value={method}
        onChange={(e) => setMethod(e.target.value)}
        className="rounded border border-white/15 bg-black/40 px-1.5 py-0.5 text-xs text-white"
      >
        <option value="pix">PIX</option>
        <option value="transferencia">Transf.</option>
        <option value="dinheiro">Dinheiro</option>
        <option value="cartao">Cartão</option>
        <option value="outro">Outro</option>
      </select>
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="rounded border border-white/15 bg-black/40 px-1.5 py-0.5 text-xs text-white"
      />
      <button
        disabled={pending}
        onClick={() => {
          const amt = Number(amount);
          onConfirm({
            amount: Number.isFinite(amt) && amount !== "" ? amt : null,
            payment_method: method,
            payment_date: date ? new Date(date).toISOString() : null,
          });
          setOpen(false);
        }}
        className="rounded bg-green-500 px-2 py-0.5 text-xs font-medium text-black hover:opacity-90 disabled:opacity-50"
      >
        OK
      </button>
      <button
        onClick={() => setOpen(false)}
        className="rounded border border-white/15 px-2 py-0.5 text-xs text-white/70 hover:bg-white/5"
      >
        ✕
      </button>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs uppercase tracking-wider text-white/60">
        {label}
      </span>
      {children}
      <style>{`.input { width: 100%; border-radius: 0.375rem; border: 1px solid rgba(255,255,255,0.15); background: rgba(0,0,0,0.5); color: white; padding: 0.5rem 0.75rem; font-size: 0.875rem; outline: none; }`}</style>
    </label>
  );
}