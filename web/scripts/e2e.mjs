#!/usr/bin/env node
/**
 * End-to-end test suite.
 *
 *   npm run test:e2e            # against http://localhost:3007
 *   BASE=http://host npm run test:e2e
 *
 * Covers routing, both auth boundaries, the full member and secretariat
 * lifecycles, validation, persistence and tamper resistance. It talks to a
 * running server over HTTP — no mocks — so it exercises middleware, route
 * handlers and the store together.
 *
 * It writes real records, so point it at a disposable data directory.
 */

const BASE = process.env.BASE ?? "http://localhost:3007";
/**
 * The staff account the suite signs in as. Provision it first with
 * `npm run staff:add`. Override both when running against an environment whose
 * seeded account differs — the defaults are a local test fixture, not a
 * credential.
 */
const STAFF = {
  email: process.env.E2E_STAFF_EMAIL ?? "secretariat@vaaca.org",
  password: process.env.E2E_STAFF_PASSWORD ?? "correct-horse-battery-staple",
};

let passed = 0;
const failures = [];
let group = "";

const section = (name) => {
  group = name;
  console.log(`\n${name}`);
};

function check(label, actual, expected) {
  const ok =
    typeof expected === "function" ? expected(actual) : actual === expected;
  if (ok) {
    passed++;
    console.log(`  ok    ${label}`);
  } else {
    failures.push(`${group} → ${label}: got ${JSON.stringify(actual)}`);
    console.log(`  FAIL  ${label}  got ${JSON.stringify(actual)}`);
  }
}

/** fetch that never follows redirects, so we can assert on them. */
async function req(path, opts = {}) {
  const res = await fetch(BASE + path, { redirect: "manual", ...opts });
  let body = null;
  const type = res.headers.get("content-type") ?? "";
  if (type.includes("json")) body = await res.json().catch(() => null);
  else body = await res.text().catch(() => null);
  return {
    status: res.status,
    location: res.headers.get("location"),
    setCookie: res.headers.get("set-cookie"),
    body,
    headers: res.headers,
  };
}

const jarOf = (setCookie) => (setCookie ?? "").split(";")[0];
const withCookie = (cookie, opts = {}) => ({
  ...opts,
  headers: { ...(opts.headers ?? {}), cookie },
});
const json = (payload, opts = {}) => ({
  method: "POST",
  ...opts,
  headers: { "Content-Type": "application/json", ...(opts.headers ?? {}) },
  body: JSON.stringify(payload),
});

const uniq = Date.now().toString(36);

