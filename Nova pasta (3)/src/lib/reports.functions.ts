import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const REPORT_REASONS = [
  "Fotos falsas",
  "Vídeo não corresponde às fotos",
  "Perfil duplicado",
  "Número incorreto",
  "Tentativa de golpe",
  "Conteúdo inadequado",
  "Suspeita de menor de idade",
  "Outro",
] as const;

export const createReport = createServerFn({ method: "POST" })
  .inputValidator((d: {
    profile_id: string;
    reason: string;
    description: string;
  }) =>
    z
      .object({
        profile_id: z.string().uuid(),
        reason: z.enum(REPORT_REASONS),
        description: z.string().trim().min(10).max(1000),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const { getSupabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );
    const sb = getSupabaseAdmin();
    const { data: profile } = await sb
      .from("profiles")
      .select("name")
      .eq("id", data.profile_id)
      .maybeSingle();
    const profile_name = (profile?.name as string | null) ?? null;
    const { error } = await sb
      .from("profile_reports")
      .insert({
        profile_id: data.profile_id,
        profile_name,
        reason: data.reason,
        description: data.description,
        status: "pendente",
      } as never);
    if (error) throw new Error(error.message);
    return { ok: true, profile_name };
  });

/* ---------------- Admin ---------------- */

export const listReports = createServerFn({ method: "GET" }).handler(
  async () => {
    const { assertAdmin } = await import("./admin-session.server");
    await assertAdmin();
    const { getSupabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );
    const sb = getSupabaseAdmin();
    const { data, error } = await sb
      .from("profile_reports")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500);
    if (error) throw new Error(error.message);
    return data ?? [];
  },
);

export const updateReportStatus = createServerFn({ method: "POST" })
  .inputValidator((d: { id: string; status: "pendente" | "resolvido" | "rejeitado" }) =>
    z
      .object({
        id: z.string().uuid(),
        status: z.enum(["pendente", "resolvido", "rejeitado"]),
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
    const { error } = await sb
      .from("profile_reports")
      .update({ status: data.status } as never)
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const suspendProfile = createServerFn({ method: "POST" })
  .inputValidator((d: { profile_id: string; suspended: boolean }) =>
    z
      .object({
        profile_id: z.string().uuid(),
        suspended: z.boolean(),
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
    const { error } = await sb
      .from("profiles")
      .update({ is_suspended: data.suspended } as never)
      .eq("id", data.profile_id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteProfile = createServerFn({ method: "POST" })
  .inputValidator((d: { profile_id: string }) =>
    z.object({ profile_id: z.string().uuid() }).parse(d),
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
      .delete()
      .eq("id", data.profile_id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });