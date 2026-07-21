import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const ASSETS_BUCKET = "videos"; // public bucket used for both images and videos

const arrStr = z.array(z.string()).optional().nullable();
const nStr = z.string().nullable().optional();
const nNum = z.number().nullable().optional();
const nBool = z.boolean().nullable().optional();

const profileSchema = z.object({
  name: nStr,
  plan: z.enum(["ouro", "prata", "bronze"]).optional(),
  cadastro_type: z.enum(["paid", "partnership"]).optional(),
  partnership_reason: nStr,
  partnership_notes: nStr,
  partnership_start_date: nStr,
  partnership_review_date: nStr,
  partnership_status: z.enum(["ativa", "pausada", "encerrada"]).optional(),
  age: nNum,
  location: nStr,
  bio: nStr,
  services: arrStr,
  services_not_offered: arrStr,
  price_display: nStr,
  whatsapp_number: nStr,
  service_location: arrStr,
  payment_methods: arrStr,
  availability: nStr,
  height_cm: nNum,
  weight_kg: nNum,
  dress_size: nStr,
  eye_color: nStr,
  hair_color: nStr,
  has_silicone: nBool,
  has_tattoo: nBool,
  has_piercing: nBool,
  priority_level: nNum,
  manual_position: nNum,
  is_verified: nBool,
  is_pioneer: nBool,
  is_online: nBool,
  is_suspended: nBool,
  is_black: nBool,
  main_image: nStr,
  cover_image: nStr,
  gallery_images: arrStr,
  gallery_videos: arrStr,
  video_url: nStr,
});

function cleanUndef<T extends Record<string, unknown>>(obj: T): Partial<T> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) if (v !== undefined) out[k] = v;
  return out as Partial<T>;
}

async function upsertActiveSubscription(
  sb: ReturnType<typeof import("@/integrations/supabase/client.server").getSupabaseAdmin>,
  profileId: string,
  plan: "ouro" | "prata" | "bronze",
  partnership?: {
    cadastro_type?: "paid" | "partnership";
    partnership_reason?: string | null;
    partnership_notes?: string | null;
    partnership_start_date?: string | null;
    partnership_review_date?: string | null;
    partnership_status?: "ativa" | "pausada" | "encerrada";
  },
) {
  const { data: existing } = await sb
    .from("subscriptions")
    .select("id, plan_type, subscription_status")
    .eq("profile_id", profileId)
    .order("created_at", { ascending: false })
    .limit(1);
  const active = (existing ?? []).find(
    (s: any) => s.subscription_status === "ativo",
  ) ?? (existing ?? [])[0];
  const type = partnership?.cadastro_type ?? "paid";
  const partnershipPatch =
    type === "partnership"
      ? {
          subscription_type: "partnership",
          partnership_reason: partnership?.partnership_reason ?? null,
          partnership_notes: partnership?.partnership_notes ?? null,
          partnership_start_date:
            partnership?.partnership_start_date ??
            new Date().toISOString().slice(0, 10),
          partnership_review_date:
            partnership?.partnership_review_date ?? null,
          partnership_status: partnership?.partnership_status ?? "ativa",
          expiration_date: null,
        }
      : {
          subscription_type: "paid",
          partnership_reason: null,
          partnership_notes: null,
          partnership_start_date: null,
          partnership_review_date: null,
          partnership_status: null,
        };
  if (active) {
    if (active.plan_type !== plan || active.subscription_status !== "ativo") {
      await sb
        .from("subscriptions")
        .update({
          plan_type: plan,
          subscription_status: "ativo",
          start_date: new Date().toISOString(),
          ...partnershipPatch,
        } as never)
        .eq("id", (active as any).id);
    } else {
      await sb
        .from("subscriptions")
        .update(partnershipPatch as never)
        .eq("id", (active as any).id);
    }
  } else {
    await sb.from("subscriptions").insert({
      profile_id: profileId,
      plan_type: plan,
      subscription_status: "ativo",
      ...partnershipPatch,
    } as never);
  }
}

