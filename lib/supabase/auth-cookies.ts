import type { NextRequest, NextResponse } from "next/server";

/** Supabase SSR auth cookies, including chunked `auth-token.0` variants. */
export function isSupabaseAuthCookie(name: string) {
  return /^sb-.*-auth-token(\.\d+)?$/.test(name);
}

export function clearSupabaseAuthCookies(request: NextRequest, response: NextResponse) {
  for (const { name } of request.cookies.getAll()) {
    if (!isSupabaseAuthCookie(name)) continue;
    response.cookies.set(name, "", {
      maxAge: 0,
      path: "/",
    });
  }
}
