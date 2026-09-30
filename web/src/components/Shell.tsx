import { Nav } from "./Nav";
import { Footer } from "./Footer";
import type { NavKey } from "@/lib/routes";
import { getTranslations } from "@/lib/i18n/server";
import { TopRule } from "./TopRule";
import { Card, Container, Eyebrow } from "./primitives";

// Re-exported so server components can keep importing everything from here.
export { TopRule, Card, Container, Eyebrow };

/**
 * Standard page chrome: rule, sticky nav, content, footer.
 * Used by every public page except the standalone ones (login, register,
 * resources, dashboard, admin), which carry their own lighter header.
 */
export async function Shell({
  active,
  children,
}: {
  active?: NavKey;
  children: React.ReactNode;
}) {
  // Reading the locale here keeps every page's `<Shell active="…">` call
  // unchanged while the chrome inside it becomes bilingual.
  const { locale, t } = await getTranslations();

  return (
    <div id="top" className="bg-canvas text-body">
      <TopRule />
      <Nav active={active} locale={locale} t={t} />
      <main id="main-content">{children}</main>
      <Footer />
    </div>
  );
}
