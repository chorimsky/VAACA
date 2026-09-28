import { NextResponse, type NextRequest } from "next/server";
import { ResetInvalidError, redeemPasswordReset } from "@/lib/server/members";

export const dynamic = "force-dynamic";

/**
 * `POST /api/member/password` — redeem a reset token and set a new password.
 *
 * Public by necessity: the holder of a valid single-use token is the only
 * thing that authorises it. Tokens expire after 24 hours.
 */
export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Expected JSON body" }, { status: 400 });
  }

  const { token, password } = (body ?? {}) as Record<string, unknown>;
  if (typeof token !== "string" || !token) {
    return NextResponse.json(
      { error: "A reset token is required." },
      { status: 400 },
    );
  }
  if (typeof password !== "string" || password.length < 8) {
    return NextResponse.json(
      { error: "Choose a password of at least 8 characters." },
      { status: 400 },
    );
  }

  try {
    await redeemPasswordReset(token, password);
  } catch (error) {
    if (error instanceof ResetInvalidError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    throw error;
  }

  return NextResponse.json({ ok: true });
}