export const listAdminProfiles = createServerFn({ method: "POST" })
  .inputValidator(
    (d: {
      q?: string;
      plan?: string;
      status?: string;
      city?: string;
      verified?: boolean;
      pioneer?: boolean;
    }) =>
      z
        .object({
          q: z.string().optional(),
          plan: z.string().optional(),
          status: z.string().optional(),
          city: z.string().optional(),
          verified: z.boolean().optional(),
          pioneer: z.boolean().optional(),
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

    let query = sb
      .from("profiles")
      .select(
        "id, name, location, main_image, is_verified, is_pioneer, is_online, is_suspended, created_at, subscriptions(id, plan_type, subscription_status, subscription_type, expiration_date, partnership_status)",
      )
      .order("created_at", { ascending: false })
      .limit(500);

    if (data.q) query = query.ilike("name", `%${data.q}%`);
    if (data.city) query = query.ilike("location", `%${data.city}%`);
    if (data.verified !== undefined) query = query.eq("is_verified", data.verified);
    if (data.pioneer !== undefined) query = query.eq("is_pioneer", data.pioneer);

    const { data: rows, error } = await query;
    if (error) throw new Error(error.message);

    let results = (rows ?? []).map((p: any) => {
      const active =
        (p.subscriptions ?? []).find(
          (s: any) => s.subscription_status === "ativo",
        ) ?? (p.subscriptions ?? [])[0] ?? null;
      return {
        id: p.id as string,
        name: (p.name as string | null) ?? "(sem nome)",
        location: p.location as string | null,
        main_image: p.main_image as string | null,
        is_verified: !!p.is_verified,
        is_pioneer: !!p.is_pioneer,
        is_online: !!p.is_online,
        is_suspended: !!p.is_suspended,
        created_at: p.created_at as string | null,
        plan: active?.plan_type ?? null,
        subscription_status: active?.subscription_status ?? null,
        subscription_type: (active?.subscription_type ?? "paid") as
          | "paid"
          | "partnership",
        partnership_status: (active?.partnership_status ?? null) as
          | string
          | null,
        expiration_date: active?.expiration_date ?? null,
      };
    });

    if (data.plan) results = results.filter((r) => r.plan === data.plan);
    if (data.status)
      results = results.filter((r) => r.subscription_status === data.status);

    return results;
  });

export const getAdminProfile = createServerFn({ method: "POST" })
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
    const [{ data: profile, error }, { data: subs }, { data: payments }] =
      await Promise.all([
        sb.from("profiles").select("*").eq("id", data.id).maybeSingle(),
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
          .limit(5),
      ]);
    if (error) throw new Error(error.message);
    if (!profile) throw new Error("Perfil não encontrado");
    const subscription =
      (subs ?? []).find((s: any) => s.subscription_status === "ativo") ??
      (subs ?? [])[0] ??
      null;
    const lastPayment = (payments ?? [])[0] ?? null;
    return { profile, subscription, lastPayment };
  });

export const createAdminProfile = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => profileSchema.parse(d))
  .handler(async ({ data }) => {
    const { assertAdmin } = await import("./admin-session.server");
    await assertAdmin();
    const { getSupabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );
    const sb = getSupabaseAdmin();
    const {
      plan,
      cadastro_type,
      partnership_reason,
      partnership_notes,
      partnership_start_date,
      partnership_review_date,
      partnership_status,
      ...rest
    } = data as Record<string, unknown> & {
      plan?: "ouro" | "prata" | "bronze";
      cadastro_type?: "paid" | "partnership";
      partnership_reason?: string | null;
      partnership_notes?: string | null;
      partnership_start_date?: string | null;
      partnership_review_date?: string | null;
      partnership_status?: "ativa" | "pausada" | "encerrada";
    };
    const payload = cleanUndef(rest);
    const { data: inserted, error } = await sb
      .from("profiles")
      .insert(payload as never)
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    const newId = (inserted as any).id as string;
    await upsertActiveSubscription(sb, newId, (plan ?? "bronze") as any, {
      cadastro_type,
      partnership_reason,
      partnership_notes,
      partnership_start_date,
      partnership_review_date,
      partnership_status,
    });
    return { id: newId };
  });

