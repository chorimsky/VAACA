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
import { MIN_PASSWORD_LENGTH, isValidEmail } from "@/lib/validate";
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
  countries,
}: {
  locale: Locale;
  languageLabel: string;
  t: Dictionary["auth"];
  /** Class letters and descriptions, already translated. */
  classes: { key: ClassKey; letter: string; who: string }[];
  /** The canonical country value, with the label in the reader's language. */
  countries: { value: string; label: string }[];
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
  const countryLabel =
    countries.find((c) => c.value === country)?.label ?? country;
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [agreed, setAgreed] = useState(false);

  // A mistyped password is not recoverable by the applicant: there is no
  // self-service reset, so the secretariat has to issue a link out of band.
  // Confirming it costs one field and removes that failure entirely.
  const passwordsMatch = password === confirm;
  const detailsValid =
    name.trim().length > 1 &&
    isValidEmail(email) &&
    password.length >= MIN_PASSWORD_LENGTH &&
    passwordsMatch;

  const selectedLabel =
    classes.find((c) => c.key === selectedClass)?.letter ?? "";

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  /**
   * One form across the three steps, so Enter moves to the next one and
   * submits the last. It was three `type="button"` handlers before: a keyboard
   * user could not submit from a field, and a password manager never saw a
   * submission, so it never offered to save the credentials the applicant
   * needs to sign in afterwards.
   */
  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (step === 1 && selectedClass) setStep(2);
    else if (step === 2 && detailsValid) setStep(3);
    else if (step === 3) void submit();
  };

  /**
   * The endpoint answers in English — it is an API, and it has no locale. Its
   * stable `code`, and the field names it reports, are what get translated
   * here, so an applicant on the French site never reads an English error.
   */
  const messageFor = (data: { code?: string; fields?: string[] } | null) => {
    if (data?.code === "email_taken") return t.register.emailTaken;
    if (data?.code === "invalid_input" && data.fields?.length) {
      const invalid = t.register.invalid;
      const named = data.fields
        .map((field) => invalid[field as keyof typeof invalid])
        .filter(Boolean);
      if (named.length) return named.join(" ");
    }
    return t.register.failed;
  };

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
          code?: string;
          fields?: string[];
        } | null;
        setSubmitError(messageFor(data));
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

        <form onSubmit={onSubmit}>
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
                <PrimaryButton type="submit" disabled={!selectedClass}>
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
                    required
                    minLength={MIN_PASSWORD_LENGTH}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t.register.passwordPlaceholder}
                  />
                </Field>
                <Field label={t.register.confirmPassword}>
                  <TextInput
                    type="password"
                    autoComplete="new-password"
                    required
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder={t.register.confirmPlaceholder}
                    aria-invalid={confirm.length > 0 && !passwordsMatch}
                    aria-describedby="password-mismatch"
                  />
                </Field>
                {/* Live, because the answer changes as they type, and it should
                  not wait for a submit that the button is already blocking. */}
                <p
                  id="password-mismatch"
                  role="status"
                  className="text-[12px] text-red"
                >
                  {confirm.length > 0 && !passwordsMatch
                    ? t.register.passwordsDiffer
                    : ""}
                </p>
              </div>

              <div className="mt-[30px] flex justify-between">
                <SecondaryButton type="button" onClick={() => setStep(1)}>
                  {t.register.back}
                </SecondaryButton>
                <PrimaryButton type="submit" disabled={!detailsValid}>
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
                  { label: t.register.country, value: countryLabel },
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
                  type="submit"
                  tone="teal"
                  disabled={!agreed || submitting}
                >
                  {submitting ? t.register.submitting : t.register.submit}
                </PrimaryButton>
              </div>
            </div>
          )}
        </form>

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
