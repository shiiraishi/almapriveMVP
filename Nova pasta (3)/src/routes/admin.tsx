import { createFileRoute, Outlet, redirect, Link, useRouter } from "@tanstack/react-router";
import { checkAdminAuth, adminLogout } from "@/lib/admin.functions";
import { useServerFn } from "@tanstack/react-start";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Painel · AlmaPrivé" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  beforeLoad: async ({ location }) => {
    if (location.pathname === "/admin/login") return;
    const { isAdmin } = await checkAdminAuth();
    if (!isAdmin) {
      throw redirect({ to: "/admin/login" });
    }
  },
  component: AdminLayout,
});

function AdminLayout() {
  const router = useRouter();
  const logout = useServerFn(adminLogout);
  const pathname = router.state.location.pathname;
  const isLogin = pathname === "/admin/login";

  if (isLogin) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white">
        <Outlet />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <header className="border-b border-white/10 bg-black/60 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <Link to="/admin" className="flex items-center gap-2 font-semibold">
            <span className="text-[#D4AF37]">AlmaPrivé</span>
            <span className="text-white/60">· Painel</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              to="/admin/perfis"
              className="rounded-md border border-white/15 px-3 py-1.5 text-sm text-white/80 hover:bg-white/5"
            >
              👤 Perfis
            </Link>
            <Link
              to="/admin/denuncias"
              className="rounded-md border border-white/15 px-3 py-1.5 text-sm text-white/80 hover:bg-white/5"
            >
              🚩 Denúncias
            </Link>
            <button
            onClick={async () => {
              await logout();
              router.navigate({ to: "/admin/login" });
            }}
            className="rounded-md border border-white/15 px-3 py-1.5 text-sm text-white/80 hover:bg-white/5"
            >
              Sair
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}