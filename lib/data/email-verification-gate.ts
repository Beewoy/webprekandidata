import { createClient } from "../supabase/server";

/** Server-side gate for checkout/publish. Does not redirect — returns a result for actions. */
export async function requireVerifiedUser(
  userId: string,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("email_verified_at")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    throw new Error("Stav overenia e-mailu sa nepodarilo načítať.", { cause: error });
  }

  if (!data?.email_verified_at) {
    return {
      ok: false,
      message: "Pred platbou a publikovaním overte e-mail. Odkaz nájdete v schránke alebo si ho nechajte znova poslať.",
    };
  }

  return { ok: true };
}
