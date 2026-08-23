import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/auth-form";

export const metadata: Metadata = { title: "Prihlásenie" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ heslo?: string; chyba?: string; email?: string; next?: string }> }) {
  const query = await searchParams;
  const notice = query.heslo === "zmenene"
    ? { type: "success" as const, text: "Heslo bolo zmenené. Môžete sa prihlásiť." }
    : query.email === "overeny"
      ? { type: "success" as const, text: "E-mail bol overený. Môžete sa prihlásiť." }
    : query.chyba === "overenie"
      ? { type: "error" as const, text: "Overovací odkaz je neplatný alebo už vypršal." }
      : undefined;
  return <AuthForm mode="login" nextPath={query.next} notice={notice} />;
}
