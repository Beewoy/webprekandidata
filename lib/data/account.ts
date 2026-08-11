import { createClient } from "@/lib/supabase/server";
import { requireCurrentUser } from "@/lib/data/sites";
import { isDemoMode } from "@/lib/env";

export type EmailVerificationStatus = {
  userId: string;
  email: string;
  fullName: string;
  verified: boolean;
};

export async function getEmailVerificationStatus(): Promise<EmailVerificationStatus> {
  if (isDemoMode()) {
    return {
      userId: "demo",
      email: "demo@webprekandidata.sk",
      fullName: "Martin Novák",
      verified: true,
    };
  }

  const user = await requireCurrentUser();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("full_name, email_verified_at")
    .eq("id", user.id)
    .single();

  if (error || !data || !user.email) {
    throw new Error("Stav overenia e-mailu sa nepodarilo načítať.");
  }

  return {
    userId: user.id,
    email: user.email,
    fullName: data.full_name,
    verified: Boolean(data.email_verified_at),
  };
}
