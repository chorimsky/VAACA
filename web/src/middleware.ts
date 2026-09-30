import { NextResponse, type NextRequest } from "next/server";
import {
  MEMBER_COOKIE,
  STAFF_COOKIE,
  verifyMemberSession,
  verifyStaffSession,
} from "@/lib/session-token";
import { CHAPTERS } from "@/lib/chapters";
import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE,
  LOCALE_HEADER,
  isLocale,
  localeFromAcceptLanguage,
  localePath,
  splitLocale,
  type Locale,
} from "@/lib/i18n/locale";

const CHAPTER_SLUGS = new Set(CHAPTERS.map((c) => c.slug));

/**
 * A path with no route, so Next answers it with `not-found.tsx` and a genuine
 * 404 status rather than the styled page under a 200.
 */
const NOT_FOUND_PATH = "/__not-found";

/** Surfaces restricted to secretariat and Council staff. */
const STAFF_ONLY = ["/admin", "/operating-system", "/documents"];
const MEMBER_ONLY = ["/dashboard"];
const STAFF_LOGIN = "/admin/login";
const MEMBER_LOGIN = "/login";
/** Login pages, and where an already-authenticated visitor belongs instead. */
const SIGNED_IN_HOME: Record<string, string> = {
  [STAFF_LOGIN]: "/admin",
  [MEMBER_LOGIN]: "/dashboard",
};

/**
 * Three jobs, all cheap enough to do before a page renders:
 *
 * 1. **Canonical casing.** Every route here is lowercase. Static routes already
 *    404 on a mis-cased path, but a dynamic segment served from the prerender
 *    cache can resolve case-insensitively when the host filesystem is (macOS
 *    does; Linux does not). Redirecting makes behaviour identical everywhere.
 *
 * 2. **The staff gate.** Verifying the signed session here means an
 *    unauthenticated request to an internal surface gets a real HTTP redirect
 *    instead of rendering and bouncing client-side. The pages and route
 *    handlers verify again — this is the outer layer, not the only one.
 *
 * 3. **The reverse gate.** An already-authenticated visitor who opens a login
 *    page is sent on with a real 307 too. The pages redirect as well, but a
 *    redirect thrown mid-render streams a 200 shell that renders nothing
 *    without JavaScript, so the decision has to happen before the render.
 *
 * 4. **The locale.** French lives under `/fr`, English at the root. The prefix
 *    is stripped here and the rest of the route tree serves both, with the
 *    locale travelling on a request header — so `/fr/standards` stays in the
 *    address bar while `app/standards/page.tsx` renders it. Everything below
 *    works on the unprefixed path, and any redirect it produces is put back
 *    into the locale the visitor was in.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Never rewrite API paths: their segments are identifiers (gap ids are
  // uppercase G1–G10), and lowercasing one silently 308s a write to a route
  // that cannot match.
  if (pathname.startsWith("/api/")) return NextResponse.next();

  if (pathname !== pathname.toLowerCase()) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.toLowerCase();
    return NextResponse.redirect(url, 308);
  }

  const { locale, path, prefixed } = splitLocale(pathname);

  // First arrival at the root: honour a remembered choice, then the browser's
  // own languages. Only the root redirects — a visitor who followed an English
  // deep link stays where they were sent.
  if (path === "/" && !prefixed) {
    const remembered = request.cookies.get(LOCALE_COOKIE)?.value;
    const preferred = isLocale(remembered)
      ? remembered
      : localeFromAcceptLanguage(request.headers.get("accept-language"));
    if (preferred && preferred !== DEFAULT_LOCALE) {
      const url = request.nextUrl.clone();
      url.pathname = localePath(preferred, "/");
      return NextResponse.redirect(url, 307);
    }
  }

  // Chapter slugs are a closed set. Checking it here gives a real 404 status
  // in both locales: reading the request's locale in the root layout makes
  // every route dynamic, and once a route is dynamic `dynamicParams = false`
  // can no longer answer an unknown slug before the response starts — the page
  // renders and `notFound()` streams a 200 shell instead.
  if (path.startsWith("/chapters/")) {
    const slug = path.slice("/chapters/".length);
    if (slug && !CHAPTER_SLUGS.has(slug)) {
      return NextResponse.rewrite(new URL(NOT_FOUND_PATH, request.url));
    }
  }

  const under = (bases: string[]) =>
    bases.some((b) => path === b || path.startsWith(`${b}/`));

  if (under(STAFF_ONLY) && path !== STAFF_LOGIN) {
    const session = await verifyStaffSession(
      request.cookies.get(STAFF_COOKIE)?.value,
    );
    if (!session) return bounce(request, locale, STAFF_LOGIN, path, "/admin");
    return serve(request, locale, path, prefixed);
  }

  if (under(MEMBER_ONLY)) {
    const session = await verifyMemberSession(
      request.cookies.get(MEMBER_COOKIE)?.value,
    );
    if (!session) {
      return bounce(request, locale, MEMBER_LOGIN, path, "/dashboard");
    }
    return serve(request, locale, path, prefixed);
  }

  const home = SIGNED_IN_HOME[path];
  if (home) {
    const cookie = path === STAFF_LOGIN ? STAFF_COOKIE : MEMBER_COOKIE;
    const verify =
      path === STAFF_LOGIN ? verifyStaffSession : verifyMemberSession;
    if (await verify(request.cookies.get(cookie)?.value)) {
      const requested = request.nextUrl.searchParams.get("next");
      const url = request.nextUrl.clone();
      // Only ever forward to an internal path, never an attacker-supplied URL.
      const target =
        requested?.startsWith("/") && !requested.startsWith("//")
          ? requested
          : home;
      url.pathname = localePath(locale, stripLocale(target));
      url.search = "";
      return NextResponse.redirect(url, 307);
    }
  }

  return serve(request, locale, path, prefixed);
}

/** A `next` value may already carry a prefix; never stack two. */
const stripLocale = (target: string) => splitLocale(target).path;

