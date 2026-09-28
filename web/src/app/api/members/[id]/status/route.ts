import { NextResponse, type NextRequest } from "next/server";

import { getStaffSession } from "@/lib/server/auth";
import { getMember, setMemberStatus } from "@/lib/server/members";
import { isMemberStatus } from "@/lib/member-types";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

/**
 * Suspend or reinstate a member — secretariat only.
 *
 * Separate from the accession decision on `/api/applications/:id`: that records
 * whether someone was admitted, this records whether an admitted member is in
 * good standing. Conflating them is what previously left rejected applicants
 * reading "Suspended" on their own dashboard.
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

  const { status } = (body ?? {}) as Record<string, unknown>;
  if (!isMemberStatus(status)) {
    return NextResponse.json(
      { error: "status must be one of applicant, active, suspended" },
      { status: 400 },
    );
  }

  const { id } = await params;
  const current = await getMember(id);
  if (!current) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Reinstating returns a member to `active` only if they were admitted;
  // someone whose application is still open goes back to `applicant`.
  const member = await setMemberStatus(id, status);
  if (!member) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ member });
}
