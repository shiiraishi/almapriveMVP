import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

/* ---------------- Auth ---------------- */

export const checkAdminAuth = createServerFn({ method: "GET" }).handler(
  async () => {
    const { isAdminAuthenticated } = await import("./admin-session.server");
    return { isAdmin: await isAdminAuthenticated() };
  },
);

export const adminLogin = createServerFn({ method: "POST" })
  .inputValidator((d: { password: string }) =>
    z.object({ password: z.string().min(1) }).parse(d),
  )
  .handler(async ({ data }) => {
    const expected = process.env.ADMIN_PASSWORD;
    if (!expected) throw new Error("ADMIN_PASSWORD not configured");
    // tiny constant-time delay to slow brute force
    await new Promise((r) => setTimeout(r, 300));
    if (data.password !== expected) {
      return { ok: false as const, error: "Senha incorreta" };
    }
    const { getAdminSession } = await import("./admin-session.server");
    const session = await getAdminSession();
    await session.update({ isAdmin: true, loggedAt: Date.now() });
    return { ok: true as const };
  });

export const adminLogout = createServerFn({ method: "POST" }).handler(
  async () => {
    const { getAdminSession } = await import("./admin-session.server");
    const session = await getAdminSession();
    await session.clear();
    return { ok: true };
  },
);

/* ---------------- Dashboard ---------------- */

export const getDashboardData = createServerFn({ method: "GET" }).handler(
  async () => {
    const { assertAdmin } = await import("./admin-session.server");
    await assertAdmin();
    const { getSupabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );
    const sb = getSupabaseAdmin();

    const [ouro, prata, bronze, parcerias, vencendo, atrasadas, pendentes] =
      await Promise.all([
        sb.from("v_ouro_ativos").select("*"),
        sb.from("v_prata_ativos").select("*"),
        sb.from("v_bronze_ativos").select("*"),
        sb.from("v_parcerias_ativas").select("*"),
        sb
          .from("v_assinaturas_vencendo")
          .select("*")
          .order("expiration_date", { ascending: true }),
        sb
          .from("v_assinaturas_atrasadas")
          .select("*")
          .order("dias_em_atraso", { ascending: false }),
        sb
          .from("v_pagamentos_pendentes")
          .select("*")
          .order("data_prevista", { ascending: true }),
      ]);

    const report = (label: string, res: { data: unknown; error: unknown }) => {
      const rows = Array.isArray(res.data) ? res.data.length : 0;
      if (res.error) {
        console.error(`[admin][${label}] supabase error:`, res.error);
      } else {
        console.log(`[admin][${label}] rows=${rows}`);
      }
    };
    report("v_ouro_ativos", ouro);
    report("v_prata_ativos", prata);
    report("v_bronze_ativos", bronze);
    report("v_parcerias_ativas", parcerias);
    report("v_assinaturas_vencendo", vencendo);
    report("v_assinaturas_atrasadas", atrasadas);
    report("v_pagamentos_pendentes", pendentes);

    return {
      counts: {
        ouro: ouro.data?.length ?? 0,
        prata: prata.data?.length ?? 0,
        bronze: bronze.data?.length ?? 0,
        parcerias: parcerias.data?.length ?? 0,
        vencendo: vencendo.data?.length ?? 0,
        atrasadas: atrasadas.data?.length ?? 0,
        pendentes: pendentes.data?.length ?? 0,
      },
      ouro: ouro.data ?? [],
      prata: prata.data ?? [],
      bronze: bronze.data ?? [],
      vencendo: vencendo.data ?? [],
      atrasadas: atrasadas.data ?? [],
      pendentes: pendentes.data ?? [],
      parcerias: parcerias.data ?? [],
    };
  },
);

/* ---------------- Search ---------------- */

