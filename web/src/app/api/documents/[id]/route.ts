import { NextResponse, type NextRequest } from "next/server";

import { getStaffSession } from "@/lib/server/auth";
import { getDocument, updateDocument } from "@/lib/server/documents";
import { isDocumentStatus } from "@/lib/document-types";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

/**
 * Edit one document — secretariat only.
 *
 * Status is the access control (see `document-types.ts`), so this is the
 * endpoint that publishes or withdraws a document. Every change is attributed,
 * as with applications and the gap register.
 */
export async function PATCH(request: NextRequest, { params }: Params) {
  const session = await getStaffSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Expected JSON body" }, { status: 400 });
  }

  const { status, description, unavailableReason } = (body ?? {}) as Record<
    string,
    unknown
  >;

  if (status !== undefined && !isDocumentStatus(status)) {
    return NextResponse.json(
      { error: "status must be one of ratified, living, draft, internal" },
      { status: 400 },
    );
  }
  if (description !== undefined) {
    if (typeof description !== "string" || description.trim().length < 3) {
      return NextResponse.json(
        { error: "description must be at least 3 characters" },
        { status: 400 },
      );
    }
    if (description.length > 400) {
      return NextResponse.json(
        { error: "description must be 400 characters or fewer" },
        { status: 400 },
      );
    }
  }
  if (
    unavailableReason !== undefined &&
    unavailableReason !== null &&
    (typeof unavailableReason !== "string" || unavailableReason.length > 300)
  ) {
    return NextResponse.json(
      {
        error:
          "unavailableReason must be a string of 300 characters or fewer, or null",
      },
      { status: 400 },
    );
  }

  const { id } = await params;
  if (!(await getDocument(id))) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const document = await updateDocument(
    id,
    {
      status: status as Parameters<typeof updateDocument>[1]["status"],
      description:
        description === undefined ? undefined : (description as string).trim(),
      unavailableReason: unavailableReason as string | null | undefined,
    },
    session.email,
  );

  if (!document) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ document });
}
