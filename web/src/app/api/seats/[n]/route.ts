import { NextResponse, type NextRequest } from "next/server";

import { getStaffSession } from "@/lib/server/auth";
import { getSeat, updateSeat } from "@/lib/server/seats";
import { isSeatStatus } from "@/lib/seat-types";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ n: string }> };

/** Record recruitment progress on one seat — secretariat only. */
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

  const { status, holder, organisation, note } = (body ?? {}) as Record<
    string,
    unknown
  >;

  if (status !== undefined && !isSeatStatus(status)) {
    return NextResponse.json(
      { error: "status must be one of vacant, candidate, filled" },
      { status: 400 },
    );
  }

  const text = (value: unknown, field: string, max: number) => {
    if (value === undefined || value === null) return null;
    if (typeof value !== "string" || value.length > max) {
      return `${field} must be a string of ${max} characters or fewer, or null`;
    }
    return null;
  };
  const problem =
    text(holder, "holder", 120) ??
    text(organisation, "organisation", 160) ??
    text(note, "note", 400);
  if (problem) return NextResponse.json({ error: problem }, { status: 400 });

  const n = Number((await params).n);
  if (!Number.isInteger(n)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const current = await getSeat(n);
  if (!current)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Validate the state the patch would produce, not the patch alone: a seat
  // must not end up "filled" without recording who holds it and what they
  // represent, whether that is because the request cleared them or because
  // they were never set.
  const effective = {
    status: (status as string | undefined) ?? current.status,
    holder: holder === undefined ? current.holder : (holder as string | null),
    organisation:
      organisation === undefined
        ? current.organisation
        : (organisation as string | null),
  };
  const blank = (v: string | null) => !v || v.trim().length === 0;
  if (
    effective.status === "filled" &&
    (blank(effective.holder) || blank(effective.organisation))
  ) {
    return NextResponse.json(
      { error: "a filled seat needs both a holder and an organisation" },
      { status: 400 },
    );
  }

  const seat = await updateSeat(
    n,
    {
      status: status as Parameters<typeof updateSeat>[1]["status"],
      holder: holder as string | null | undefined,
      organisation: organisation as string | null | undefined,
      note: note as string | null | undefined,
    },
    session.email,
  );

  if (!seat) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ seat });
}
