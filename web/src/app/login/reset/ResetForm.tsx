"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthShell } from "@/components/AuthShell";
import { Field, PrimaryButton, TextInput } from "@/components/Field";
import { routes } from "@/lib/routes";
import { CheckIcon } from "@/components/icons";

/**
 * Redeems a secretariat-issued reset token. The token itself is the
 * authorisation, so this page is reachable without a session.
 */
export function ResetForm({ token }: { token: string }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (password !== confirm) {
      setError("Those passwords don't match.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/member/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
        setError(data?.error ?? "That password could not be set.");
        return;
      }
      setDone(true);
    } catch {
      setError("Could not reach the server. Try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell
      asideText="Already know your password?"
      asideLinkLabel="Log in"
      asideHref={routes.login}
    >
      <div className="w-full max-w-[400px]">
        {done ? (
          <div className="vaaca-fade-in rounded-[14px] border border-line bg-white p-8 text-center">
            <div className="mx-auto mb-[18px] flex h-[52px] w-[52px] items-center justify-center rounded-full bg-tint-green">
              <CheckIcon size="lg" className="text-green" />
            </div>
            <div className="mb-2 text-[19px] font-bold text-navy">
              Password updated
            </div>
            <p className="mb-[22px] text-[13px] leading-[1.6] text-body-soft">
              That reset link has now been used and cannot be reused.
            </p>
            <button
              type="button"
              onClick={() => router.replace(routes.login)}
              className="cursor-pointer rounded-lg border-none bg-navy px-[22px] py-[11px] text-[13.5px] font-semibold text-white"
            >
              Go to sign-in
            </button>
          </div>
        ) : (
          <>
            <h1 className="mb-2 text-center font-serif text-[26px] font-semibold text-navy">
              Set a new password
            </h1>
            <p className="mb-7 text-center text-[13.5px] leading-[1.6] text-body-soft">
              Reset links are issued by the secretariat and can be used once.
            </p>

            <form
              onSubmit={submit}
              className="rounded-[14px] border border-line bg-white p-[26px]"
            >
              <div className="flex flex-col gap-4">
                <Field label="New password">
                  <TextInput
                    type="password"
                    autoComplete="new-password"
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 8 characters"
                  />
                </Field>
                <Field label="Confirm password">
                  <TextInput
                    type="password"
                    autoComplete="new-password"
                    required
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="Repeat it"
                  />
                </Field>

                {!token && (
                  <p
                    role="status"
                    className="rounded-lg bg-tint-gold px-3 py-2.5 text-[12.5px] leading-[1.6] text-gold-ink"
                  >
                    This link is missing its reset token. Ask the secretariat to
                    issue a new one.
                  </p>
                )}

                {error && (
                  <p
                    role="alert"
                    className="rounded-lg bg-tint-red px-3 py-2.5 text-[12.5px] text-red"
                  >
                    {error}
                  </p>
                )}

                <PrimaryButton
                  type="submit"
                  disabled={busy || !token}
                  className="mt-1 w-full px-0 py-[13px]"
                >
                  {busy ? "Saving…" : "Set password"}
                </PrimaryButton>
              </div>
            </form>

            <p className="mt-[18px] text-center text-[12.5px] leading-[1.6] text-muted">
              Need a link?{" "}
              <Link href={routes.login} className="font-semibold">
                Contact the secretariat
              </Link>
              .
            </p>
          </>
        )}
      </div>
    </AuthShell>
  );
}
