import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { Eyebrow, TopRule } from "@/components/Shell";
import { Tag } from "@/components/Tag";
import { routes } from "@/lib/routes";
import { DocumentIcon, DownloadIcon } from "@/components/icons";
import { listPublicDocuments } from "@/lib/server/documents";
import { getTranslations } from "@/lib/i18n/server";
import { documentMetadata } from "@/lib/i18n/metadata";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import type { PublicDocument } from "@/lib/document-types";
import type { Dictionary } from "@/lib/i18n/dictionaries";

export async function generateMetadata(): Promise<Metadata> {
  // The title, the description and the social card all follow the
  // page's language, and the canonical URL names this page.
  const { t } = await getTranslations();
  const m = t.meta.resources;
  return {
    ...(await documentMetadata(m.title, m.description)),
  };
}

function DocBody({
  doc,
  t,
}: {
  doc: PublicDocument;
  t: Dictionary["resources"];
}) {
  // A document added after this dictionary was written falls back to whatever
  // the store holds, rather than rendering an empty label.
  const copy = (
    t.documents as Record<
      string,
      { title: string; description: string } | undefined
    >
  )[doc.id];
  const title = copy?.title ?? doc.title;
  const description = copy?.description ?? doc.description;
  // The store keeps an English sentence; the recognised ones are translated and
  // anything unrecognised still says something rather than nothing.
  const reason = doc.unavailableKey
    ? t.unavailable[doc.unavailableKey]
    : doc.unavailableReason;
  const size = doc.generated ? `CSV · ${t.generatedOnRequest}` : doc.sizeLabel;
  return (
    <>
      <span className="flex min-w-0 items-center gap-3.5">
        <DocumentIcon size="md" className="text-teal-ink" />
        <span className="min-w-0">
          <span className="block text-[14.5px] font-bold text-navy">
            {title}
          </span>
          <span className="mt-[3px] block text-[12.5px] text-muted">
            {description}
          </span>
          {/* The reason a document cannot be downloaded is content, not a
              tooltip: `title` never reaches a keyboard or touch user. */}
          {reason ? (
            <span className="mt-[3px] block text-[12px] text-body-softer italic">
              {reason}
            </span>
          ) : null}
        </span>
      </span>

      <span className="flex shrink-0 items-center gap-3">
        {doc.href ? (
          <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-muted">
            {size}
            <DownloadIcon size="xs" />
          </span>
        ) : (
          <span className="text-[12px] text-muted italic">
            {t.notYetPublished}
          </span>
        )}
        <Tag tone={doc.tone} className="px-3 py-[5px]">
          {t.status[doc.status]}
        </Tag>
      </span>
    </>
  );
}

export const dynamic = "force-dynamic";

export default async function ResourcesPage() {
  const { t, path, locale } = await getTranslations();
  const r = t.resources;
  const documents = await listPublicDocuments();

  return (
    <div className="flex min-h-screen flex-col bg-canvas text-body">
      <TopRule />

      <div className="mx-auto flex w-full max-w-[1180px] flex-wrap items-center justify-between gap-4 px-8 py-5">
        <Logo />
        <div className="flex flex-wrap items-center gap-4">
          <Link
            href={path(routes.home)}
            className="text-[13.5px] font-semibold text-navy no-underline"
          >
            <span aria-hidden>←</span> {t.nav.backToVaaca}
          </Link>
          <LanguageSwitcher locale={locale} label={t.language.label} />
        </div>
      </div>

      <main
        id="main-content"
        className="vaaca-fade-in mx-auto w-full max-w-[1180px] flex-1 px-8 pt-6 pb-16"
      >
        <Eyebrow>{t.nav.resources}</Eyebrow>
        <h1 className="m-0 mb-3 font-serif text-[32px] font-semibold text-navy">
          {r.title}
        </h1>
        <p className="mb-9 max-w-[620px] text-[14.5px] leading-[1.6] text-body-soft">
          {r.lede}
        </p>

        <ul className="m-0 flex list-none flex-col gap-3.5 p-0">
          {documents.map((doc) => (
            <li key={doc.id}>
              {doc.href ? (
                <a
                  href={doc.href}
                  className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-line bg-white px-[22px] py-[18px] no-underline transition-shadow duration-150 hover:border-teal hover:shadow-[0_8px_20px_-14px_rgba(14,42,68,.35)]"
                >
                  <DocBody doc={doc} t={r} />
                </a>
              ) : (
                // No file yet: render the same row without link affordance, and
                // say why rather than leaving a dead click.
                <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-line bg-white px-[22px] py-[18px]">
                  <DocBody doc={doc} t={r} />
                </div>
              )}
            </li>
          ))}
        </ul>

        <p className="mt-8 max-w-[620px] text-[12.5px] leading-[1.6] text-muted">
          {r.footnote}
        </p>
      </main>

      <div className="px-8 py-5 text-center text-[12px] text-muted">
        {t.auth.footer}
      </div>
    </div>
  );
}
