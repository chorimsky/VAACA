import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, Source_Serif_4 } from "next/font/google";
import "./globals.css";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";
import { getLocale } from "@/lib/i18n/server";
import { dictionary } from "@/lib/i18n/dictionaries";
import { LOCALE_TAG } from "@/lib/i18n/locale";

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

const TITLE = "VAACA — Virtual Assets Association of Central Africa";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: TITLE, template: "%s · VAACA" },
  description: SITE_DESCRIPTION,
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
  alternates: {
    canonical: "/",
    // No `languages` here on purpose. Layout metadata is static, so a link tag
    // declared at this level would claim the *homepage's* alternates on every
    // page — a wrong signal is worse than none. The per-URL alternates in
    // `sitemap.ts` are correct for each page, and hreflang in a sitemap is
    // equivalent to hreflang in the head.
  },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: TITLE,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    locale: "en",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: SITE_DESCRIPTION,
  },
  robots: { index: true, follow: true },
};

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
        {children}
      </body>
    </html>
  );
}
