import { NextResponse, type NextRequest } from "next/server";
import { getStaffSession } from "@/lib/server/auth";
import {
  ScoreCapError,
  activeCaps,
  getMember,
  getScores,
  updateScore,
} from "@/lib/server/members";
import { isDomainId, isScoreStatus } from "@/lib/member-types";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

/**
 * Readiness scores for one member — staff only.
 *
 * Members read their own card through `/api/member/me`; only the Standards &
 * Assessment Officer's surface writes to it, per the permission matrix in
 * BACKEND_NOTES.md.
 */
export async function GET(_request: NextRequest, { params }: Params) {
  const session = await getStaffSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const member = await getMember((await params).id);
  if (!member) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const [scores, caps] = await Promise.all([
    getScores(member.id),
    activeCaps(),
  ]);
  return NextResponse.json({ member, scores, caps: [...caps.values()] });
}

/** `PATCH` one domain: `{ domain, score?, status?, note? }`. */
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

  const { domain, score, status, note } = (body ?? {}) as Record<
    string,
    unknown
  >;

  if (!isDomainId(domain)) {
    return NextResponse.json(
      { error: "domain must be one of D1–D8" },
      { status: 400 },
    );
  }
  if (
    score !== undefined &&
    score !== null &&
    (typeof score !== "number" ||
      score < 0 ||
      score > 3 ||
      !Number.isInteger(score))
  ) {
    return NextResponse.json(
      { error: "score must be an integer 0–3, or null" },
      { status: 400 },
    );
  }
  if (status !== undefined && !isScoreStatus(status)) {
    return NextResponse.json({ error: "invalid status" }, { status: 400 });
  }
  if (note !== undefined && note !== null && typeof note !== "string") {
    return NextResponse.json(
      { error: "note must be a string or null" },
      { status: 400 },
    );
  }

  let scores;
  try {
    scores = await updateScore(
      (await params).id,
      domain,
      {
        score: score as number | null | undefined,
        status: status as Parameters<typeof updateScore>[2]["status"],
        note: note as string | null | undefined,
      },
      session.email,
    );
  } catch (error) {
    // 409: the request is well-formed, but the Gap Register does not currently
    // allow that score.
    if (error instanceof ScoreCapError) {
      return NextResponse.json(
        { error: error.message, cap: error.cap },
        { status: 409 },
      );
    }
    throw error;
  }

  if (!scores) {
    return NextResponse.json(
      { error: "No scorecard for that member" },
      { status: 404 },
    );
  }
  const caps = await activeCaps();
  return NextResponse.json({ scores, caps: [...caps.values()] });
}