export const updateAdminProfile = createServerFn({ method: "POST" })
  .inputValidator((d: { id: string; patch: unknown }) =>
    z
      .object({ id: z.string().uuid(), patch: profileSchema.partial() })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const { assertAdmin } = await import("./admin-session.server");
    await assertAdmin();
    const { getSupabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );
    const sb = getSupabaseAdmin();
    const {
      plan,
      cadastro_type,
      partnership_reason,
      partnership_notes,
      partnership_start_date,
      partnership_review_date,
      partnership_status,
      ...rest
    } = data.patch as Record<string, unknown> & {
      plan?: "ouro" | "prata" | "bronze";
      cadastro_type?: "paid" | "partnership";
      partnership_reason?: string | null;
      partnership_notes?: string | null;
      partnership_start_date?: string | null;
      partnership_review_date?: string | null;
      partnership_status?: "ativa" | "pausada" | "encerrada";
    };
    const payload = cleanUndef(rest);
    if (Object.keys(payload).length > 0) {
    const { error } = await sb
      .from("profiles")
      .update(payload as never)
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    }
    if (plan || cadastro_type) {
      await upsertActiveSubscription(
        sb,
        data.id,
        (plan ?? "bronze") as any,
        {
          cadastro_type,
          partnership_reason,
          partnership_notes,
          partnership_start_date,
          partnership_review_date,
          partnership_status,
        },
      );
    }
    return { ok: true };
  });

export const toggleProfileSuspended = createServerFn({ method: "POST" })
  .inputValidator((d: { id: string; is_suspended: boolean }) =>
    z
      .object({ id: z.string().uuid(), is_suspended: z.boolean() })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const { assertAdmin } = await import("./admin-session.server");
    await assertAdmin();
    const { getSupabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );
    const sb = getSupabaseAdmin();
    const { error } = await sb
      .from("profiles")
      .update({ is_suspended: data.is_suspended } as never)
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteAdminProfile = createServerFn({ method: "POST" })
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
    await sb.from("payments").delete().eq("profile_id", data.id);
    await sb.from("subscriptions").delete().eq("profile_id", data.id);
    await sb.from("profile_reports").delete().eq("profile_id", data.id);
    const { error } = await sb.from("profiles").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/* ---------------- Uploads ---------------- */

export const uploadProfileAsset = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => {
    if (!(d instanceof FormData)) throw new Error("FormData obrigatório");
    const file = d.get("file");
    const kind = (d.get("kind") as string) || "image";
    const profileId = (d.get("profileId") as string) || "misc";
    if (!(file instanceof File)) throw new Error("Arquivo obrigatório");
    if (kind !== "image" && kind !== "video")
      throw new Error("kind inválido");
    if (file.size > 60 * 1024 * 1024)
      throw new Error("Arquivo muito grande (máx 60MB)");
    return { file, kind: kind as "image" | "video", profileId };
  })
  .handler(async ({ data }) => {
    const { assertAdmin } = await import("./admin-session.server");
    await assertAdmin();
    const { getSupabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );
    const sb = getSupabaseAdmin();

    const ext = (data.file.name.split(".").pop() || "bin").toLowerCase();
    const folder = data.kind === "image" ? "profiles" : "profile-videos";
    const path = `${folder}/${data.profileId}/${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 8)}.${ext}`;
    const bytes = new Uint8Array(await data.file.arrayBuffer());

    const { error } = await sb.storage
      .from(ASSETS_BUCKET)
      .upload(path, bytes, {
        contentType: data.file.type || undefined,
        upsert: false,
      });
    if (error) throw new Error(error.message);
    const { data: pub } = sb.storage.from(ASSETS_BUCKET).getPublicUrl(path);
    return { url: pub.publicUrl, path, bucket: ASSETS_BUCKET };
  });

export const deleteProfileAsset = createServerFn({ method: "POST" })
  .inputValidator((d: { path: string; bucket?: string }) =>
    z
      .object({ path: z.string().min(1), bucket: z.string().optional() })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const { assertAdmin } = await import("./admin-session.server");
    await assertAdmin();
    const { getSupabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );
    const sb = getSupabaseAdmin();
    const { error } = await sb.storage
      .from(data.bucket || ASSETS_BUCKET)
      .remove([data.path]);
    if (error) throw new Error(error.message);
    return { ok: true };
  });