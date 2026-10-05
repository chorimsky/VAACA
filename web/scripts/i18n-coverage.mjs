#!/usr/bin/env node
/**
 * Reports what is still English on the French pages.
 *
 *   npm run i18n:coverage
 *
 * Fetches each page in both locales and compares the rendered text. A segment
 * of prose that is byte-identical in both is almost certainly untranslated.
 * A length floor keeps single acronyms out, but it was set at 45 characters
 * and hid real misses like "Local to Gabon"; at 14 it catches short labels,
 * at the cost of listing a few proper nouns that are correct as they stand.
 *
 * This is a progress report, not a test: translating incrementally means some
 * French pages legitimately still carry English until their turn comes, and
 * this says exactly which.
 */

const BASE = process.env.BASE ?? "http://localhost:3007";
const MIN = Number(process.env.MIN_SEGMENT ?? 14);

const PAGES = [
  "/",
  "/institution",
  "/standards",
  "/ecosystem",
  "/membership",
  "/governance",
  "/region",
  "/resources",
  "/councils",
  "/observatory",
  "/observatory/g3",
  "/councils/academic-research",
  "/login",
  "/login/reset",
  "/register",
  "/admin/login",
  "/chapters/cameroon",
  "/chapters/gabon",
  "/chapters/congo",
  "/chapters/chad",
  "/chapters/car",
  "/chapters/equatorial-guinea",
];

const text = (html) =>
  html
    .replace(/<script[\s\S]*?<\/script>/g, " ")
    .replace(/<style[\s\S]*?<\/style>/g, " ")
    .replace(/<[^>]+>/g, "\n")
    .replace(/&#x27;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&nbsp;/g, " ");

const segments = (html) =>
  text(html)
    .split("\n")
    .map((s) => s.replace(/\s+/g, " ").trim())
    .filter((s) => s.length >= MIN);

const fetchText = async (path) => {
  const res = await fetch(BASE + path);
  return res.ok ? res.text() : "";
};

let totalEn = 0;
let totalShared = 0;
const report = [];

for (const page of PAGES) {
  const [en, fr] = await Promise.all([
    fetchText(page),
    fetchText(page === "/" ? "/fr" : `/fr${page}`),
  ]);
  if (!en || !fr) {
    report.push({ page, error: "could not fetch both locales" });
    continue;
  }
  const enSegments = new Set(segments(en));
  const frSegments = segments(fr);
  const shared = frSegments.filter((s) => enSegments.has(s));

  totalEn += frSegments.length;
  totalShared += shared.length;
  if (shared.length) report.push({ page, shared });
}

const translated = totalEn - totalShared;
const pct = totalEn ? Math.round((translated / totalEn) * 100) : 100;

console.log(`\nFrench coverage: ${translated}/${totalEn} segments (${pct}%)\n`);

if (!report.length) {
  console.log("  every page is fully translated");
} else {
  for (const entry of report) {
    if (entry.error) {
      console.log(`  ${entry.page}: ${entry.error}`);
      continue;
    }
    console.log(`  ${entry.page} — ${entry.shared.length} still English`);
    for (const s of entry.shared.slice(0, 3)) {
      console.log(`      ${s.slice(0, 92)}${s.length > 92 ? "…" : ""}`);
    }
    if (entry.shared.length > 3) {
      console.log(`      … and ${entry.shared.length - 3} more`);
    }
  }
}
console.log();
