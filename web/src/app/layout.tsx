import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, Source_Serif_4 } from "next/font/google";
import "./globals.css";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import { getLocale } from "@/lib/i18n/server";
import { ErrorCopyProvider } from "@/components/ErrorCopy";
import { dictionary } from "@/lib/i18n/dictionaries";
import { LOCALE_TAG, localePath } from "@/lib/i18n/locale";
import { documentMetadata } from "@/lib/i18n/metadata";

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

/**
 * Built per request rather than declared once: the title and description have
 * to follow the page's language, and the canonical URL has to name the page
 * rather than the home page. A page that sets its own copy calls the same
 * helper, so the two never disagree.
 */
export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const { title, description } = dictionary(locale).meta.home;

  return {
    metadataBase: new URL(SITE_URL),
    applicationName: SITE_NAME,
    keywords: [
      "VAACA",
      "CEMAC",
      "virtual assets",
      "PSAN",
      "Central Africa",
      "Cameroon",
      "regulatory readiness",
      "COSUMAF",
      "COBAC",
    ],
    robots: { index: true, follow: true },
    ...(await documentMetadata(title, description)),
    // `documentMetadata` returns a plain string title; the root needs the
    // default-and-template form so page titles get the " · VAACA" suffix.
    title: { default: title, template: "%s · VAACA" },
  };
}

export const viewport: Viewport = {
  themeColor: "#0B4944",
  colorScheme: "light",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // Middleware puts the locale on the request; the document has to declare it
  // so assistive technology reads French with a French voice, and so browsers
  // offer the right translation prompt.
  const locale = await getLocale();
  const t = dictionary(locale);

  return (
    <html lang={LOCALE_TAG[locale]}>
      <head>
        {/* General Sans ships from Fontshare, which next/font/google can't
            reach — so it stays a plain stylesheet link, as in the prototypes. */}
        <link
          rel="preconnect"
          href="https://api.fontshare.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://api.fontshare.com/v2/css?f[]=general-sans@400,500,600,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${ibmPlexMono.variable} ${sourceSerif.variable}`}>
        {/* First stop for keyboard users, ahead of the sticky nav. */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-[100] focus:rounded-lg focus:bg-navy focus:px-4 focus:py-2.5 focus:text-[14px] focus:font-semibold focus:text-white"
        >
          {t.nav.skipToContent}
        </a>
        <ErrorCopyProvider
          value={{
            failure: t.errors.failure,
            backToVaaca: t.nav.backToVaaca,
            footer: t.auth.footer,
            homeHref: localePath(locale, "/"),
          }}
        >
          {children}
        </ErrorCopyProvider>
      </body>
    </html>
  );
}
