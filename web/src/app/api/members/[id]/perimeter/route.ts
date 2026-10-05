import { NextResponse, type NextRequest } from "next/server";

import { getStaffSession } from "@/lib/server/auth";
import {
  ensureScorecard,
  getMember,
  setMemberPerimeter,
} from "@/lib/server/members";
import { isScored } from "@/lib/member-types";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

/**
 * Record Gate 1 — secretariat only.
 *
 * The framework's first question is whether an applicant's activity falls
 * inside the virtual-asset perimeter at all. That used to be answered by the
 * class the applicant picked for themselves on a public form, which meant a
 * bank describing itself as "adjacent" was scored and an exchange describing
 * itself as "professional" was not, with no way for the secretariat to say
 * otherwise.
 *
 * `{ perimeter: true | false | null }` — null returns the member to the class
 * default, for a finding that is withdrawn rather than reversed.
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

  const { perimeter } = (body ?? {}) as Record<string, unknown>;
  if (typeof perimeter !== "boolean" && perimeter !== null) {
    return NextResponse.json(
      {
        error: "perimeter must be true, false or null",
        code: "invalid_input",
        fields: ["perimeter"],
      },
      { status: 400 },
    );
  }

  const { id } = await params;
  if (!(await getMember(id))) {
    return NextResponse.json(
      { error: "Not found", code: "not_found" },
      { status: 404 },
    );
  }

  const member = await setMemberPerimeter(id, perimeter);
  if (!member) {
    return NextResponse.json(
      { error: "Not found", code: "not_found" },
      { status: 404 },
    );
  }

  // Bringing a member inside the perimeter opens their assessment there and
  // then. Leaving the scorecard to be created on the next read would mean the
  // finding was recorded but nothing followed from it.
  if (isScored(member)) await ensureScorecard(member.id, member);

  return NextResponse.json({ member });
}
