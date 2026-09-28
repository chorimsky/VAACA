"use client";

import { useState } from "react";

import { Tag } from "@/components/Tag";
import { DocumentIcon, DownloadIcon, LockIcon } from "@/components/icons";
import {
  DOCUMENT_STATUSES,
  DOCUMENT_STATUS_HELP,
  DOCUMENT_STATUS_LABEL,
  DOCUMENT_STATUS_TONE,
  type DocumentStatus,
  type PublicDocument,
} from "@/lib/document-types";

/**
 * The secretariat's control over the library.
 *
 * Status here is not a label — it decides who can reach the file, so changing a
 * document to Internal withdraws it from the public Resources page and makes
 * the download 404 for anyone without a staff session.
 */

const SELECT =
  "rounded-lg border border-doc-line bg-white px-3 py-2 text-[13px] text-doc-ink focus:outline-2 focus:outline-offset-1 focus:outline-teal-ink";

function formatWhen(iso: string | null) {
  if (!iso) return null;
  return new Date(iso).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function DocumentLibrary({
  documents: initial,
}: {
  documents: PublicDocument[];
}) {
  const [documents, setDocuments] = useState(initial);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");

  const open = documents.find((d) => d.id === openId) ?? null;
  const openDescription = open?.description ?? "";

  // Reload the editor when a different document is opened — adjusted during
  // render rather than in an effect.
  const [draftKey, setDraftKey] = useState<string | null>(null);
  const key = `${openId ?? ""}:${openDescription}`;
  if (draftKey !== key) {
    setDraftKey(key);
    setDraft(openDescription);
  }

  const patch = async (
    id: string,
    body: { status?: DocumentStatus; description?: string },
  ) => {
    setPendingId(id);
    setError(null);
    try {
      const res = await fetch(`/api/documents/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
        setError(data?.error ?? "That change could not be saved.");
        return;
      }
      // The PATCH returns the stored record; re-reading the list keeps the
      // derived fields (download path, size, public visibility) consistent
      // with what a visitor would now see.
      const listed = await fetch("/api/documents");
      const { documents: next } = (await listed.json()) as {
        documents: PublicDocument[];
      };
      setDocuments(next);
    } catch {
      setError("Could not reach the server.");
    } finally {
      setPendingId(null);
    }
  };

  const publicCount = documents.filter((d) => d.status !== "internal").length;

  return (
    <section className="mb-10">
      <h2 className="mb-1 text-[20px] font-bold text-navy">Document library</h2>
      <p className="mb-[18px] max-w-[820px] text-[14px] text-doc-body">
        What the public Resources page lists, and what it withholds. Status is
        the access control: <strong>Internal</strong> removes a document from
        the public list and makes its file unreachable without a staff session.
        Every change is saved against your account.{" "}
        <span className="whitespace-nowrap">
          {publicCount} of {documents.length} publicly listed.
        </span>
      </p>

      {error ? (
        <p
          role="alert"
          className="mb-4 rounded-lg border border-red bg-tint-red px-4 py-2.5 text-[13px] text-red"
        >
          {error}
        </p>
      ) : null}

      <ul className="m-0 flex list-none flex-col gap-3 p-0">
        {documents.map((doc) => {
          const busy = pendingId === doc.id;
          const isOpen = openId === doc.id;
          const when = formatWhen(doc.updatedAt);
          return (
            <li
              key={doc.id}
              className="rounded-2xl border border-doc-line bg-white px-5 py-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex min-w-0 items-start gap-3.5">
                  {doc.status === "internal" ? (
                    <LockIcon size="md" className="mt-0.5 text-doc-muted" />
                  ) : (
                    <DocumentIcon size="md" className="mt-0.5 text-teal-ink" />
                  )}
                  <div className="min-w-0">
                    <div className="text-[14.5px] font-bold text-navy">
                      {doc.title}
                    </div>
                    <div className="mt-[3px] text-[12.5px] text-doc-body">
                      {doc.description}
                    </div>
                    <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-doc-muted">
                      {doc.href ? (
                        <a
                          href={doc.href}
                          // py-1/-my-1 grows the hit area to 24px without
                          // changing the row's height.
                          className="-my-1 inline-flex items-center gap-1.5 py-1 font-semibold text-teal-ink"
                        >
                          <DownloadIcon size="xs" />
                          {doc.sizeLabel}
                        </a>
                      ) : (
                        <span className="italic">
                          {doc.unavailableReason ?? "Nothing published yet."}
                        </span>
                      )}
                      {when ? <span>Updated {when}</span> : null}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <Tag tone={DOCUMENT_STATUS_TONE[doc.status]}>
                    {doc.statusLabel}
                  </Tag>
                  <label className="flex items-center gap-2 text-[12px] text-doc-muted">
                    <span className="sr-only">Status for {doc.title}</span>
                    <select
                      className={SELECT}
                      value={doc.status}
                      disabled={busy}
                      onChange={(e) =>
                        patch(doc.id, {
                          status: e.target.value as DocumentStatus,
                        })
                      }
                    >
                      {DOCUMENT_STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {DOCUMENT_STATUS_LABEL[s]}
                        </option>
                      ))}
                    </select>
                  </label>
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setOpenId(isOpen ? null : doc.id)}
                    className="cursor-pointer rounded-lg border border-doc-line bg-white px-3 py-2 text-[12.5px] font-semibold text-navy"
                  >
                    {isOpen ? "Close" : "Edit description"}
                  </button>
                </div>
              </div>

              <p className="mt-2.5 mb-0 text-[12px] text-doc-muted">
                {DOCUMENT_STATUS_HELP[doc.status]}
              </p>

              {isOpen ? (
                <div className="mt-3.5 border-t border-doc-line pt-3.5">
                  <label className="block">
                    <span className="mb-1.5 block text-[12.5px] font-semibold text-doc-ink">
                      Description shown in the public library
                    </span>
                    <textarea
                      rows={2}
                      maxLength={400}
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      className="w-full rounded-lg border border-doc-line px-3.5 py-2.5 text-[13px] focus:outline-2 focus:outline-offset-1 focus:outline-teal-ink"
                    />
                  </label>
                  <div className="mt-2 flex items-center gap-3">
                    <button
                      type="button"
                      disabled={
                        busy ||
                        draft.trim().length < 3 ||
                        draft.trim() === doc.description
                      }
                      onClick={() =>
                        patch(doc.id, { description: draft.trim() })
                      }
                      className="cursor-pointer rounded-lg border-none bg-navy px-4 py-2 text-[12.5px] font-semibold text-white disabled:cursor-not-allowed disabled:bg-canvas-alt disabled:text-muted"
                    >
                      Save description
                    </button>
                    <span className="text-[12px] text-doc-muted">
                      {draft.trim().length}/400
                    </span>
                  </div>
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
