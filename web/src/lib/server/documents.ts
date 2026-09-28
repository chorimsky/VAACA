import "server-only";

import { createHash } from "node:crypto";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";

import { readOrSeed, writeStore } from "./json-store";
import { listGaps } from "./gaps";
import { GAP_STATUS_LABEL } from "@/lib/gap-types";
import {
  documentExtension,
  documentHref,
  formatSize,
  isPublicStatus,
  type DocumentRecord,
  type DocumentStatus,
  type PublicDocument,
} from "@/lib/document-types";
import {
  DOCUMENT_STATUS_LABEL,
  DOCUMENT_STATUS_TONE,
} from "@/lib/document-types";

/**
 * The document library.
 *
 * Files live outside `public/` — in `documents/`, or wherever
 * `VAACA_DOCUMENT_DIR` points — so that a status change actually controls
 * access. Anything under `public/` is served by the CDN before any of our code
 * runs, which would leave an "Internal" document downloadable by anyone who
 * knows the URL.
 */

const DOCUMENTS = "documents.json";

export const DOCUMENT_DIR = process.env.VAACA_DOCUMENT_DIR
  ? path.resolve(process.env.VAACA_DOCUMENT_DIR)
  : path.join(process.cwd(), "documents");

/* -------------------------------------------------------------------------- */
/* Seed                                                                        */
/* -------------------------------------------------------------------------- */

/**
 * The six documents the prototype's Resources page listed. The three with a
 * file are the real PDFs shipped in the design bundle; the rest are drafted but
 * not circulated, and say so rather than rendering as a dead link.
 */
const SEED: Omit<DocumentRecord, "updatedAt" | "updatedBy">[] = [
  {
    id: "institutional-charter",
    title: "Founding Charter",
    description: "Governance, membership classes, and mandate.",
    status: "ratified",
    file: "vaaca-institutional-charter-v0.1.pdf",
    fileSize: null,
    generated: null,
    unavailableReason: null,
  },
  {
    id: "psan-readiness-framework",
    title: "PSAN Regulatory Readiness Framework",
    description: "3 gates, 8 domains, 24-point scoring scale.",
    status: "draft",
    file: "vaaca-psan-readiness-framework-v0.1.pdf",
    fileSize: null,
    generated: null,
    unavailableReason: null,
  },
  {
    id: "founding-coalition-architecture",
    title: "Founding Coalition & Alliance Architecture",
    description: "9 seats and priority institutional relationships.",
    status: "draft",
    file: "vaaca-founding-coalition-architecture-v0.1.pdf",
    fileSize: null,
    generated: null,
    unavailableReason: null,
  },
  {
    id: "instruction-gap-register",
    title: "Instruction Gap Register",
    description: "Ten regulatory gaps blocking full readiness scoring.",
    status: "living",
    file: null,
    fileSize: null,
    generated: "gap-register",
    unavailableReason: null,
  },
  {
    id: "cemac-federation-roadmap",
    title: "CEMAC Federation Roadmap",
    description: "Sequenced path from Cameroon chapter to full federation.",
    status: "draft",
    file: null,
    fileSize: null,
    generated: null,
    unavailableReason: "Drafting in progress.",
  },
  {
    id: "founding-declaration-brief",
    title: "Founding Declaration Brief",
    description: "For the Yaoundé conference — not yet public.",
    status: "internal",
    file: null,
    fileSize: null,
    generated: null,
    unavailableReason:
      "Internal — not circulated outside the founding coalition.",
  },
];

const load = () =>
  readOrSeed<DocumentRecord[]>(DOCUMENTS, () =>
    SEED.map((d) => ({ ...d, updatedAt: null, updatedBy: null })),
  );

/* -------------------------------------------------------------------------- */
/* Reads                                                                       */
/* -------------------------------------------------------------------------- */

/**
 * Sizes are measured from the file rather than stored, so a replaced file can
 * never be described by a stale number.
 */
async function withSize(doc: DocumentRecord): Promise<DocumentRecord> {
  if (!doc.file) return doc;
  try {
    const info = await stat(path.join(DOCUMENT_DIR, doc.file));
    return { ...doc, fileSize: info.size };
  } catch {
    // The row promises a file that is not on disk. Report it as unavailable
    // rather than serving a link that 404s.
    return {
      ...doc,
      fileSize: null,
      unavailableReason:
        doc.unavailableReason ?? "File missing from the document store.",
    };
  }
}

export async function listDocuments(): Promise<DocumentRecord[]> {
  return Promise.all((await load()).map(withSize));
}

export async function getDocument(
  id: string,
): Promise<DocumentRecord | undefined> {
  const doc = (await load()).find((d) => d.id === id);
  return doc ? withSize(doc) : undefined;
}

/** Does this document have something to download right now? */
export const isDownloadable = (doc: DocumentRecord) =>
  doc.generated !== null || (doc.file !== null && doc.fileSize !== null);

