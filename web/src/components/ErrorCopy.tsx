"use client";

import { createContext, useContext } from "react";
import type { Dictionary } from "@/lib/i18n/dictionaries";

export type ErrorCopy = {
  failure: Dictionary["errors"]["failure"];
  backToVaaca: string;
  footer: string;
  /** The home page in the current locale, since the boundary cannot build it. */
  homeHref: string;
};

/**
 * `error.tsx` is a client boundary: it cannot read the request's locale the way
 * a server component does, and it renders after the page it replaced has
 * already failed. So the copy it needs is handed down from the root layout,
 * which does know the locale — a few strings, not the whole dictionary.
 */
const Context = createContext<ErrorCopy | null>(null);

/**
 * Used only when the failure is the root layout itself, which is exactly the
 * case where no provider rendered. English is the site's default locale, and a
 * fallback that is duplicated here rather than imported keeps the dictionary
 * out of the client bundle.
 */
const FALLBACK: ErrorCopy = {
  failure: {
    eyebrow: "Something went wrong",
    title: "This page failed to load.",
    body: "The problem has been logged. You can try again, or head back to the home page.",
    reference: "Reference:",
    retry: "Try again",
  },
  backToVaaca: "Back to VAACA",
  footer: "VAACA · Virtual Assets Association of Central Africa · In Formation",
  homeHref: "/",
};

export function ErrorCopyProvider({
  value,
  children,
}: {
  value: ErrorCopy;
  children: React.ReactNode;
}) {
  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useErrorCopy(): ErrorCopy {
  return useContext(Context) ?? FALLBACK;
}
