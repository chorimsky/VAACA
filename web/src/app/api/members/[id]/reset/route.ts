import { NextResponse, type NextRequest } from "next/server";
import { getStaffSession } from "@/lib/server/auth";
import { issuePasswordReset } from "@/lib/server/members";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

/**
 * `POST /api/members/:id/reset` — staff issue a single-use reset token.
 *
 * There is no mail transport, so the token comes back once in the response for
 * the secretariat to pass to the member out of band. Only its hash is stored.
 */
export async function POST(_request: NextRequest, { params }: Params) {
  const session = await getStaffSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const issued = await issuePasswordReset((await params).id, session.email);
  if (!issued) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    token: issued.token,
    expiresAt: issued.expiresAt,
    url: `/login/reset?token=${encodeURIComponent(issued.token)}`,
  });
}
