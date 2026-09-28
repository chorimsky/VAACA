import { NextResponse, type NextRequest } from "next/server";
import {
  MEMBER_COOKIE,
  STAFF_COOKIE,
  verifyMemberSession,
  verifyStaffSession,
} from "@/lib/session-token";

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

  const under = (bases: string[]) =>
    bases.some((b) => pathname === b || pathname.startsWith(`${b}/`));

  if (under(STAFF_ONLY) && pathname !== STAFF_LOGIN) {
    const session = await verifyStaffSession(
      request.cookies.get(STAFF_COOKIE)?.value,
    );
    if (session) return NextResponse.next();
    return bounce(request, STAFF_LOGIN, pathname, "/admin");
  }

  if (under(MEMBER_ONLY)) {
    const session = await verifyMemberSession(
      request.cookies.get(MEMBER_COOKIE)?.value,
    );
    if (session) return NextResponse.next();
    return bounce(request, MEMBER_LOGIN, pathname, "/dashboard");
  }

  const home = SIGNED_IN_HOME[pathname];
  if (home) {
    const cookie = pathname === STAFF_LOGIN ? STAFF_COOKIE : MEMBER_COOKIE;
    const verify =
      pathname === STAFF_LOGIN ? verifyStaffSession : verifyMemberSession;
    if (await verify(request.cookies.get(cookie)?.value)) {
      const requested = request.nextUrl.searchParams.get("next");
      const url = request.nextUrl.clone();
      // Only ever forward to an internal path, never an attacker-supplied URL.
      url.pathname =
        requested?.startsWith("/") && !requested.startsWith("//")
          ? requested
          : home;
      url.search = "";
      return NextResponse.redirect(url, 307);
    }
  }

  return NextResponse.next();
}

/** Send an unauthenticated visitor to `login`, remembering where they were going. */
function bounce(
  request: NextRequest,
  login: string,
  pathname: string,
  defaultDestination: string,
) {
  const url = request.nextUrl.clone();
  url.pathname = login;
  url.search = "";
  if (pathname !== defaultDestination) url.searchParams.set("next", pathname);
  return NextResponse.redirect(url, 307);
}

export const config = {
  // Skip Next internals and anything with a file extension (PDFs, icons,
  // sitemap, robots), which are served verbatim.
  matcher: ["/((?!_next/|.*\\.).*)"],
};
