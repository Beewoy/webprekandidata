import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const AUTH_REFRESH_TIMEOUT_MS = 8000;

export const INVOKE_PATH_HEADER = "x-invoke-path";

export function attachInvokePath(response: NextResponse, pathname: string, search: string) {
  response.headers.set(INVOKE_PATH_HEADER, `${pathname}${search}`);
  return response;
}

/** Refreshes the Supabase session cookies without clearing them on transient failures. */
export async function refreshAuthSession(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return NextResponse.next({ request });

  let response = NextResponse.next({ request });
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookiesToSet) => {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  try {
    await Promise.race([
      supabase.auth.getSession(),
      new Promise((_resolve, reject) => {
        setTimeout(() => reject(new Error("auth_refresh_timeout")), AUTH_REFRESH_TIMEOUT_MS);
      }),
    ]);
  } catch {
    // Do not clear cookies here — protected routes still validate auth server-side.
  }

  return response;
}
