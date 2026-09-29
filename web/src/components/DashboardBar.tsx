"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { LogoMark } from "@/components/Logo";
import { routes } from "@/lib/routes";
import type { BarLink } from "@/lib/dashboard-links";

/**
 * The top bar shared by all four signed-in surfaces — member dashboard,
 * secretariat admin, Operating System and document review.
 *
 * Each had its own bar before, with three separate copies of the sign-out call
 * and one surface (document review) carrying neither a sign-out nor any
 * indication of who was signed in. One component means the same answer
 * everywhere to: where am I, who am I, where else can I go, how do I leave.
 *
 * Order is deliberate and consistent: brand, then the places you can go, then
 * who you are, then sign out last — a destructive-ish action does not sit in
 * the middle of navigation.
 */

/**
 * Sign-out, shared so the three surfaces that had their own copy behave
 * identically: the session is cleared, then the route is *replaced* so Back
 * cannot return to a page rendered for the old session.
 */
export function SignOutButton({
  audience,
  className = "",
}: {
  audience: "member" | "staff";
  className?: string;
}) {
  const router = useRouter();
  const [leaving, setLeaving] = useState(false);

  const signOut = async () => {
    if (leaving) return;
    setLeaving(true);
    const endpoint =
      audience === "member" ? "/api/member/session" : "/api/staff/session";
    try {
      await fetch(endpoint, { method: "DELETE" });
    } finally {
      router.replace(audience === "member" ? routes.login : "/admin/login");
      router.refresh();
    }
  };

  return (
    <button
      type="button"
      onClick={signOut}
      disabled={leaving}
      className={`-my-1 cursor-pointer border-none bg-transparent px-1 py-1 text-[12.5px] font-semibold disabled:cursor-wait ${className}`}
    >
      {leaving ? "Signing out…" : "Sign out"}
    </button>
  );
}

const TONE = {
  navy: {
    bar: "bg-navy",
    title: "text-white",
    link: "text-on-dark hover:text-white",
    identity: "text-on-dark",
    signOut: "text-on-dark hover:text-white",
    divider: "bg-white/20",
  },
  light: {
    bar: "border-b border-doc-line bg-white",
    title: "text-navy",
    link: "text-doc-body hover:text-navy",
    identity: "text-doc-muted",
    signOut: "text-navy hover:text-teal-ink",
    divider: "bg-doc-line",
  },
} as const;

export function DashboardBar({
  audience,
  tone = "navy",
  title,
  titleHref = routes.home,
  badges,
  identity,
  links = [],
}: {
  audience: "member" | "staff";
  tone?: keyof typeof TONE;
  title: string;
  titleHref?: string;
  badges?: React.ReactNode;
  identity?: string;
  links?: BarLink[];
}) {
  const t = TONE[tone];

  return (
    <header className={`${t.bar} px-5 py-3 lg:px-8`}>
      <div className="mx-auto flex max-w-[1280px] flex-wrap items-center justify-between gap-x-5 gap-y-2.5">
        <Link
          href={titleHref}
          className="flex shrink-0 items-center gap-2.5 no-underline"
        >
          <LogoMark size={30} tone={tone === "navy" ? "dark" : "light"} />
          <b className={`text-[14.5px] ${t.title}`}>{title}</b>
        </Link>

        <div className="flex flex-wrap items-center gap-x-3.5 gap-y-2">
          {links.length ? (
            <nav aria-label="Signed-in areas">
              <ul className="m-0 flex list-none flex-wrap items-center gap-x-4 gap-y-2 p-0">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      // py-1/-my-1 lifts the hit area to 24px without adding a
                      // row to the bar.
                      className={`-my-1 inline-block py-1 text-[12.5px] font-semibold no-underline ${t.link}`}
                    >
                      {link.label}
                      {link.external ? <span aria-hidden> ↗</span> : null}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ) : null}

          {badges}

          {/* Truncated rather than hidden on small screens: `display:none` would
              take "who am I" out of the accessibility tree too, and that
              matters most on the surfaces with elevated permissions. */}
          {identity ? (
            <span
              className={`max-w-[112px] truncate text-[12.5px] sm:max-w-[220px] ${t.identity}`}
              title={identity}
            >
              {identity}
            </span>
          ) : null}

          <span
            aria-hidden
            className={`hidden h-4 w-px sm:block ${t.divider}`}
          />

          <SignOutButton audience={audience} className={t.signOut} />
        </div>
      </div>
    </header>
  );
}
