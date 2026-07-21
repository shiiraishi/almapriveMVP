import { useSession } from "@tanstack/react-start/server";

export type AdminSession = { isAdmin?: boolean; loggedAt?: number };

const ONE_WEEK = 60 * 60 * 24 * 7;

function password() {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) {
    throw new Error("ADMIN_SESSION_SECRET must be set.");
  }
  // useSession requires >= 32 chars; pad short secrets deterministically.
  return secret.length >= 32 ? secret : (secret + secret + secret + "_almaprive_admin_session_pad_").slice(0, 64);
}

export async function getAdminSession() {
  // Em localhost (HTTP) cookie secure/sameSite=none não grava — quebra o login.
  const isProd = process.env.NODE_ENV === "production";
  return useSession<AdminSession>({
    password: password(),
    name: "almaprive_admin",
    maxAge: ONE_WEEK,
    cookie: {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      path: "/",
    },
  });
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const session = await getAdminSession();
  return session.data.isAdmin === true;
}

export async function assertAdmin() {
  if (!(await isAdminAuthenticated())) {
    throw new Error("Unauthorized");
  }
}