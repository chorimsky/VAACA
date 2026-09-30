"use client";

import Link from "next/link";
import { useState } from "react";
import { AuthShell } from "@/components/AuthShell";
import {
  Field,
  PrimaryButton,
  SecondaryButton,
  Select,
  TextInput,
} from "@/components/Field";
import { routes } from "@/lib/routes";
import { CheckIcon } from "@/components/icons";
import { COUNTRIES, type ClassKey } from "@/lib/application-types";
import { isValidEmail } from "@/lib/validate";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { fill } from "@/lib/i18n/dictionaries";
import { localePath, type Locale } from "@/lib/i18n/locale";

/**
 * Accession request.
 *
 * Submits to `POST /api/applications`, which creates the application *and* the
 * member account behind it, so the applicant can sign in afterwards and track
 * their own status. The password is sent once over the request body and stored
 * only as a scrypt hash on the server.
 */
export function RegistrationFlow({
  locale,
  languageLabel,
  t,
  classes,
}: {
  locale: Locale;
  languageLabel: string;
  t: Dictionary["auth"];
  /** Class letters and descriptions, already translated. */
  classes: { key: ClassKey; letter: string; who: string }[];
}) {
  const path = (to: string) => localePath(locale, to);
  const STEP_LABELS = [
    t.register.steps.class,
    t.register.steps.details,
    t.register.steps.review,
  ];
  const [step, setStep] = useState(1);
  const [selectedClass, setSelectedClass] = useState<ClassKey | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [country, setCountry] = useState<string>(COUNTRIES[0]);
  const [password, setPassword] = useState("");
  const [agreed, setAgreed] = useState(false);

  const detailsValid =
    name.trim().length > 1 && isValidEmail(email) && password.length >= 8;

  const selectedLabel =
    classes.find((c) => c.key === selectedClass)?.letter ?? "";

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  /**
   * Posts to `POST /api/applications`, so a submission lands in the
   * secretariat queue and provisions the member's account in one step.
   */
  const submit = async () => {
    if (!agreed || !selectedClass || submitting) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          country,
          classKey: selectedClass,
          password,
        }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
        setSubmitError(data?.error ?? t.register.failed);
        return;
      }
      setStep(4);
    } catch {
      setSubmitError(t.login.unreachable);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      asideText={t.register.prompt}
      asideLinkLabel={t.register.link}
      asideHref={path(routes.login)}
      align="start"
      footer={t.footer}
      locale={locale}
      languageLabel={languageLabel}
    >
      <div className="w-full max-w-[640px]">
        {/* STEP INDICATOR */}
        {step < 4 && (
          <div className="mb-[30px] flex items-center gap-2">
            {STEP_LABELS.map((label, i) => {
              const n = i + 1;
              const active = n <= step;
              return (
                <div key={label} className="flex flex-1 items-center gap-2">
                  <div
                    className={`flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full text-[12px] font-bold ${
                      active
                        ? "bg-navy text-white"
                        : "border border-line bg-white text-muted"
                    }`}
                  >
                    {n}
                  </div>
                  <div
                    className={`text-[12.5px] font-semibold ${
                      active ? "text-navy" : "text-muted"
                    }`}
                  >
                    {label}
                  </div>
                  {n < 3 && <div className="h-px flex-1 bg-line" />}
                </div>
              );
            })}
          </div>
        )}

        {/* STEP 1 — CLASS */}
        {step === 1 && (
          <div className="vaaca-fade-in">
            <h1 className="mb-2 font-serif text-[26px] font-semibold text-navy">
              {t.register.chooseClass}
            </h1>
            <p className="mb-[26px] text-[14px] leading-[1.6] text-body-soft">
              {t.register.lede}
            </p>

            <fieldset className="m-0 flex flex-col gap-2.5 border-0 p-0">
              <legend className="sr-only">{t.register.classLegend}</legend>
              {classes.map((cls) => {
                const on = selectedClass === cls.key;
                return (
                  <label
                    key={cls.key}
                    className={`flex cursor-pointer items-center justify-between gap-3 rounded-xl border-2 bg-white px-[18px] py-4 transition-[border-color,transform] duration-150 hover:-translate-y-px hover:shadow-[0_6px_16px_-10px_rgba(14,42,68,.3)] ${
                      on ? "border-teal" : "border-line"
                    }`}
                  >
                    <input
                      type="radio"
                      name="member-class"
                      value={cls.key}
                      checked={on}
                      onChange={() => setSelectedClass(cls.key)}
                      className="sr-only"
                    />
                    <span>
                      <span className="block text-[14.5px] font-bold text-navy">
                        {cls.letter}
                      </span>
                      <span className="mt-1 block text-[12.5px] text-muted">
                        {cls.who}
                      </span>
                    </span>
                    <span
                      aria-hidden
                      className={`h-5 w-5 shrink-0 rounded-full border-2 ${
                        on
                          ? "border-teal-deep bg-teal-deep"
                          : "border-line bg-white"
                      }`}
                    />
                  </label>
                );
              })}
            </fieldset>

            <div className="mt-[30px] flex justify-end">
              <PrimaryButton
                type="button"
                disabled={!selectedClass}
                onClick={() => selectedClass && setStep(2)}
              >
                {t.register.continueLabel}
              </PrimaryButton>
            </div>
          </div>
        )}

        {/* STEP 2 — DETAILS */}
        {step === 2 && (
          <div className="vaaca-fade-in">
            <h1 className="mb-2 font-serif text-[26px] font-semibold text-navy">
              {t.register.tellUs}
            </h1>
            <p className="mb-[26px] text-[14px] leading-[1.6] text-body-soft">
              {t.register.applyingAs}{" "}
              <b className="text-navy">{selectedLabel}</b>.
            </p>

            <div className="flex flex-col gap-4">
              <Field label={t.register.name}>
                <TextInput
                  type="text"
                  autoComplete="organization"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t.register.namePlaceholder}
                />
              </Field>
              <Field label={t.register.email}>
                <TextInput
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                />
              </Field>
              <Field label={t.register.country}>
                <Select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                >
                  {COUNTRIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label={t.register.password}>
                <TextInput
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t.register.passwordPlaceholder}
                />
              </Field>
            </div>

            <div className="mt-[30px] flex justify-between">
              <SecondaryButton type="button" onClick={() => setStep(1)}>
                {t.register.back}
              </SecondaryButton>
              <PrimaryButton
                type="button"
                disabled={!detailsValid}
                onClick={() => detailsValid && setStep(3)}
              >
                {t.register.reviewAction}
              </PrimaryButton>
            </div>
          </div>
        )}

        {/* STEP 3 — REVIEW */}
        {step === 3 && (
          <div className="vaaca-fade-in">
            <h1 className="mb-2 font-serif text-[26px] font-semibold text-navy">
              {t.register.reviewTitle}
            </h1>
            <p className="mb-[26px] text-[14px] leading-[1.6] text-body-soft">
              {t.register.reviewLede}
            </p>

            <dl className="m-0 flex flex-col gap-3.5 rounded-[14px] border border-line bg-white px-6 py-[22px]">
              {[
                { label: t.register.steps.class, value: selectedLabel },
                { label: t.register.rowName, value: name },
                { label: t.register.email, value: email },
                { label: t.register.country, value: country },
              ].map((row, i, all) => (
                <div
                  key={row.label}
                  className={`flex justify-between gap-4 ${
                    i < all.length - 1 ? "border-b border-[#F0F0EC] pb-3" : ""
                  }`}
                >
                  <dt className="text-[12.5px] text-muted">{row.label}</dt>
                  <dd className="m-0 text-[13.5px] font-semibold text-navy">
                    {row.value}
                  </dd>
                </div>
              ))}
            </dl>

            <label className="mt-[18px] flex cursor-pointer items-start gap-2.5">
              <input
                type="checkbox"
                checked={agreed}
                onChange={() => setAgreed((v) => !v)}
                className="mt-[3px]"
              />
              <span className="text-[12.5px] leading-[1.6] text-body-soft">
                {t.register.confirmLabel}
              </span>
            </label>

            {submitError && (
              <p
                role="alert"
                className="mt-4 rounded-lg bg-tint-red px-3 py-2.5 text-[12.5px] text-red"
              >
                {submitError}
              </p>
            )}

            <div className="mt-[22px] flex justify-between">
              <SecondaryButton type="button" onClick={() => setStep(2)}>
                {t.register.back}
              </SecondaryButton>
              <PrimaryButton
                type="button"
                tone="teal"
                disabled={!agreed || submitting}
                onClick={submit}
              >
                {submitting ? t.register.submitting : t.register.submit}
              </PrimaryButton>
            </div>
          </div>
        )}

        {/* STEP 4 — CONFIRMATION */}
        {step === 4 && (
          <div className="vaaca-fade-in py-10 text-center">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-tint-green">
              <CheckIcon size="lg" className="text-green" />
            </div>
            <div className="mb-2.5 text-[22px] font-bold text-navy">
              {t.register.received}
            </div>
            <p className="mx-auto mb-[26px] max-w-[440px] text-[14px] leading-[1.65] text-body-soft">
              {fill(t.register.receivedBody, {
                class: selectedLabel,
                email,
              })}
            </p>
            <Link
              href={path(routes.login)}
              className="inline-block rounded-lg bg-navy px-6 py-3 text-[14px] font-semibold text-white no-underline"
            >
              {t.register.goToDashboard}
            </Link>
          </div>
        )}
      </div>
    </AuthShell>
  );
}
