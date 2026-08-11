import { NextResponse, type NextRequest } from "next/server";
import { hashVerificationToken, isVerificationToken } from "@/lib/email/verification-token";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token") ?? "";

  if (!isVerificationToken(token)) {
    return NextResponse.redirect(new URL("/prihlasenie?chyba=overenie", request.url));
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("verify_email_token", {
    p_token_hash: hashVerificationToken(token),
  });

  if (error || !data) {
    return NextResponse.redirect(new URL("/prihlasenie?chyba=overenie", request.url));
  }

  const { data: authData } = await supabase.auth.getUser();
  const destination = authData.user ? "/app?email=overeny" : "/prihlasenie?email=overeny";
  return NextResponse.redirect(new URL(destination, request.url));
}
