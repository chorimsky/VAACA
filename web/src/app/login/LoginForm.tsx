"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthShell } from "@/components/AuthShell";
import { Field, PrimaryButton, TextInput } from "@/components/Field";
import { routes } from "@/lib/routes";

/**
 * Member sign-in.
 *
 * Credentials go to `/api/member/session`, which checks the scrypt hash and
 * sets a signed httpOnly cookie. Nothing about the session is readable from JS
 * here, and the password never touches storage on this side.
 */
export function LoginForm({ destination }: { destination: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showReset, setShowReset] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/member/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
        setError(data?.error ?? "Sign-in failed.");
        return;
      }
      router.replace(destination);
      router.refresh();
    } catch {
      setError("Could not reach the server. Try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell
      asideText="Not a member yet?"
      asideLinkLabel="Apply"
      asideHref={routes.register}
    >
      <div className="w-full max-w-[400px]">
        <h1 className="mb-2 text-center font-serif text-[26px] font-semibold text-navy">
          Member Portal
        </h1>
        <p className="mb-7 text-center text-[13.5px] leading-[1.6] text-body-soft">
          Log in to manage your accession status and profile.
        </p>

        <form
          onSubmit={submit}
          className="rounded-[14px] border border-line bg-white p-[26px]"
        >
          <div className="flex flex-col gap-4">
            <Field label="Email">
              <TextInput
                type="email"
                autoComplete="username"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </Field>

            <Field
              label="Password"
              hint={
                <button
                  type="button"
                  onClick={() => setShowReset((v) => !v)}
                  aria-expanded={showReset}
                  className="-my-1 cursor-pointer border-none bg-transparent px-1 py-1 text-[12px] font-semibold text-teal-ink"
                >
                  Forgot password?
                </button>
              }
            >
              <TextInput
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </Field>

            {showReset && (
              <p className="rounded-lg bg-canvas-alt px-3 py-2.5 text-[12.5px] leading-[1.6] text-body-soft">
                Self-service password reset isn&apos;t available yet. Contact
                the secretariat and they will reset it for you.
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
              disabled={busy}
              className="mt-1 w-full px-0 py-[13px]"
            >
              {busy ? "Signing in…" : "Log in"}
            </PrimaryButton>
          </div>
        </form>

        <p className="mt-[18px] text-center text-[12.5px] leading-[1.6] text-muted">
          Accounts are created when you{" "}
          <Link href={routes.register} className="font-semibold">
            submit an accession request
          </Link>
          . Secretariat staff sign in{" "}
          <Link href="/admin/login" className="font-semibold">
            here
          </Link>
          .
        </p>
      </div>
    </AuthShell>
  );
}
