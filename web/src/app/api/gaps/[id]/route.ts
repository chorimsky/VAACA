import { NextResponse, type NextRequest } from "next/server";
import { getStaffSession } from "@/lib/server/auth";
import { updateItem } from "@/lib/server/observatory";
import { isGapOwner, isGapStatus } from "@/lib/gap-types";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

/**
 * `PATCH /api/gaps/:id` — staff only.
 *
 * BACKEND_NOTES.md's permission matrix gives "Gap Register — edit: full" to
 * secretariat and Council staff and to nobody else, so this checks staff
 * membership rather than a particular role. Gap *ownership* is a data field,
 * not an access control.
 *
 * It patches an Observatory entry — the register is a view over it — so the
 * response is the gap shape the console expects *and* the fuller entry.
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

  const { status, owner, note, response } = (body ?? {}) as Record<
    string,
    unknown
  >;

  if (status !== undefined && !isGapStatus(status)) {
    return NextResponse.json({ error: "invalid status" }, { status: 400 });
  }
  if (owner !== undefined && !isGapOwner(owner)) {
    return NextResponse.json({ error: "invalid owner" }, { status: 400 });
  }
  if (note !== undefined && note !== null && typeof note !== "string") {
    return NextResponse.json(
      { error: "note must be a string or null" },
      { status: 400 },
    );
  }
  // The Observatory's own field: what VAACA has said or done about this entry.
  if (
    response !== undefined &&
    response !== null &&
    typeof response !== "string"
  ) {
    return NextResponse.json(
      { error: "response must be a string or null" },
      { status: 400 },
    );
  }
  if (
    status === undefined &&
    owner === undefined &&
    note === undefined &&
    response === undefined
  ) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  const item = await updateItem(
    (await params).id,
    {
      status: status as Parameters<typeof updateItem>[1]["status"],
      owner: owner as Parameters<typeof updateItem>[1]["owner"],
      note: note as string | null | undefined,
      response: response as string | null | undefined,
    },
    session.email,
  );

  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  // Answers in the register's shape, which is what the console reads.
  return NextResponse.json({
    gap: {
      id: item.id,
      description: item.whatChanged.en,
      consequence: item.whyItMatters.en,
      owner: item.owner,
      status: item.status,
      note: item.note,
      updatedBy: item.updatedBy,
      updatedAt: item.updatedAt,
    },
    item,
  });
}