/**
 * Hands the request to the shared route tree with the locale attached, and
 * rewrites the prefix away when there is one so `/fr/standards` is served by
 * `app/standards/page.tsx` without changing the address bar.
 */
function serve(
  request: NextRequest,
  locale: Locale,
  path: string,
  prefixed: boolean,
) {
  // English is served untouched. Attaching a request header makes every
  // request an internal rewrite, and a rewrite bypasses the static-params
  // check that lets `dynamicParams = false` answer an unknown chapter slug
  // with a real 404 — it renders instead, and a `notFound()` thrown mid-render
  // streams a 200 shell. `getLocale()` already defaults to English when the
  // header is absent, so nothing is lost by staying out of the way.
  if (!prefixed) return NextResponse.next();

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(LOCALE_HEADER, locale);

  const response = NextResponse.rewrite(
    new URL(`${path}${request.nextUrl.search}`, request.url),
    { request: { headers: requestHeaders } },
  );

  // Remember an explicit choice, so the root sends them back next time.
  response.cookies.set(LOCALE_COOKIE, locale, {
    path: "/",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
  });
  return response;
}

/**
 * Send an unauthenticated visitor to `login`, remembering where they were
 * going — both the login page and the remembered destination stay in the
 * locale they were browsing.
 */
function bounce(
  request: NextRequest,
  locale: Locale,
  login: string,
  path: string,
  defaultDestination: string,
) {
  const url = request.nextUrl.clone();
  url.pathname = localePath(locale, login);
  url.search = "";
  if (path !== defaultDestination) {
    url.searchParams.set("next", localePath(locale, path));
  }
  return NextResponse.redirect(url, 307);
}

export const config = {
  // Skip Next internals and anything with a file extension (PDFs, icons,
  // sitemap, robots), which are served verbatim.
  matcher: ["/((?!_next/|.*\\.).*)"],
};