async function run() {
  /* ---------------------------------------------------------------- */
  section("Public routes");
  for (const path of [
    "/",
    "/institution",
    "/standards",
    "/ecosystem",
    "/membership",
    "/governance",
    "/region",
    "/resources",
    "/login",
    "/login/reset",
    "/register",
    "/admin/login",
  ]) {
    check(path, (await req(path)).status, 200);
  }

  section("All six CEMAC chapters");
  for (const slug of [
    "cameroon",
    "gabon",
    "congo",
    "chad",
    "car",
    "equatorial-guinea",
  ]) {
    check(`/chapters/${slug}`, (await req(`/chapters/${slug}`)).status, 200);
  }
  check("unknown chapter 404s", (await req("/chapters/nope")).status, 404);
  check("unknown page 404s", (await req("/no-such-page")).status, 404);

  section("Public pages tell one story");
  const text = (html) =>
    (html ?? "")
      .replace(/<script[\s\S]*?<\/script>/g, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/\s+/g, " ");

  const standards = text((await req("/standards")).body);
  // The framework the public page describes must be the one members are
  // scored against — these lists had drifted on D7.
  for (const name of [
    "Governance",
    "AML/CFT",
    "Custody & Security",
    "Capital & Solvency",
    "Consumer Protection",
    "Market Integrity",
    "Technology & Ops Resilience",
    "Reporting & Disclosure",
  ]) {
    check(`/standards names ${name}`, standards.includes(name), true);
  }
  check(
    "no stale short form of D7",
    /Tech & Ops Resilience/.test(standards),
    false,
  );
  check(
    "all three gates",
    /Perimeter Test/.test(standards) &&
      /Requalification Test/.test(standards) &&
      /Regulator Test/.test(standards),
    true,
  );
  check(
    "explains what a score means",
    /T0 — Not ready/.test(standards) &&
      /T1 — Conditionally ready/.test(standards) &&
      /T2 — Regulator-ready/.test(standards),
    true,
  );
  check(
    "links the published framework",
    /\/documents\/psan-readiness-framework\.pdf/.test(
      (await req("/standards")).body ?? "",
    ),
    true,
  );

  const ecosystem = text((await req("/ecosystem")).body);
  // Every body named as a priority must carry an engagement posture; the page
  // used to list COBAC and BEAC as priorities with no posture, and give ANIF a
  // posture without listing it.
  for (const body of ["COSUMAF", "CNEF", "ANIF", "GABAC", "DGI"]) {
    check(`/ecosystem covers ${body}`, ecosystem.includes(body), true);
  }
  check(
    "priority strip and posture list agree",
    ["Engage first", "Engage early"].every((t) => ecosystem.includes(t)),
    true,
  );

  const institution = text((await req("/institution")).body);
  check(
    "secretariat state reflects real accounts",
    /Secretary General/.test(institution) && /Appointed/.test(institution),
    true,
  );
  check(
    "does not claim an appointed post is vacant",
    /Secretary General[\s\S]{0,80}Not yet appointed/.test(institution),
    false,
  );

  const region = text((await req("/region")).body);
  // The grid uses the chapters' own short names, so assert those rather than
  // the long forms.
  check(
    "region names all six states",
    ["Cameroon", "Gabon", "Congo", "Chad", "C.A.R.", "Eq. Guinea"].every((c) =>
      region.includes(c),
    ),
    true,
  );
  const regionHtml = (await req("/region")).body ?? "";
  check(
    "and links each to its chapter page",
    ["cameroon", "gabon", "congo", "chad", "car", "equatorial-guinea"].every(
      (slug) => regionHtml.includes(`/chapters/${slug}`),
    ),
    true,
  );

  section("Site metadata");
  check("robots.txt", (await req("/robots.txt")).status, 200);
  check("sitemap.xml", (await req("/sitemap.xml")).status, 200);
  check("favicon", (await req("/icon.svg")).status, 200);
  check("social card", (await req("/opengraph-image")).status, 200);
  const sitemap = await req("/sitemap.xml");
  check(
    "sitemap excludes internal surfaces",
    !/\/(admin|operating-system|documents|dashboard)\b/.test(sitemap.body),
    true,
  );

  section("Published documents");
  for (const id of [
    "institutional-charter",
    "psan-readiness-framework",
    "founding-coalition-architecture",
  ]) {
    const r = await req(`/documents/${id}.pdf`);
    check(id, r.status, 200);
    check(`  ${id} is a PDF`, r.headers.get("content-type"), "application/pdf");
  }
  const charter = await req("/documents/institutional-charter.pdf");
  check(
    "sends a length",
    Number(charter.headers.get("content-length")) > 100000,
    true,
  );
  check("sends an ETag", !!charter.headers.get("etag"), true);
  check(
    "honours If-None-Match",
    (
      await req("/documents/institutional-charter.pdf", {
        headers: { "If-None-Match": charter.headers.get("etag") },
      })
    ).status,
    304,
  );
  check("nosniff", charter.headers.get("x-content-type-options"), "nosniff");

  section("Gap register export");
  const csv = await req("/documents/instruction-gap-register.csv");
  check("generated on request", csv.status, 200);
  check(
    "served as CSV",
    (csv.headers.get("content-type") ?? "").startsWith("text/csv"),
    true,
  );
  check("has a header row", csv.body.includes("id"), true);
  check("carries all ten gaps", (csv.body.match(/\r\n/g) ?? []).length, 11);
  check(
    "is not cached by proxies",
    csv.headers.get("cache-control"),
    (v) => !!v && v.includes("private"),
  );

  section("Document access control");
  check(
    "internal document 404s anonymously",
    (await req("/documents/founding-declaration-brief.pdf")).status,
    404,
  );
  check(
    "a draft with no file 404s",
    (await req("/documents/cemac-federation-roadmap.pdf")).status,
    404,
  );
  check(
    "wrong extension 404s",
    (await req("/documents/institutional-charter.csv")).status,
    404,
  );
  check(
    "unknown document 404s",
    (await req("/documents/no-such-document.pdf")).status,
    404,
  );
  for (const attempt of [
    "../package.json",
    "..%2Fpackage.json",
    "%2e%2e%2fpackage.json",
  ]) {
    const r = await req(`/documents/${attempt}`);
    check(`traversal ${attempt}`, r.status, 404);
  }

  section("Document API");
  const publicDocs = await req("/api/documents");
  check("public listing", publicDocs.status, 200);
  check(
    "omits internal documents",
    publicDocs.body.documents.some((d) => d.status === "internal"),
    false,
  );
  check("lists the rest", publicDocs.body.documents.length, 5);
  check(
    "never exposes a file name",
    /vaaca-institutional-charter-v0\.1\.pdf/.test(
      JSON.stringify(publicDocs.body),
    ),
    false,
  );
  check(
    "unpublished rows carry no download",
    publicDocs.body.documents.find((d) => d.id === "cemac-federation-roadmap")
      ?.href,
    null,
  );
  check(
    "editing requires staff",
    (
      await req(
        "/api/documents/institutional-charter",
        json({ status: "internal" }, { method: "PATCH" }),
      )
    ).status,
    401,
  );

  section("Canonical casing");
  check("/INSTITUTION redirects", (await req("/INSTITUTION")).status, 308);
  check(
    "  …to lowercase",
    (await req("/INSTITUTION")).location,
    (l) => !!l && l.endsWith("/institution"),
  );
  check(
    "/chapters/GABON redirects",
    (await req("/chapters/GABON")).status,
    308,
  );
  check(
    "API paths are NOT case-rewritten",
    (await req("/api/gaps/G3", { method: "PATCH" })).status,
    (s) => s !== 308,
  );

  /* ---------------------------------------------------------------- */
  section("Access control — signed out");
  for (const [path, expected] of [
    ["/dashboard", 307],
    ["/admin", 307],
    ["/operating-system", 307],
    ["/documents", 307],
  ]) {
    check(`${path} redirects`, (await req(path)).status, expected);
  }
  check(
    "/dashboard → member login",
    (await req("/dashboard")).location,
    (l) => !!l && l.includes("/login"),
  );
  check(
    "/operating-system → staff login with next",
    (await req("/operating-system")).location,
    (l) => !!l && l.includes("/admin/login") && l.includes("next"),
  );
  for (const path of [
    "/api/applications",
    "/api/gaps",
    "/api/member/me",
    "/api/staff/session",
  ]) {
    const r = await req(path);
    check(
      `${path} unauthenticated`,
      r.status,
      path === "/api/staff/session" ? 200 : 401,
    );
  }
  const loginPage = await req("/admin/login");
  check(
    "staff login page carries no applicant data",
    /kamdemfintech/i.test(loginPage.body ?? ""),
    false,
  );
  const deniedApi = await req("/api/applications");
  check(
    "401 body carries no applications",
    "applications" in (deniedApi.body ?? {}),
    false,
  );

  /* ---------------------------------------------------------------- */
  section("Staff authentication");
  check(
    "wrong password",
    (await req("/api/staff/session", json({ ...STAFF, password: "nope" })))
      .status,
    401,
  );
  check(
    "unknown user",
    (
      await req(
        "/api/staff/session",
        json({ email: "nobody@example.com", password: "whatever" }),
      )
    ).status,
    401,
  );
  const staffLogin = await req("/api/staff/session", json(STAFF));
  check("valid credentials", staffLogin.status, 200);
  check(
    "cookie is httpOnly",
    /HttpOnly/i.test(staffLogin.setCookie ?? ""),
    true,
  );
  const staff = jarOf(staffLogin.setCookie);

  check(
    "/admin with session",
    (await req("/admin", withCookie(staff))).status,
    200,
  );
  check(
    "/operating-system with session",
    (await req("/operating-system", withCookie(staff))).status,
    200,
  );
  check(
    "/documents with session",
    (await req("/documents", withCookie(staff))).status,
    200,
  );

  section("Already-signed-in visitors");
  const atStaffLogin = await req("/admin/login", withCookie(staff));
  check("staff at /admin/login redirects", atStaffLogin.status, 307);
  check(
    "  …to /admin",
    atStaffLogin.location,
    (l) => !!l && l.endsWith("/admin"),
  );
  check(
    "honours ?next=",
    (await req("/admin/login?next=/documents", withCookie(staff))).location,
    (l) => !!l && l.endsWith("/documents"),
  );
  check(
    "ignores an off-site ?next=",
    (await req("/admin/login?next=https://evil.example.com", withCookie(staff)))
      .location,
    (l) => !!l && l.endsWith("/admin"),
  );
  check(
    "ignores a protocol-relative ?next=",
    (await req("/admin/login?next=//evil.example.com", withCookie(staff)))
      .location,
    (l) => !!l && l.endsWith("/admin"),
  );
  check(
    "a member cookie does not open the staff login gate",
    (await req("/admin/login", withCookie("vaaca_member_session=x"))).status,
    200,
  );

  section("Signed-in surfaces render");
  // A server component calling a function exported from a "use client" module
  // throws at render time and streams an empty shell with a 200, which every
  // status-code assertion happily passes. Assert on content.
  for (const [path, heading] of [
    ["/admin", "Review membership applications"],
    ["/operating-system", "Overview"],
    ["/documents", "Founding Document System"],
  ]) {
    const html = (await req(path, withCookie(staff))).body ?? "";
    check(`${path} renders a main landmark`, html.includes("<main"), true);
    check(`${path} renders its heading`, html.includes(heading), true);
    check(`${path} offers a sign-out`, /Sign out/.test(html), true);
  }
  const documentsHtml = (await req("/documents", withCookie(staff))).body ?? "";
  check(
    "/documents links the other staff surfaces",
    ["/operating-system", "/admin"].every((href) =>
      documentsHtml.includes(href),
    ),
    true,
  );
  check(
    "/documents shows who is signed in",
    documentsHtml.includes(STAFF.email),
    true,
  );

  section("Session tamper resistance");
  const [payload, sig] = staff.split("=")[1].split(".");
  const forged = Buffer.from(
    JSON.stringify({
      kind: "staff",
      email: "attacker@example.com",
      role: "secretary_general",
      exp: 9999999999,
    }),
  ).toString("base64url");
  for (const [label, cookie] of [
    // Flip the last character to something it is not. Appending a fixed
    // letter is a no-op whenever the signature already ends with it, which
    // silently turns this into an assertion that a VALID cookie is rejected —
    // and the signature changes every run, so it fails only sometimes.
    [
      "tampered signature",
      `vaaca_staff_session=${payload}.${sig.slice(0, -1)}${
        sig.endsWith("A") ? "B" : "A"
      }`,
    ],
    ["forged payload", `vaaca_staff_session=${forged}.${sig}`],
    ["garbage cookie", "vaaca_staff_session=not-a-token"],
  ]) {
    check(
      `${label} → /admin`,
      (await req("/admin", withCookie(cookie))).status,
      307,
    );
    check(
      `${label} → API`,
      (await req("/api/applications", withCookie(cookie))).status,
      401,
    );
  }

  /* ---------------------------------------------------------------- */
  section("One country list");
  // The registration form, the endpoint that validates it, and the chapter
  // pages were three separately maintained lists. They now derive from one, so
  // assert the observable consequence: every CEMAC state the API accepts has a
  // chapter, and vice versa.
  const CEMAC = [
    ["Cameroon", "cameroon"],
    ["Gabon", "gabon"],
    ["Republic of the Congo", "congo"],
    ["Chad", "chad"],
    ["Central African Republic", "car"],
    ["Equatorial Guinea", "equatorial-guinea"],
  ];
  for (const [country, slug] of CEMAC) {
    const r = await req(
      "/api/applications",
      json({
        name: `List Check ${slug}`,
        email: `list-${slug}-${uniq}@testbed.cm`,
        country,
        classKey: "C",
        password: "a-long-enough-password",
      }),
    );
    check(`API accepts "${country}"`, r.status, 201);
    check(
      `  and /chapters/${slug} exists`,
      (await req(`/chapters/${slug}`)).status,
      200,
    );
  }
  check(
    "a non-CEMAC state is still refused",
    (
      await req(
        "/api/applications",
        json({
          name: "Outside Ltd",
          email: `outside-${uniq}@testbed.cm`,
          country: "Nigeria",
          classKey: "C",
          password: "a-long-enough-password",
        }),
      )
    ).status,
    400,
  );

  section("Registration validation");
  const bad = [
    [{}, "all fields missing"],
    [
      {
        name: "X",
        email: "a@b.co",
        country: "Cameroon",
        classKey: "A",
        password: "longenough",
      },
      "name too short",
    ],
    [
      {
        name: "Valid Ltd",
        email: "not-an-email",
        country: "Cameroon",
        classKey: "A",
        password: "longenough",
      },
      "bad email",
    ],
    [
      {
        name: "Valid Ltd",
        email: "a@b.co",
        country: "France",
        classKey: "A",
        password: "longenough",
      },
      "non-CEMAC country",
    ],
    [
      {
        name: "Valid Ltd",
        email: "a@b.co",
        country: "Cameroon",
        classKey: "Z",
        password: "longenough",
      },
      "invalid class",
    ],
    [
      {
        name: "Valid Ltd",
        email: "a@b.co",
        country: "Cameroon",
        classKey: "A",
        password: "short",
      },
      "weak password",
    ],
  ];
  for (const [payload, label] of bad) {
    check(label, (await req("/api/applications", json(payload))).status, 400);
  }

  section("Member lifecycle");
  const member = {
    name: `E2E Exchange ${uniq} SARL`,
    email: `e2e-${uniq}@testbed.cm`,
    country: "Gabon",
    classKey: "A",
    password: "a-long-enough-password",
  };
  const created = await req("/api/applications", json(member));
  check("registration succeeds", created.status, 201);
  const appId = created.body?.id;
  check("returns an application id", typeof appId, "string");

  check(
    "duplicate email rejected",
    (await req("/api/applications", json({ ...member, name: "Dupe Ltd" })))
      .status,
    409,
  );

  const all = await req("/api/applications", withCookie(staff));
  check(
    "duplicate left no orphan row",
    all.body.applications.filter((a) => a.email === member.email).length,
    1,
  );

  check(
    "member wrong password",
    (
      await req(
        "/api/member/session",
        json({ email: member.email, password: "wrong" }),
      )
    ).status,
    401,
  );
  const memberLogin = await req(
    "/api/member/session",
    json({ email: member.email, password: member.password }),
  );
  check("member sign-in", memberLogin.status, 200);
  const mem = jarOf(memberLogin.setCookie);

  const me = await req("/api/member/me", withCookie(mem));
  check("own record readable", me.status, 200);
  check("correct member", me.body?.member?.email, member.email);
  check("class A gets a scorecard", me.body?.scores?.length, 8);
  check("application linked", me.body?.application?.status, "submitted");
  check(
    "no password hash in response",
    /passwordHash/.test(JSON.stringify(me.body)),
    false,
  );
  check(
    "/dashboard with member session",
    (await req("/dashboard", withCookie(mem))).status,
    200,
  );

  section("Privilege separation");
  check(
    "member cookie on /admin",
    (await req("/admin", withCookie(mem))).status,
    307,
  );
  check(
    "member cookie on staff API",
    (await req("/api/applications", withCookie(mem))).status,
    401,
  );
  check(
    "member cookie on /operating-system",
    (await req("/operating-system", withCookie(mem))).status,
    307,
  );
  check(
    "staff cookie on /dashboard",
    (await req("/dashboard", withCookie(staff))).status,
    307,
  );

  check(
    "member at /login redirects",
    (await req("/login", withCookie(mem))).status,
    307,
  );
  check(
    "  …to /dashboard",
    (await req("/login", withCookie(mem))).location,
    (l) => !!l && l.endsWith("/dashboard"),
  );
  check("signed-out /login still renders", (await req("/login")).status, 200);

  section("Member standing");
  // `memberId` is declared further down, for the scoring section; this block
  // runs earlier, so take the id from the record already fetched above.
  const standingId = me.body.member.id;
  // `suspended` was unreachable: nothing called setMemberStatus, so the only
  // way in was rejecting an application — which is a different thing, and left
  // rejected applicants reading "Suspended" on their own dashboard.
  check(
    "suspending requires staff",
    (
      await req(
        `/api/members/${standingId}/status`,
        json({ status: "suspended" }, { method: "PATCH" }),
      )
    ).status,
    401,
  );
  const standing = (status) =>
    json({ status }, { method: "PATCH", headers: { cookie: staff } });
  check(
    "invalid standing rejected",
    (await req(`/api/members/${standingId}/status`, standing("bogus"))).status,
    400,
  );
  check(
    "unknown member 404s",
    (await req("/api/members/mem_nope/status", standing("suspended"))).status,
    404,
  );
  const suspended = await req(
    `/api/members/${standingId}/status`,
    standing("suspended"),
  );
  check("staff can suspend", suspended.body?.member?.status, "suspended");
  check(
    "the member sees it",
    (await req("/api/member/me", withCookie(mem))).body?.member?.status,
    "suspended",
  );
  check(
    "a later accession decision does not silently clear it",
    await (async () => {
      await req(
        `/api/applications/${appId}`,
        json(
          { status: "approved" },
          { method: "PATCH", headers: { cookie: staff } },
        ),
      );
      return (await req("/api/member/me", withCookie(mem))).body?.member
        ?.status;
    })(),
    "suspended",
  );
  check(
    "reinstating an admitted member returns them to active",
    (await req(`/api/members/${standingId}/status`, standing("active"))).body
      ?.member?.status,
    "active",
  );

  section("Member isolation");
  const other = {
    name: `Second Member ${uniq} Ltd`,
    email: `e2e-other-${uniq}@testbed.cm`,
    country: "Chad",
    classKey: "C",
    password: "another-long-password",
  };
  await req("/api/applications", json(other));
  const otherLogin = await req(
    "/api/member/session",
    json({ email: other.email, password: other.password }),
  );
  const other2 = jarOf(otherLogin.setCookie);
  const otherMe = await req("/api/member/me", withCookie(other2));
  check("sees only itself", otherMe.body?.member?.email, other.email);
  check("class C has no scorecard", otherMe.body?.scores?.length, 0);
  check(
    "staff scores endpoint is closed to members",
    (await req(`/api/members/${me.body.member.id}/scores`, withCookie(other2)))
      .status,
    401,
  );
  check(
    "no trace of the other member in its own payload",
    new RegExp(`${me.body.member.id}|${member.email}`).test(
      JSON.stringify(otherMe.body),
    ),
    false,
  );

  /* ---------------------------------------------------------------- */
  section("Readiness scoring");
  const memberId = me.body.member.id;
  check(
    "invalid domain rejected",
    (
      await req(
        `/api/members/${memberId}/scores`,
        json(
          { domain: "D99", score: 2 },
          { method: "PATCH", headers: { cookie: staff } },
        ),
      )
    ).status,
    400,
  );
  check(
    "out-of-range score rejected",
    (
      await req(
        `/api/members/${memberId}/scores`,
        json(
          { domain: "D1", score: 9 },
          { method: "PATCH", headers: { cookie: staff } },
        ),
      )
    ).status,
    400,
  );
  const scored = await req(
    `/api/members/${memberId}/scores`,
    json(
      { domain: "D1", score: 3, status: "scored" },
      { method: "PATCH", headers: { cookie: staff } },
    ),
  );
  check("staff can score", scored.status, 200);
  const d1 = scored.body.scores.find((s) => s.domain === "D1");
  check("score recorded", d1?.score, 3);
  check("attributed to the actor", d1?.updatedBy, STAFF.email);

  const meAfter = await req("/api/member/me", withCookie(mem));
  check(
    "member sees their own new score",
    meAfter.body.scores.find((s) => s.domain === "D1")?.score,
    3,
  );

  section("Gap Register caps scoring");
  // The framework's central rule: a domain whose enabling instruction does not
  // exist cannot be scored above what the register allows.
  const reopen = (id, status) =>
    req(
      `/api/gaps/${id}`,
      json({ status }, { method: "PATCH", headers: { cookie: staff } }),
    );
  await reopen("G5", "not_started");
  await reopen("G3", "in_progress");

  const capped = await req(
    `/api/members/${memberId}/scores`,
    json(
      { domain: "D2", score: 3, status: "scored" },
      { method: "PATCH", headers: { cookie: staff } },
    ),
  );
  check("a capped domain rejects a score above its cap", capped.status, 409);
  check("and says which gap", capped.body?.cap?.gapId, "G3");
  check(
    "the cap itself is allowed",
    (
      await req(
        `/api/members/${memberId}/scores`,
        json(
          { domain: "D2", score: 1, status: "scored" },
          { method: "PATCH", headers: { cookie: staff } },
        ),
      )
    ).status,
    200,
  );
  check(
    "a blocked domain rejects any score",
    (
      await req(
        `/api/members/${memberId}/scores`,
        json(
          { domain: "D4", score: 1, status: "scored" },
          { method: "PATCH", headers: { cookie: staff } },
        ),
      )
    ).status,
    409,
  );

  await reopen("G5", "closed");
  check(
    "closing the gap lifts the cap",
    (
      await req(
        `/api/members/${memberId}/scores`,
        json(
          { domain: "D4", score: 3, status: "scored" },
          { method: "PATCH", headers: { cookie: staff } },
        ),
      )
    ).status,
    200,
  );
  const withCaps = await req(
    `/api/members/${memberId}/scores`,
    withCookie(staff),
  );
  check(
    "caps are reported, and the closed gap is gone",
    withCaps.body.caps.some((c) => c.gapId === "G5"),
    false,
  );

  /* ---------------------------------------------------------------- */
  section("Secretariat decisions");
  check(
    "invalid status rejected",
    (
      await req(
        `/api/applications/${appId}`,
        json(
          { status: "bogus" },
          { method: "PATCH", headers: { cookie: staff } },
        ),
      )
    ).status,
    400,
  );
  const reviewed = await req(
    `/api/applications/${appId}`,
    json(
      { status: "in_review", notes: "Gate 1 cleared." },
      { method: "PATCH", headers: { cookie: staff } },
    ),
  );
  check("move to in_review", reviewed.body?.application?.status, "in_review");
  const approved = await req(
    `/api/applications/${appId}`,
    json(
      { status: "approved" },
      { method: "PATCH", headers: { cookie: staff } },
    ),
  );
  check("approve", approved.body?.application?.status, "approved");
  check("reviewer recorded", approved.body?.application?.reviewer, STAFF.email);
  check(
    "history is attributed",
    approved.body?.application?.history?.length,
    (n) => n >= 3,
  );
  check(
    "approval activates the member",
    (await req("/api/member/me", withCookie(mem))).body?.member?.status,
    "active",
  );

  section("Queue filters");
  const byStatus = await req(
    "/api/applications?status=approved",
    withCookie(staff),
  );
  check(
    "status filter",
    byStatus.body.applications.every((a) => a.status === "approved"),
    true,
  );
  const bySearch = await req(
    `/api/applications?search=${encodeURIComponent(member.name)}`,
    withCookie(staff),
  );
  check("search filter", bySearch.body.applications.length, 1);
  const sorted = await req("/api/applications?sort=name", withCookie(staff));
  const names = sorted.body.applications.map((a) => a.name);
  check(
    "name sort",
    JSON.stringify(names) ===
      JSON.stringify([...names].sort((a, b) => a.localeCompare(b))),
    true,
  );

  /* ---------------------------------------------------------------- */
  section("Gap register");
  const gaps = await req("/api/gaps", withCookie(staff));
  check("ten gaps seeded", gaps.body.gaps.length, 10);
  check(
    "invalid status rejected",
    (
      await req(
        "/api/gaps/G3",
        json(
          { status: "bogus" },
          { method: "PATCH", headers: { cookie: staff } },
        ),
      )
    ).status,
    400,
  );
  check(
    "unknown gap 404s",
    (
      await req(
        "/api/gaps/G99",
        json(
          { status: "closed" },
          { method: "PATCH", headers: { cookie: staff } },
        ),
      )
    ).status,
    404,
  );
  const gapPatched = await req(
    "/api/gaps/G3",
    json(
      { status: "closed", owner: "Legal seat", note: "Guidance issued." },
      { method: "PATCH", headers: { cookie: staff } },
    ),
  );
  check("gap edit saved", gapPatched.body?.gap?.status, "closed");
  check("owner saved", gapPatched.body?.gap?.owner, "Legal seat");
  check("attributed", gapPatched.body?.gap?.updatedBy, STAFF.email);

  /* ---------------------------------------------------------------- */
  section("Document library — secretariat");
  const staffDocs = await req("/api/documents", withCookie(staff));
  check("staff see every document", staffDocs.body.documents.length, 6);
  check(
    "including the internal one",
    staffDocs.body.documents.some((d) => d.status === "internal"),
    true,
  );
  check(
    "staff may download an internal file",
    (await req("/documents/institutional-charter.pdf", withCookie(staff)))
      .status,
    200,
  );

  const docPatch = (body) =>
    json(body, { method: "PATCH", headers: { cookie: staff } });

  check(
    "invalid status rejected",
    (
      await req(
        "/api/documents/institutional-charter",
        docPatch({ status: "bogus" }),
      )
    ).status,
    400,
  );
  check(
    "empty description rejected",
    (
      await req(
        "/api/documents/institutional-charter",
        docPatch({ description: "x" }),
      )
    ).status,
    400,
  );
  check(
    "over-long description rejected",
    (
      await req(
        "/api/documents/institutional-charter",
        docPatch({ description: "x".repeat(401) }),
      )
    ).status,
    400,
  );
  check(
    "unknown document 404s",
    (await req("/api/documents/no-such-doc", docPatch({ status: "draft" })))
      .status,
    404,
  );

  const described = await req(
    "/api/documents/institutional-charter",
    docPatch({ description: "Governance, membership classes, and mandate." }),
  );
  check("description saved", described.status, 200);
  check("attributed", described.body.document.updatedBy, STAFF.email);
  check("timestamped", typeof described.body.document.updatedAt, "string");

  section("Withdrawing a document");
  const withdrawn = await req(
    "/api/documents/institutional-charter",
    docPatch({ status: "internal" }),
  );
  check("status changed", withdrawn.body.document.status, "internal");
  check(
    "file is now unreachable anonymously",
    (await req("/documents/institutional-charter.pdf")).status,
    404,
  );
  check(
    "but staff keep access",
    (await req("/documents/institutional-charter.pdf", withCookie(staff)))
      .status,
    200,
  );
  check(
    "dropped from the public listing",
    (await req("/api/documents")).body.documents.some(
      (d) => d.id === "institutional-charter",
    ),
    false,
  );
  check(
    "dropped from the public library page",
    /Founding Charter/.test((await req("/resources")).body ?? ""),
    false,
  );

  const restored = await req(
    "/api/documents/institutional-charter",
    docPatch({ status: "ratified" }),
  );
  check("restored", restored.body.document.status, "ratified");
  check(
    "download works again",
    (await req("/documents/institutional-charter.pdf")).status,
    200,
  );
  check(
    "listed again",
    /Founding Charter/.test((await req("/resources")).body ?? ""),
    true,
  );

  section("Gap register export is live");
  await req(
    "/api/gaps/G7",
    json(
      { status: "closed", note: "Export freshness probe." },
      { method: "PATCH", headers: { cookie: staff } },
    ),
  );
  const freshCsv = await req("/documents/instruction-gap-register.csv");
  check(
    "export reflects an edit made seconds earlier",
    freshCsv.body.includes("Export freshness probe."),
    true,
  );

  /* ---------------------------------------------------------------- */
  section("Coordination Council seats");
  const seatsPublic = await req("/api/seats");
  check("register is public", seatsPublic.status, 200);
  check("nine seats", seatsPublic.body.seats.length, 9);
  check(
    "no bloc can hold a majority by definition",
    seatsPublic.body.balance.every((b) => b.total * 2 <= 9),
    true,
  );
  check(
    "editing requires staff",
    (await req("/api/seats/4", json({ status: "filled" }, { method: "PATCH" })))
      .status,
    401,
  );

  const seatPatch = (body) =>
    json(body, { method: "PATCH", headers: { cookie: staff } });

  check(
    "invalid status rejected",
    (await req("/api/seats/4", seatPatch({ status: "bogus" }))).status,
    400,
  );
  check(
    "unknown seat 404s",
    (await req("/api/seats/99", seatPatch({ status: "candidate" }))).status,
    404,
  );
  check(
    "a seat cannot be filled by nobody",
    (await req("/api/seats/7", seatPatch({ status: "filled" }))).status,
    400,
  );

  const candidate = await req(
    "/api/seats/7",
    seatPatch({
      status: "candidate",
      holder: "Dr. E2E Candidate",
      organisation: "Université de Test",
      note: "Sourced for the suite.",
    }),
  );
  check("candidate recorded", candidate.body.seat.status, "candidate");
  check("attributed", candidate.body.seat.updatedBy, STAFF.email);

  section("Seat privacy");
  const whileCandidate = await req("/api/seats");
  const seat7 = whileCandidate.body.seats.find((s) => s.n === 7);
  check("a candidate is not announced", seat7.status, "candidate");
  check("and carries no organisation publicly", seat7.organisation, null);
  check(
    "no holder name anywhere in the public register",
    /E2E Candidate/.test(JSON.stringify(whileCandidate.body)),
    false,
  );
  check(
    "nor on the public page",
    /E2E Candidate/.test((await req("/governance")).body ?? ""),
    false,
  );

  const filledSeat = await req("/api/seats/7", seatPatch({ status: "filled" }));
  check("promoting to filled works", filledSeat.body.seat.status, "filled");
  const whenFilled = await req("/api/seats");
  const filled7 = whenFilled.body.seats.find((s) => s.n === 7);
  check(
    "a filled seat publishes its organisation",
    filled7.organisation,
    "Université de Test",
  );
  check(
    "but still not the person",
    /E2E Candidate/.test(JSON.stringify(whenFilled.body)),
    false,
  );
  check(
    "the page shows the organisation",
    /Universit./.test((await req("/governance")).body ?? ""),
    true,
  );

  check(
    "returning a seat to vacant clears the holder",
    (await req("/api/seats/7", seatPatch({ status: "vacant" }))).body.seat
      .holder,
    null,
  );

  /* ---------------------------------------------------------------- */
  section("Password reset");
  check(
    "issuing requires staff",
    (await req(`/api/members/${memberId}/reset`, { method: "POST" })).status,
    401,
  );
  const issued = await req(`/api/members/${memberId}/reset`, {
    method: "POST",
    headers: { cookie: staff },
  });
  check("staff can issue", issued.status, 200);
  const token = issued.body?.token;
  check("token returned once", typeof token, "string");

  check(
    "weak new password rejected",
    (await req("/api/member/password", json({ token, password: "short" })))
      .status,
    400,
  );
  check(
    "bogus token rejected",
    (
      await req(
        "/api/member/password",
        json({ token: "not-real", password: "brand-new-password-99" }),
      )
    ).status,
    400,
  );
  check(
    "redeem succeeds",
    (
      await req(
        "/api/member/password",
        json({ token, password: "brand-new-password-99" }),
      )
    ).status,
    200,
  );
  check(
    "token is single use",
    (
      await req(
        "/api/member/password",
        json({ token, password: "yet-another-password" }),
      )
    ).status,
    400,
  );
  check(
    "old password no longer works",
    (
      await req(
        "/api/member/session",
        json({ email: member.email, password: member.password }),
      )
    ).status,
    401,
  );
  check(
    "new password works",
    (
      await req(
        "/api/member/session",
        json({ email: member.email, password: "brand-new-password-99" }),
      )
    ).status,
    200,
  );

  /* ---------------------------------------------------------------- */
  section("Sign out");
  const out = await req("/api/staff/session", {
    method: "DELETE",
    headers: { cookie: staff },
  });
  check("staff sign-out", out.status, 200);
  const cleared = jarOf(out.setCookie);
  check(
    "cleared cookie cannot reach /admin",
    (await req("/admin", withCookie(cleared))).status,
    307,
  );
}

await run();

console.log(
  `\n${"─".repeat(56)}\n${passed} passed, ${failures.length} failed\n`,
);
if (failures.length) {
  for (const f of failures) console.log(`  ✗ ${f}`);
  process.exit(1);
}
