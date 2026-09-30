"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthShell } from "@/components/AuthShell";
import { Field, PrimaryButton, TextInput } from "@/components/Field";
import { routes } from "@/lib/routes";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { localePath, type Locale } from "@/lib/i18n/locale";
import { CheckIcon } from "@/components/icons";

/**
 * Redeems a secretariat-issued reset token. The token itself is the
 * authorisation, so this page is reachable without a session.
 */
export function ResetForm({
  token,
  locale,
  languageLabel,
  t,
}: {
  token: string;
  locale: Locale;
  languageLabel: string;
  t: Dictionary["auth"];
}) {
  const path = (to: string) => localePath(locale, to);
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
      setError(t.login.unreachable);
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell
      asideText={t.reset.prompt}
      asideLinkLabel={t.reset.backToLogin}
      asideHref={path(routes.login)}
      footer={t.footer}
      locale={locale}
      languageLabel={languageLabel}
    >
      <div className="w-full max-w-[400px]">
        {done ? (
          <div className="vaaca-fade-in rounded-[14px] border border-line bg-white p-8 text-center">
            <div className="mx-auto mb-[18px] flex h-[52px] w-[52px] items-center justify-center rounded-full bg-tint-green">
              <CheckIcon size="lg" className="text-green" />
            </div>
            <div className="mb-2 text-[19px] font-bold text-navy">
              {t.reset.updatedTitle}
            </div>
            <p className="mb-[22px] text-[13px] leading-[1.6] text-body-soft">
              {t.reset.updatedBody}
            </p>
            <button
              type="button"
              onClick={() => router.replace(path(routes.login))}
              className="cursor-pointer rounded-lg border-none bg-navy px-[22px] py-[11px] text-[13.5px] font-semibold text-white"
            >
              {t.reset.goToSignIn}
            </button>
          </div>
        ) : (
          <>
            <h1 className="mb-2 text-center font-serif text-[26px] font-semibold text-navy">
              {t.reset.title}
            </h1>
            <p className="mb-7 text-center text-[13.5px] leading-[1.6] text-body-soft">
              {t.reset.lede}
            </p>

            <form
              onSubmit={submit}
              className="rounded-[14px] border border-line bg-white p-[26px]"
            >
              <div className="flex flex-col gap-4">
                <Field label={t.reset.newPassword}>
                  <TextInput
                    type="password"
                    autoComplete="new-password"
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t.reset.minChars}
                  />
                </Field>
                <Field label={t.reset.confirm}>
                  <TextInput
                    type="password"
                    autoComplete="new-password"
                    required
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder={t.reset.repeat}
                  />
                </Field>

                {!token && (
                  <p
                    role="status"
                    className="rounded-lg bg-tint-gold px-3 py-2.5 text-[12.5px] leading-[1.6] text-gold-ink"
                  >
                    {t.reset.missingToken}
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
                  {busy ? t.reset.saving : t.reset.submit}
                </PrimaryButton>
              </div>
            </form>

            <p className="mt-[18px] text-center text-[12.5px] leading-[1.6] text-muted">
              {t.reset.needLink}{" "}
              <Link href={path(routes.login)} className="font-semibold">
                {t.reset.contactSecretariat}
              </Link>
              .
            </p>
          </>
        )}
      </div>
    </AuthShell>
  );
}
