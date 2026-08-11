import "server-only";

import { sendVerificationEmail } from "@/lib/email/brevo";
import { createVerificationToken, hashVerificationToken } from "@/lib/email/verification-token";
import { createAdminClient } from "@/lib/supabase/admin";

export class VerificationDeliveryError extends Error {
  constructor(public readonly reason: "rate_limit" | "already_verified" | "delivery_failed" | "token_failed") {
    super(reason);
  }
}

export async function issueAndSendVerificationEmail(
  recipient: { userId: string; email: string; fullName: string },
) {
  const supabase = createAdminClient();
  const token = createVerificationToken();
  const tokenHash = hashVerificationToken(token);
  const { error } = await supabase.rpc("issue_email_verification_token", {
    p_user_id: recipient.userId,
    p_token_hash: tokenHash,
  });

  if (error) {
    if (error.message.includes("verification_rate_limit")) throw new VerificationDeliveryError("rate_limit");
    if (error.message.includes("email_already_verified")) throw new VerificationDeliveryError("already_verified");
    throw new VerificationDeliveryError("token_failed");
  }

  try {
    await sendVerificationEmail({ email: recipient.email, fullName: recipient.fullName, token });
  } catch {
    await supabase.rpc("revoke_email_verification_token", {
      p_user_id: recipient.userId,
      p_token_hash: tokenHash,
    });
    throw new VerificationDeliveryError("delivery_failed");
  }
}
