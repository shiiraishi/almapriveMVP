import { createFileRoute, useRouter, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { createAdminProfile } from "@/lib/profiles-admin.functions";
import {
  ProfileForm,
  emptyProfile,
  type ProfileFormValues,
} from "@/components/admin/ProfileForm";

export const Route = createFileRoute("/admin/perfis/novo")({
  head: () => ({
    meta: [
      { title: "Novo perfil · AlmaPrivé" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: NovoPerfil,
});

function NovoPerfil() {
  const router = useRouter();
  const create = useServerFn(createAdminProfile);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(v: ProfileFormValues) {
    setBusy(true);
    setErr(null);
    try {
      const res = await create({ data: v as never });
      router.navigate({ to: "/admin/perfis/$id/editar", params: { id: res.id } });
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Novo perfil</h1>
        <Link
          to="/admin/perfis"
          className="rounded-md border border-white/15 px-3 py-1.5 text-sm text-white/80 hover:bg-white/5"
        >
          ← Voltar
        </Link>
      </div>
      {err && <p className="mb-3 text-sm text-red-400">{err}</p>}
      <ProfileForm
        initial={emptyProfile}
        profileId="novo"
        onSubmit={onSubmit}
        submitting={busy}
        submitLabel="Criar perfil"
      />
    </div>
  );
}