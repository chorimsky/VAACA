import { NextResponse, type NextRequest } from "next/server";
import { getStaffSession } from "@/lib/server/auth";
import {
  createApplication,
  deleteApplication,
  listApplications,
} from "@/lib/server/store";
import {
  MemberExistsError,
  createMember,
  ensureScorecard,
  findMemberByEmail,
} from "@/lib/server/members";
import {
  COUNTRIES,
  isApplicationStatus,
  isChamberId,
  isClassInChamber,
  isClassKey,
  type ChamberId,
  type ApplicationStatus,
  type ClassKey,
} from "@/lib/application-types";
import { MIN_PASSWORD_LENGTH, isValidEmail } from "@/lib/validate";

export const dynamic = "force-dynamic";

/** `GET /api/applications` — staff only. Mirrors the admin queue's filters. */
export async function GET(request: NextRequest) {
  const session = await getStaffSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const params = request.nextUrl.searchParams;
  const statusParam = params.get("status");
  const status = isApplicationStatus(statusParam)
    ? (statusParam as ApplicationStatus)
    : "all";

  const sortParam = params.get("sort");
  const sort =
    sortParam === "oldest" || sortParam === "name" ? sortParam : "newest";

  const applications = await listApplications({
    status,
    search: params.get("search") ?? "",
    sort,
  });

  return NextResponse.json({ applications });
}

/**
 * `POST /api/applications` — public accession request, per BACKEND_NOTES.md.
 *
 * Creates the application *and* the member account behind it, so the applicant
 * can sign in and track their own status. Classes A and B also get a readiness
 * scorecard, since those are the classes the framework assesses.
 */
export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Expected JSON body" }, { status: 400 });
  }

  const { name, email, country, chamberId, classKey, password } = (body ??
    {}) as Record<string, unknown>;

  // Reported as field names as well as prose: the message is English because
  // this is an API, and the field list is what the form translates so an
  // applicant on the French site does not read an English validation error.
  const invalid: string[] = [];
  if (typeof name !== "string" || name.trim().length < 2) invalid.push("name");
  if (typeof email !== "string" || !isValidEmail(email)) invalid.push("email");
  if (
    typeof country !== "string" ||
    !(COUNTRIES as readonly string[]).includes(country)
  )
    invalid.push("country");
  if (!isChamberId(chamberId)) invalid.push("chamberId");
  if (!isClassKey(classKey)) invalid.push("classKey");
  // The pairing is checked too, not just each half: a chamber and a class the
  // charter does not put together is not a valid accession request, however
  // well-formed each value is on its own.
  else if (isChamberId(chamberId) && !isClassInChamber(chamberId, classKey))
    invalid.push("classKey");
  if (typeof password !== "string" || password.length < MIN_PASSWORD_LENGTH)
    invalid.push("password");

  if (invalid.length) {
    return NextResponse.json(
      {
        error: `Invalid or missing: ${invalid.join(", ")}`,
        code: "invalid_input",
        fields: invalid,
      },
      { status: 400 },
    );
  }

  const normalisedEmail = (email as string).trim().toLowerCase();
  const duplicate =
    "An account already exists for that email. Sign in to track your application.";

  // Check first: creating the application and then failing on the member would
  // leave an orphan row in the queue with nobody attached to it.
  if (await findMemberByEmail(normalisedEmail)) {
    return NextResponse.json(
      { error: duplicate, code: "email_taken" },
      { status: 409 },
    );
  }

  const application = await createApplication({
    name: (name as string).trim(),
    email: normalisedEmail,
    country: country as string,
    chamberId: chamberId as ChamberId,
    classKey: classKey as ClassKey,
  });

  try {
    const member = await createMember({
      name: (name as string).trim(),
      email: normalisedEmail,
      country: country as string,
      chamberId: chamberId as ChamberId,
      classKey: classKey as ClassKey,
      password: password as string,
      applicationId: application.id,
    });
    await ensureScorecard(member.id, member);
  } catch (error) {
    // Roll back so a failed sign-up never leaves an unowned application.
    await deleteApplication(application.id);
    if (error instanceof MemberExistsError) {
      return NextResponse.json(
        { error: duplicate, code: "email_taken" },
        { status: 409 },
      );
    }
    throw error;
  }

  // Echo back only what the submitter already supplied.
  return NextResponse.json(
    { id: application.id, status: application.status },
    { status: 201 },
  );
}
