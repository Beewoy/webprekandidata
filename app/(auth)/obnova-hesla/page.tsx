import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/auth-form";

export const metadata: Metadata = { title: "Nové heslo" };

export default function UpdatePasswordPage() {
  return <AuthForm mode="update" />;
}
