import { NextResponse } from "next/server";
import { getStaffSession } from "@/lib/server/auth";
import { listGaps } from "@/lib/server/gaps";

export const dynamic = "force-dynamic";

/** `GET /api/gaps` — staff only; members have no view of the register at all. */
export async function GET() {
  const session = await getStaffSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  return NextResponse.json({ gaps: await listGaps() });
}