function toPublic(doc: DocumentRecord): PublicDocument {
  const downloadable = isDownloadable(doc);
  return {
    id: doc.id,
    title: doc.title,
    description: doc.description,
    status: doc.status,
    statusLabel: DOCUMENT_STATUS_LABEL[doc.status],
    tone: DOCUMENT_STATUS_TONE[doc.status],
    href: downloadable ? documentHref(doc) : null,
    sizeLabel: doc.generated
      ? "CSV · generated on request"
      : formatSize(doc.fileSize, documentExtension(doc)),
    unavailableReason: downloadable ? null : doc.unavailableReason,
    updatedAt: doc.updatedAt,
  };
}

/**
 * The library as a visitor sees it.
 *
 * `internal` documents are omitted entirely — their existence is the thing
 * being withheld. `draft` documents stay listed without a download, because the
 * prototype's Resources page deliberately shows what is coming.
 */
export async function listPublicDocuments(): Promise<PublicDocument[]> {
  const docs = await listDocuments();
  return docs.filter((d) => d.status !== "internal").map(toPublic);
}

/** The same shape, but for staff — nothing withheld. */
export async function listDocumentsForStaff(): Promise<PublicDocument[]> {
  return (await listDocuments()).map(toPublic);
}

export async function countDocuments() {
  const docs = await listDocuments();
  return {
    total: docs.length,
    published: docs.filter((d) => isPublicStatus(d.status)).length,
    downloadable: docs.filter(isDownloadable).length,
    internal: docs.filter((d) => d.status === "internal").length,
  };
}

/* -------------------------------------------------------------------------- */
/* Writes                                                                      */
/* -------------------------------------------------------------------------- */

export type DocumentPatch = {
  status?: DocumentStatus;
  description?: string;
  unavailableReason?: string | null;
};

export async function updateDocument(
  id: string,
  patch: DocumentPatch,
  actor: string,
): Promise<DocumentRecord | null> {
  await load();
  const updated = await writeStore<DocumentRecord[], DocumentRecord | null>(
    DOCUMENTS,
    [],
    async (docs) => {
      const index = docs.findIndex((d) => d.id === id);
      if (index === -1) return { next: docs, result: null };

      const next: DocumentRecord = {
        ...docs[index],
        status: patch.status ?? docs[index].status,
        description: patch.description ?? docs[index].description,
        unavailableReason:
          patch.unavailableReason === undefined
            ? docs[index].unavailableReason
            : patch.unavailableReason,
        updatedBy: actor,
        updatedAt: new Date().toISOString(),
      };

      const rows = [...docs];
      rows[index] = next;
      return { next: rows, result: next };
    },
  );
  return updated ? withSize(updated) : null;
}

/* -------------------------------------------------------------------------- */
/* File delivery                                                               */
/* -------------------------------------------------------------------------- */

export type DocumentPayload = {
  body: Buffer;
  contentType: string;
  filename: string;
  etag: string;
};

/** Escapes one CSV field: quote it, and double any quote inside it. */
const csvField = (value: string) => `"${value.replace(/"/g, '""')}"`;

const csvRow = (cells: (string | null)[]) =>
  cells.map((c) => csvField(c ?? "")).join(",");

/**
 * The Gap Register export, built from the register the Operating System edits,
 * so a download can never disagree with the console.
 */
async function generateGapRegister(): Promise<string> {
  const gaps = await listGaps();
  const lines = [
    csvRow([
      "id",
      "description",
      "consequence",
      "owner",
      "status",
      "note",
      "updated_by",
      "updated_at",
    ]),
    ...gaps.map((g) =>
      csvRow([
        g.id,
        g.description,
        g.consequence,
        g.owner,
        GAP_STATUS_LABEL[g.status],
        g.note,
        g.updatedBy,
        g.updatedAt,
      ]),
    ),
  ];
  // Excel opens UTF-8 CSV as the local codepage unless it sees a BOM, which
  // mangles the accented place names in these rows.
  return `﻿${lines.join("\r\n")}\r\n`;
}

/**
 * Reads a document for delivery. Returns null when there is nothing to serve;
 * the caller decides the status code, and checks permission before calling.
 */
export async function readDocumentPayload(
  doc: DocumentRecord,
): Promise<DocumentPayload | null> {
  if (doc.generated === "gap-register") {
    const body = Buffer.from(await generateGapRegister(), "utf8");
    return {
      body,
      contentType: "text/csv; charset=utf-8",
      filename: `${doc.id}.csv`,
      etag: `"${createHash("sha256").update(body).digest("hex").slice(0, 32)}"`,
    };
  }

  if (!doc.file) return null;

  // Defence in depth: the file name comes from our own store, but resolving it
  // and checking containment means a bad row can never read outside the
  // document directory.
  const target = path.resolve(DOCUMENT_DIR, doc.file);
  if (target !== path.join(DOCUMENT_DIR, path.basename(doc.file))) return null;

  try {
    const [body, info] = await Promise.all([readFile(target), stat(target)]);
    return {
      body,
      contentType: "application/pdf",
      filename: doc.file,
      etag: `"${info.size.toString(16)}-${info.mtimeMs.toString(16)}"`,
    };
  } catch {
    return null;
  }
}
