import { NextResponse } from "next/server";

import { getStaffSession } from "@/lib/server/auth";
import { listPublicSeats, listSeatsForStaff } from "@/lib/server/seats";
import { blocBalance, filledCount, majorityHolder } from "@/lib/seat-types";

export const dynamic = "force-dynamic";

/**
 * The Coordination Council register.
 *
 * Public, because the Governance page publishes the Council's composition —
 * but the public view carries no holder names and no candidate organisations
 * (see `listPublicSeats`). Staff get the recruitment detail.
 */
export async function GET() {
  const session = await getStaffSession();
  const seats = session ? await listSeatsForStaff() : await listPublicSeats();

  return NextResponse.json(
    {
      seats,
      filled: filledCount(seats),
      balance: blocBalance(seats),
      majority: majorityHolder(seats),
    },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
