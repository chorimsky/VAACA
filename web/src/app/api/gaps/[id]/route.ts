import { NextResponse, type NextRequest } from "next/server";
import { getStaffSession } from "@/lib/server/auth";
import { updateGap } from "@/lib/server/gaps";
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

  const { status, owner, note } = (body ?? {}) as Record<string, unknown>;

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
  if (status === undefined && owner === undefined && note === undefined) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  const gap = await updateGap(
    (await params).id,
    {
      status: status as Parameters<typeof updateGap>[1]["status"],
      owner: owner as Parameters<typeof updateGap>[1]["owner"],
      note: note as string | null | undefined,
    },
    session.email,
  );

  if (!gap) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ gap });
}
