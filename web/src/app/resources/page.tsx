import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { Eyebrow, TopRule } from "@/components/Shell";
import { Tag } from "@/components/Tag";
import { routes } from "@/lib/routes";
import { DocumentIcon, DownloadIcon } from "@/components/icons";
import { listPublicDocuments } from "@/lib/server/documents";
import type { PublicDocument } from "@/lib/document-types";

export const metadata: Metadata = {
  title: "Resources",
  description:
    "VAACA founding documents, standards drafts and briefings. Items marked as working drafts are circulated for comment, not final positions.",
};

function DocBody({ doc }: { doc: PublicDocument }) {
  return (
    <>
      <span className="flex min-w-0 items-center gap-3.5">
        <DocumentIcon size="md" className="text-teal-ink" />
        <span className="min-w-0">
          <span className="block text-[14.5px] font-bold text-navy">
            {doc.title}
          </span>
          <span className="mt-[3px] block text-[12.5px] text-muted">
            {doc.description}
          </span>
          {/* The reason a document cannot be downloaded is content, not a
              tooltip: `title` never reaches a keyboard or touch user. */}
          {doc.unavailableReason ? (
            <span className="mt-[3px] block text-[12px] text-body-softer italic">
              {doc.unavailableReason}
            </span>
          ) : null}
        </span>
      </span>

      <span className="flex shrink-0 items-center gap-3">
        {doc.href ? (
          <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-muted">
            {doc.sizeLabel}
            <DownloadIcon size="xs" />
          </span>
        ) : (
          <span className="text-[12px] text-muted italic">
            Not yet published
          </span>
        )}
        <Tag tone={doc.tone} className="px-3 py-[5px]">
          {doc.statusLabel}
        </Tag>
      </span>
    </>
  );
}

export const dynamic = "force-dynamic";

export default async function ResourcesPage() {
  const documents = await listPublicDocuments();

  return (
    <div className="flex min-h-screen flex-col bg-canvas text-body">
      <TopRule />

      <div className="mx-auto flex w-full max-w-[1180px] flex-wrap items-center justify-between gap-4 px-8 py-5">
        <Logo />
        <Link
          href={routes.home}
          className="text-[13.5px] font-semibold text-navy no-underline"
        >
          <span aria-hidden>←</span> Back to VAACA
        </Link>
      </div>

      <main
        id="main-content"
        className="vaaca-fade-in mx-auto w-full max-w-[1180px] flex-1 px-8 pt-6 pb-16"
      >
        <Eyebrow>Resources</Eyebrow>
        <h1 className="m-0 mb-3 font-serif text-[32px] font-semibold text-navy">
          Documents &amp; Library
        </h1>
        <p className="mb-9 max-w-[620px] text-[14.5px] leading-[1.6] text-body-soft">
          Founding documents, standards drafts and briefings. Draft-status items
          are circulated for comment, not final positions.
        </p>

        <ul className="m-0 flex list-none flex-col gap-3.5 p-0">
          {documents.map((doc) => (
            <li key={doc.id}>
              {doc.href ? (
                <a
                  href={doc.href}
                  className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-line bg-white px-[22px] py-[18px] no-underline transition-shadow duration-150 hover:border-teal hover:shadow-[0_8px_20px_-14px_rgba(14,42,68,.35)]"
                >
                  <DocBody doc={doc} />
                </a>
              ) : (
                // No file yet: render the same row without link affordance, and
                // say why rather than leaving a dead click.
                <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-line bg-white px-[22px] py-[18px]">
                  <DocBody doc={doc} />
                </div>
              )}
            </li>
          ))}
        </ul>

        <p className="mt-8 max-w-[620px] text-[12.5px] leading-[1.6] text-muted">
          Documents marked “Not yet published” are drafted but not circulated.
          Contact the secretariat for access.
        </p>
      </main>

      <div className="px-8 py-5 text-center text-[12px] text-muted">
        VAACA · Virtual Assets Association of Central Africa · In Formation
      </div>
    </div>
  );
}