export const searchProfiles = createServerFn({ method: "POST" })
  .inputValidator((d: { q: string }) =>
    z.object({ q: z.string().max(120) }).parse(d),
  )
  .handler(async ({ data }) => {
    const { assertAdmin } = await import("./admin-session.server");
    await assertAdmin();
    const { getSupabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );
    const sb = getSupabaseAdmin();

    const q = data.q.trim();
    let query = sb
      .from("profiles")
      .select(
        "id, name, whatsapp_number, subscriptions(id, plan_type, subscription_status, subscription_type, expiration_date)",
      )
      .limit(60);

    if (q) {
      query = query.or(
        `name.ilike.%${q}%,whatsapp_number.ilike.%${q}%`,
      );
    }

    const { data: rows, error } = await query;
    if (error) throw new Error(error.message);

    let results = (rows ?? []).map((p: any) => {
      const active = (p.subscriptions ?? []).find(
        (s: any) => s.subscription_status === "ativo",
      );
      const sub = active ?? (p.subscriptions ?? [])[0] ?? null;
      return {
        id: p.id as string,
        name: (p.name as string | null) ?? "(sem nome)",
        whatsapp: (p.whatsapp_number as string | null) ?? null,
        plan: sub?.plan_type ?? null,
        status: sub?.subscription_status ?? null,
        type: sub?.subscription_type ?? null,
        expiration: sub?.expiration_date ?? null,
      };
    });

    // Allow filter by plan via the same query string
    if (q) {
      const qLower = q.toLowerCase();
      const planMatch = results.filter((r) =>
        r.plan?.toLowerCase().includes(qLower),
      );
      // If text didn't match a name/whatsapp, broaden with plan filter
      if (results.length === 0 && planMatch.length > 0) results = planMatch;
    }

    return results;
  });

/* ---------------- Profile detail ---------------- */

export const getProfileDetail = createServerFn({ method: "POST" })
  .inputValidator((d: { id: string }) =>
    z.object({ id: z.string().uuid() }).parse(d),
  )
  .handler(async ({ data }) => {
    const { assertAdmin } = await import("./admin-session.server");
    await assertAdmin();
    const { getSupabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );
    const sb = getSupabaseAdmin();

    const [{ data: profile }, { data: subs }, { data: payments }] =
      await Promise.all([
        sb
          .from("profiles")
          .select("id, name, whatsapp_number")
          .eq("id", data.id)
          .maybeSingle(),
        sb
          .from("subscriptions")
          .select("*")
          .eq("profile_id", data.id)
          .order("created_at", { ascending: false }),
        sb
          .from("payments")
          .select("*")
          .eq("profile_id", data.id)
          .order("created_at", { ascending: false })
          .limit(20),
      ]);

    if (!profile) throw new Error("Perfil não encontrado");
    const active =
      (subs ?? []).find((s: any) => s.subscription_status === "ativo") ??
      (subs ?? [])[0] ??
      null;

    return {
      profile,
      subscription: active,
      allSubscriptions: subs ?? [],
      payments: payments ?? [],
    };
  });

/* ---------------- Actions ---------------- */

