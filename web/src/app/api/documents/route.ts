import { NextResponse } from "next/server";

import { getStaffSession } from "@/lib/server/auth";
import {
  listDocumentsForStaff,
  listPublicDocuments,
} from "@/lib/server/documents";

export const dynamic = "force-dynamic";

/**
 * `GET /documents` from BACKEND_NOTES.md.
 *
 * Public by design — it backs the Resources library. Staff see the full set,
 * including `internal` documents; everyone else sees the same list the library
 * renders, with no file names and nothing restricted.
 */
export async function GET() {
  const session = await getStaffSession();
  const documents = session
    ? await listDocumentsForStaff()
    : await listPublicDocuments();

  return NextResponse.json(
    { documents },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
