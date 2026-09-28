import { NextResponse, type NextRequest } from "next/server";
import { getStaffSession } from "@/lib/server/auth";
import {
  APPLICATION_STATUSES,
  getApplication,
  updateApplication,
  type ApplicationStatus,
} from "@/lib/server/store";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

/** `GET /api/applications/:id` — staff only. */
export async function GET(_request: NextRequest, { params }: Params) {
  const session = await getStaffSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const application = await getApplication((await params).id);
  if (!application) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ application });
}

/**
 * `PATCH /api/applications/:id` — approve, reject, move to review, or edit
 * notes. Staff only; every change is attributed to the session and appended to
 * the application's history.
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

  const { status, notes } = (body ?? {}) as Record<string, unknown>;

  if (
    status !== undefined &&
    !APPLICATION_STATUSES.includes(status as ApplicationStatus)
  ) {
    return NextResponse.json(
      { error: `status must be one of ${APPLICATION_STATUSES.join(", ")}` },
      { status: 400 },
    );
  }
  if (notes !== undefined && notes !== null && typeof notes !== "string") {
    return NextResponse.json(
      { error: "notes must be a string or null" },
      { status: 400 },
    );
  }
  if (status === undefined && notes === undefined) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  const application = await updateApplication(
    (await params).id,
    {
      status: status as ApplicationStatus | undefined,
      notes: notes as string | null | undefined,
    },
    session.email,
  );

  if (!application) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ application });
}