export const updateSubscription = createServerFn({ method: "POST" })
  .inputValidator(
    (d: {
      subscriptionId: string;
      plan_type?: string;
      subscription_status?: string;
      subscription_type?: string;
      expiration_date?: string | null;
      notes?: string | null;
    }) =>
      z
        .object({
          subscriptionId: z.string().uuid(),
          plan_type: z.string().optional(),
          subscription_status: z
            .enum(["ativo", "vencido", "cancelado", "pausado"])
            .optional(),
          subscription_type: z.enum(["paid", "partnership"]).optional(),
          expiration_date: z.string().nullable().optional(),
          notes: z.string().nullable().optional(),
        })
        .parse(d),
  )
  .handler(async ({ data }) => {
    const { assertAdmin } = await import("./admin-session.server");
    await assertAdmin();
    const { getSupabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );
    const sb = getSupabaseAdmin();
    const { subscriptionId, ...patch } = data;
    const cleaned: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(patch)) {
      if (v !== undefined) cleaned[k] = v;
    }
    const { error } = await sb
      .from("subscriptions")
      .update(cleaned as never)
      .eq("id", subscriptionId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const renewSubscription = createServerFn({ method: "POST" })
  .inputValidator((d: { subscriptionId: string; days: number }) =>
    z
      .object({
        subscriptionId: z.string().uuid(),
        days: z.number().int().positive().max(366),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const { assertAdmin } = await import("./admin-session.server");
    await assertAdmin();
    const { getSupabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );
    const sb = getSupabaseAdmin();
    const { data: sub } = await sb
      .from("subscriptions")
      .select("expiration_date")
      .eq("id", data.subscriptionId)
      .maybeSingle();
    const base =
      sub?.expiration_date && new Date(sub.expiration_date) > new Date()
        ? new Date(sub.expiration_date)
        : new Date();
    base.setDate(base.getDate() + data.days);
    const { error } = await sb
      .from("subscriptions")
      .update({
        expiration_date: base.toISOString(),
        subscription_status: "ativo",
      })
      .eq("id", data.subscriptionId);
    if (error) throw new Error(error.message);
    return { ok: true, expiration_date: base.toISOString() };
  });

export const markPaymentReceived = createServerFn({ method: "POST" })
  .inputValidator(
    (d: {
      paymentId: string;
      amount?: number | null;
      payment_method?: string | null;
      payment_date?: string | null;
      original_amount?: number | null;
      discount_percent?: number | null;
      promo_label?: string | null;
      notes?: string | null;
    }) =>
      z
        .object({
          paymentId: z.string().uuid(),
          amount: z.number().nullable().optional(),
          payment_method: z.string().nullable().optional(),
          payment_date: z.string().nullable().optional(),
          original_amount: z.number().nullable().optional(),
          discount_percent: z.number().min(0).max(100).nullable().optional(),
          promo_label: z.string().nullable().optional(),
          notes: z.string().nullable().optional(),
        })
        .parse(d),
  )
  .handler(async ({ data }) => {
    const { assertAdmin } = await import("./admin-session.server");
    await assertAdmin();
    const { getSupabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );
    const sb = getSupabaseAdmin();
    const patch: Record<string, unknown> = {
      payment_status: "pago",
      payment_date: data.payment_date ?? new Date().toISOString(),
    };
    if (data.amount != null) patch.amount = data.amount;
    if (data.payment_method != null) patch.payment_method = data.payment_method;
    if (data.original_amount != null) patch.original_amount = data.original_amount;
    if (data.discount_percent != null) patch.discount_percent = data.discount_percent;
    if (data.promo_label != null) patch.promo_label = data.promo_label;
    if (data.notes != null) patch.notes = data.notes;
    const { error } = await sb
      .from("payments")
      .update(patch as never)
      .eq("id", data.paymentId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const createPayment = createServerFn({ method: "POST" })
  .inputValidator(
    (d: {
      profile_id: string;
      subscription_id?: string | null;
      plan_type: string;
      amount?: number | null;
      payment_status?: string;
      payment_method?: string | null;
      payment_date?: string | null;
      expiration_date?: string | null;
      notes?: string | null;
      original_amount?: number | null;
      discount_percent?: number | null;
      promo_label?: string | null;
    }) =>
      z
        .object({
          profile_id: z.string().uuid(),
          subscription_id: z.string().uuid().nullable().optional(),
          plan_type: z.string().min(1),
          amount: z.number().nullable().optional(),
          payment_status: z.string().optional(),
          payment_method: z.string().nullable().optional(),
          payment_date: z.string().nullable().optional(),
          expiration_date: z.string().nullable().optional(),
          notes: z.string().nullable().optional(),
          original_amount: z.number().nullable().optional(),
          discount_percent: z.number().min(0).max(100).nullable().optional(),
          promo_label: z.string().nullable().optional(),
        })
        .parse(d),
  )
  .handler(async ({ data }) => {
    const { assertAdmin } = await import("./admin-session.server");
    await assertAdmin();
    const { getSupabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );
    const sb = getSupabaseAdmin();
    const { error } = await sb.from("payments").insert(data as never);
    if (error) throw new Error(error.message);
    return { ok: true };
  });