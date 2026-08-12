import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getAppUrl } from "@/lib/env";
import { hostWithoutPort } from "@/lib/domains/hostname";
import {
  getCanonicalPlatformHostname,
  isPlatformHostname,
  isPlatformWwwHostname,
} from "@/lib/domains/platform";

const APP_PATH_PREFIXES = [
  "/app",
  "/admin",
  "/api",
  "/prihlasenie",
  "/registracia",
  "/obnova-hesla",
  "/zabudnute-heslo",
  "/auth",
];

function isAppPath(pathname: string) {
  return APP_PATH_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

async function refreshAuthSession(request: NextRequest) {
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

  await supabase.auth.getClaims();
  return response;
}

async function resolveCustomDomainSlug(hostname: string): Promise<string | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return null;

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => [],
      setAll: () => undefined,
    },
  });

  const { data, error } = await supabase.rpc("resolve_active_custom_domain", {
    p_hostname: hostname,
  });
  if (error || !data?.length) return null;
  const slug = data[0]?.slug;
  return typeof slug === "string" && slug.length > 0 ? slug : null;
}

export async function proxy(request: NextRequest) {
  const hostname = hostWithoutPort(request.headers.get("host") ?? "").toLowerCase();
  const { pathname, search } = request.nextUrl;

  if (isPlatformWwwHostname(hostname)) {
    return NextResponse.redirect(
      new URL(`${pathname}${search}`, `https://${getCanonicalPlatformHostname()}`),
      308,
    );
  }

  if (hostname && !isPlatformHostname(hostname)) {
    if (isAppPath(pathname)) {
      const destination = new URL(`${pathname}${search}`, getAppUrl());
      return NextResponse.redirect(destination, 308);
    }

    const slug = await resolveCustomDomainSlug(hostname);
    if (!slug) {
      return NextResponse.rewrite(new URL("/not-found-domain", request.url));
    }

    if (pathname === "/" || pathname === "") {
      const rewriteUrl = request.nextUrl.clone();
      rewriteUrl.pathname = `/${slug}`;
      return NextResponse.rewrite(rewriteUrl);
    }

    // Candidate public sites have no nested public routes yet.
    if (pathname === `/${slug}`) {
      return NextResponse.rewrite(request.nextUrl.clone());
    }

    return NextResponse.rewrite(new URL("/not-found-domain", request.url));
  }

  if (pathname === "/app/web/demo") {
    return NextResponse.rewrite(new URL("/ukazka", request.url));
  }

  return refreshAuthSession(request);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
