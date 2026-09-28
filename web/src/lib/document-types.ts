import type { Tone } from "@/components/Tag";

/**
 * The `Document` entity from BACKEND_NOTES.md — id, title, description, status,
 * file_url, updated_at — shared between the store, the API, the public library
 * and the secretariat's management surface.
 *
 * Status is the access control, not a label. `ratified` and `living` are
 * public; `draft` and `internal` are staff-only, and the file route enforces
 * that rather than relying on the listing to hide the link.
 */

export const DOCUMENT_STATUSES = [
  "ratified",
  "living",
  "draft",
  "internal",
] as const;

export type DocumentStatus = (typeof DOCUMENT_STATUSES)[number];

export const DOCUMENT_STATUS_LABEL: Record<DocumentStatus, string> = {
  ratified: "Ratified",
  living: "Living document",
  draft: "Working draft",
  internal: "Internal",
};

export const DOCUMENT_STATUS_TONE: Record<DocumentStatus, Tone> = {
  ratified: "green",
  living: "blue",
  draft: "gold",
  internal: "neutral",
};

export const DOCUMENT_STATUS_HELP: Record<DocumentStatus, string> = {
  ratified: "Public — adopted text.",
  living: "Public — maintained continuously; the download is a live export.",
  draft: "Public — circulated as a working paper, not a final position.",
  internal: "Restricted — not listed publicly, and not downloadable.",
};

/**
 * Which statuses anyone may see and download.
 *
 * Maturity and access are separate things: the prototype's Resources page
 * published its working drafts, labelled as drafts, and withheld only the
 * internal brief. So `draft` is public, and whether a document can be
 * downloaded at all depends on having a file — not on its status.
 */
export const PUBLIC_STATUSES: readonly DocumentStatus[] = [
  "ratified",
  "living",
  "draft",
];

export const isPublicStatus = (status: DocumentStatus) =>
  PUBLIC_STATUSES.includes(status);

/**
 * Documents are either an uploaded file or generated from live data. The Gap
 * Register is the second kind: it is the register the Operating System edits,
 * so exporting a stale copy would be worse than exporting it on request.
 */
export type GeneratedSource = "gap-register";

export type DocumentRecord = {
  id: string;
  title: string;
  description: string;
  status: DocumentStatus;
  /**
   * File name inside the private document directory, or null when nothing has
   * been published. Never a URL — the served path is derived from `id`, so
   * changing status cannot leave a stale public link behind.
   */
  file: string | null;
  /** Bytes, for the size shown beside a download. */
  fileSize: number | null;
  generated: GeneratedSource | null;
  /** Why an unpublished document cannot be downloaded yet. */
  unavailableReason: string | null;
  updatedAt: string | null;
  updatedBy: string | null;
};

/** What the public library is allowed to see — no file names, no internals. */
export type PublicDocument = {
  id: string;
  title: string;
  description: string;
  status: DocumentStatus;
  statusLabel: string;
  tone: Tone;
  /** Download path, or null when unpublished. */
  href: string | null;
  sizeLabel: string | null;
  unavailableReason: string | null;
  updatedAt: string | null;
};

export const isDocumentStatus = (v: unknown): v is DocumentStatus =>
  typeof v === "string" && (DOCUMENT_STATUSES as readonly string[]).includes(v);

/** A generated document is served as CSV; an uploaded one as PDF. */
export const documentExtension = (
  doc: Pick<DocumentRecord, "generated">,
): "csv" | "pdf" => (doc.generated ? "csv" : "pdf");

/** The download path for a document. Derived from the id, never stored. */
export const documentHref = (
  doc: Pick<DocumentRecord, "id" | "generated">,
): string => `/documents/${doc.id}.${documentExtension(doc)}`;

/** `PDF · 456 KB`, `PDF · 1.2 MB` — the prototype's phrasing. */
export function formatSize(
  bytes: number | null,
  kind: "csv" | "pdf",
): string | null {
  const label = kind.toUpperCase();
  if (bytes === null || bytes <= 0) return null;
  const kb = bytes / 1024;
  return kb < 1024
    ? `${label} · ${Math.round(kb)} KB`
    : `${label} · ${(kb / 1024).toFixed(1)} MB`;
}
