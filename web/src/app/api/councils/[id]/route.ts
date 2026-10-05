import { NextResponse, type NextRequest } from "next/server";

import { getStaffSession } from "@/lib/server/auth";
import {
  CouncilNotReadyError,
  getCouncil,
  setCouncilComposition,
  setCouncilStatus,
} from "@/lib/server/councils";
import {
  activationBlockers,
  isCouncilId,
  isCouncilStatus,
  type CouncilSeat,
} from "@/lib/council-types";
import { isSeatStatus } from "@/lib/seat-types";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

/** `GET /api/councils/:id` — staff view, including why it cannot be activated. */
export async function GET(_request: NextRequest, { params }: Params) {
  const session = await getStaffSession();
  if (!session) {
    return NextResponse.json(
      { error: "Not authenticated", code: "unauthenticated" },
      { status: 401 },
    );
  }

  const { id } = await params;
  const council = isCouncilId(id) ? await getCouncil(id) : undefined;
  if (!council) {
    return NextResponse.json(
      { error: "Not found", code: "not_found" },
      { status: 404 },
    );
  }

  return NextResponse.json({
    council,
    blockers: activationBlockers(council),
  });
}

const isBloc = (v: unknown): v is CouncilSeat["bloc"] =>
  v === "industry" || v === "professional" || v === "independent";

/**
 * `PATCH /api/councils/:id` — secretariat only.
 *
 * `{ seats, quorum }` sets the composition; `{ status }` moves the council
 * between proposed, active and dormant. Activation is the one transition that
 * can be refused, and the refusal says why rather than failing silently.
 */
export async function PATCH(request: NextRequest, { params }: Params) {
  const session = await getStaffSession();
  if (!session) {
    return NextResponse.json(
      { error: "Not authenticated", code: "unauthenticated" },
      { status: 401 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Expected JSON body", code: "bad_request" },
      { status: 400 },
    );
  }

  const { id } = await params;
  if (!isCouncilId(id) || !(await getCouncil(id))) {
    return NextResponse.json(
      { error: "Not found", code: "not_found" },
      { status: 404 },
    );
  }

  const { seats, quorum, status } = (body ?? {}) as Record<string, unknown>;

  if (seats !== undefined || quorum !== undefined) {
    const invalid: string[] = [];
    if (!Array.isArray(seats)) invalid.push("seats");
    if (typeof quorum !== "number" || !Number.isInteger(quorum) || quorum < 0) {
      invalid.push("quorum");
    }

    const parsed: CouncilSeat[] = [];
    if (Array.isArray(seats)) {
      seats.forEach((raw, index) => {
        const seat = (raw ?? {}) as Record<string, unknown>;
        if (
          typeof seat.name !== "string" ||
          seat.name.trim().length < 2 ||
          !isBloc(seat.bloc) ||
          (seat.status !== undefined && !isSeatStatus(seat.status)) ||
          (seat.organisation !== undefined &&
            seat.organisation !== null &&
            typeof seat.organisation !== "string")
        ) {
          invalid.push("seats");
          return;
        }
        parsed.push({
          n: index + 1,
          name: seat.name.trim(),
          bloc: seat.bloc,
          status: isSeatStatus(seat.status) ? seat.status : "vacant",
          organisation:
            typeof seat.organisation === "string" ? seat.organisation : null,
        });
      });
    }

    if (invalid.length) {
      return NextResponse.json(
        {
          error: `Invalid or missing: ${[...new Set(invalid)].join(", ")}`,
          code: "invalid_input",
          fields: [...new Set(invalid)],
        },
        { status: 400 },
      );
    }

    await setCouncilComposition(id, parsed, quorum as number);
  }

  if (status !== undefined) {
    if (!isCouncilStatus(status)) {
      return NextResponse.json(
        {
          error: "status must be proposed, active or dormant",
          code: "invalid_input",
          fields: ["status"],
        },
        { status: 400 },
      );
    }
    try {
      await setCouncilStatus(id, status, session.email);
    } catch (error) {
      if (error instanceof CouncilNotReadyError) {
        // 409, not 400: the request is well formed and the council is simply
        // not ready. The difference matters to whoever has to act on it.
        return NextResponse.json(
          {
            error: error.message,
            code: "council_not_ready",
            blockers: error.blockers,
          },
          { status: 409 },
        );
      }
      throw error;
    }
  }

  const council = await getCouncil(id);
  return NextResponse.json({
    council,
    blockers: council ? activationBlockers(council) : [],
  });
}
