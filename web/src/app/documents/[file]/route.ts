import { NextResponse, type NextRequest } from "next/server";

import { getStaffSession } from "@/lib/server/auth";
import {
  getDocument,
  isDownloadable,
  readDocumentPayload,
} from "@/lib/server/documents";
import { documentExtension } from "@/lib/document-types";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ file: string }> };

/**
 * Serves one document at `/documents/<id>.<ext>`.
 *
 * These files used to sit in `public/`, where the static handler answers before
 * any of our code runs — so a document's status was only ever a label. Serving
 * them here means `internal` actually withholds the bytes.
 *
 * Middleware does not see this path (its matcher skips anything with a file
 * extension), so the session check below is the only gate and has to be here.
 */
export async function GET(request: NextRequest, { params }: Params) {
  const segment = (await params).file;
  const dot = segment.lastIndexOf(".");
  if (dot <= 0) return notFound();

  const id = segment.slice(0, dot);
  const extension = segment.slice(dot + 1).toLowerCase();

  const doc = await getDocument(id);
  if (!doc) return notFound();

  // Restricted documents 404 rather than 403: whether the Founding Declaration
  // Brief exists is itself the thing being withheld.
  if (doc.status === "internal" && !(await getStaffSession()))
    return notFound();

  // One document, one URL — asking for the wrong extension is a miss, not a
  // redirect, so a stale `.pdf` link to a now-generated document cannot 200.
  if (extension !== documentExtension(doc)) return notFound();

  if (!isDownloadable(doc)) return notFound();

  const payload = await readDocumentPayload(doc);
  if (!payload) return notFound();

  // A conditional request saves re-sending ~800 KB on every visit.
  if (request.headers.get("if-none-match") === payload.etag) {
    return new NextResponse(null, {
      status: 304,
      headers: {
        ETag: payload.etag,
        "Cache-Control": cacheControl(doc.status),
      },
    });
  }

  return new NextResponse(new Uint8Array(payload.body), {
    status: 200,
    headers: {
      "Content-Type": payload.contentType,
      "Content-Length": String(payload.body.byteLength),
      // `inline` so a PDF opens in the browser's viewer; the filename still
      // applies when the reader chooses to save it.
      "Content-Disposition": `inline; filename="${payload.filename}"`,
      ETag: payload.etag,
      "Cache-Control": cacheControl(doc.status),
      "X-Content-Type-Options": "nosniff",
    },
  });
}

/**
 * Restricted documents must not be held by a shared cache, and the Gap Register
 * export is regenerated from live data on every request.
 */
function cacheControl(status: string): string {
  if (status === "internal") return "private, no-store";
  if (status === "living") return "private, no-cache";
  return "public, max-age=0, must-revalidate";
}

const notFound = () =>
  new NextResponse("Not found", {
    status: 404,
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
