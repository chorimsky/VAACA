"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Logo } from "@/components/Logo";
import { Field, PrimaryButton, TextInput } from "@/components/Field";
import { TopRule } from "@/components/Shell";
import { routes } from "@/lib/routes";

/**
 * Staff sign-in. Credentials are posted to `/api/staff/session`, which sets a
 * signed httpOnly cookie — nothing about the session is readable from JS here.
 */
export function StaffLoginForm({
  provisioned,
  destination,
}: {
  provisioned: boolean;
  destination: string;
}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/staff/session", {
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
    <div className="flex min-h-screen flex-col bg-canvas text-body">
      <TopRule />

      <div className="mx-auto flex w-full max-w-[1180px] flex-wrap items-center justify-between gap-4 px-8 py-5">
        <Logo />
        <Link
          href={routes.home}
          className="text-[13.5px] font-semibold text-navy no-underline"
        >
          <span aria-hidden>←</span> Back to VAACA
        </Link>
      </div>

      <main
        id="main-content"
        className="flex flex-1 items-center justify-center px-8 pt-6 pb-16"
      >
        <div className="w-full max-w-[400px]">
          <div className="mb-2 text-center font-mono text-[11px] tracking-[0.12em] text-green uppercase">
            Internal
          </div>
          <h1 className="mb-2 text-center font-serif text-[26px] font-semibold text-navy">
            Secretariat sign-in
          </h1>
          <p className="mb-7 text-center text-[13.5px] leading-[1.6] text-body-soft">
            The applications queue and Operating System are restricted to
            secretariat and Council staff.
          </p>

          <form
            onSubmit={submit}
            className="rounded-[14px] border border-line bg-white p-[26px]"
          >
            <div className="flex flex-col gap-4">
              <Field label="Work email">
                <TextInput
                  type="email"
                  autoComplete="username"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@vaaca.org"
                />
              </Field>

              <Field label="Password">
                <TextInput
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </Field>

              {!provisioned && (
                <p
                  role="status"
                  className="rounded-lg bg-tint-gold px-3 py-2.5 text-[12.5px] leading-[1.6] text-gold-ink"
                >
                  No staff accounts exist yet. Provision one with{" "}
                  <code className="font-mono">npm run staff:add</code> before
                  signing in.
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
                disabled={busy || !provisioned}
                className="mt-1 w-full px-0 py-[13px]"
              >
                {busy ? "Signing in…" : "Sign in"}
              </PrimaryButton>
            </div>
          </form>

          <p className="mt-[18px] text-center text-[12.5px] leading-[1.6] text-muted">
            Member accounts are separate —{" "}
            <Link href={routes.login} className="font-semibold">
              member login
            </Link>
            .
          </p>
        </div>
      </main>

      <div className="px-8 py-5 text-center text-[12px] text-muted">
        VAACA · Virtual Assets Association of Central Africa · In Formation
      </div>
    </div>
  );
}
