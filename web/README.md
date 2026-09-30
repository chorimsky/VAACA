# VAACA — web

Next.js implementation of the VAACA design bundle in `../project` (exported from
Claude Design). All 21 prototype files are implemented across 18 routes.

```bash
npm run dev     # dev server on http://localhost:3007
npm run build   # production build
npm run start   # production server on http://localhost:3007
npm run lint
```

The port is pinned to **3007** rather than Next's default 3000, which collides
with other projects on this machine — Next then silently picks the next free
port, and it stops being obvious which app you are looking at.

Stack: Next.js 16 (App Router, Turbopack), React 19, TypeScript, Tailwind CSS v4.

## Routes

| Route | Source design |
| --- | --- |
| `/` | CAVAA Landing Page |
| `/institution` | VAACA Institution |
| `/standards` | VAACA Standards |
| `/ecosystem` | VAACA Ecosystem |
| `/membership` | VAACA Membership |
| `/governance` | VAACA Governance |
| `/region` | VAACA Region |
| `/resources` | VAACA Resources |
| `/chapters/[slug]` | VAACA Chapter × 6 (Cameroon, Gabon, Congo, Chad, CAR, Eq. Guinea) |
| `/login` | VAACA Login |
| `/register` | VAACA Registration |
| `/dashboard` | VAACA Member Dashboard |
| `/admin` | VAACA Secretariat Admin |
| `/operating-system` | CAVAA Operating System |
| `/documents` | CVAA Founding Document System |

`VAACA Nav` and `VAACA Footer` became shared components rather than routes.

Beyond the designs, the app adds what a real site needs and the prototype had no
file for: a branded **404**, a route **error boundary** plus a root
`global-error`, a route **loading** state, **sitemap.xml**, **robots.txt**, an
**Open Graph card** (generated at build time), the brand **favicon**, and a
**skip-to-content** link.

## Countries and chapters

All six CEMAC member states are defined once, in `src/lib/chapters.ts`, and
every country surface reads from it: the Region page, the six chapter pages,
the chapter switcher, the map highlight and the Operating System's chapters
dashboard. The country list previously existed in four places.

`src/lib/cemac-geo.ts` holds geometry only — outlines, centroids, label offsets
— keyed by the same `code`.

**Cameroon now has a chapter page.** The prototype pointed "Cameroon" at the
Operating System, which was fine while that page was public; once it became
staff-only, a public visitor clicking the founding chapter in a list of
countries landed on the staff login. It is now `/chapters/cameroon`, rendered
from the same template with `kind: "founding"` — the Federation Model reads
"what this chapter defines" rather than "what replicates from Cameroon", and
the accession steps become the sequence to ratification. The two "Operating
System ↗" links in the chapter header and footer are replaced with Membership
and Resources, since those pages are public.

The Operating System's **CEMAC Chapters** tab is now a live dashboard: all six
states with status, FIU, working language, and real application and member
counts per country, each linking to its public chapter page.

## Access model

| Surface | Who |
|---|---|
| Public site, chapters, resources | anyone |
| `/dashboard` | the signed-in member, own data only |
| `/admin`, `/operating-system`, `/documents` | secretariat & Council staff |

`/documents` is gated too: its own footer says it is "not for circulation
outside the coalition until legal review is complete", robots.txt disallows it
and the Access & Roles table classes its audience as legal review — but it used
to be publicly readable.

The public nav CTA is "Join the Association" and the footer offers a single
"Secretariat sign-in". The prototype put "Operating System ↗" in both, which
was right while that page was public and became a login wall for every visitor
once it wasn't.

## The dashboard top bar

All four signed-in surfaces — member dashboard, secretariat admin, Operating
System and document review — share `components/DashboardBar.tsx`. Each had its
own bar before, with three separate copies of the sign-out call, and document
review had neither a sign-out nor any indication of who was signed in.

One component means the same four answers everywhere: where am I, who am I,
where else can I go, how do I leave. Order is fixed — brand, then destinations,
then identity, then sign out last, so a session-ending action never sits in the
middle of navigation. The admin bar previously put Sign out *before* its one
navigation link, and linked the Operating System twice.

The Operating System keeps its sidebar rather than taking a second brand bar;
it shares `SignOutButton` only.

Notes on two decisions:

- The signed-in address truncates on narrow screens rather than hiding.
  `display:none` would take "who am I" out of the accessibility tree too, which
  matters most on the surfaces with elevated permissions.
- `staffLinks()` lives in `lib/dashboard-links.ts`, not in the bar's own module.
  The bar is `"use client"`, and a server component calling a function exported
  from a client module throws at render time — which streams an empty shell
  with a `200`, so every status-code assertion still passes. The suite now
  asserts that each signed-in surface renders a `<main>`, its heading and a
  sign-out.

## The dashboards

Three surfaces, all now driven by stored data rather than fixtures.

**Member dashboard (`/dashboard`)** — the signed-in member's own record. Every
read is keyed off `session.memberId`, so there is no parameter a member could
change to reach someone else's data; the prototype's `?role=` switcher and its
five hard-coded personas are gone. Classes A and B show a live PSAN scorecard
(8 domains × 0–3, with the T0/T1/T2 threshold computed from the total); C–E
show their accession status instead, because the framework does not assess them.

**Member accounts** — created at registration. The password the applicant
chooses is now actually used: it is scrypt-hashed server-side, and one
submission creates the application, the member account and (for A/B) a blank
scorecard. Approving or rejecting the application moves the member's own status
between `applicant`, `active` and `suspended`.

**Readiness scoring** — the Standards & Assessment Officer scores each domain
from the admin detail panel; the member sees the result on their dashboard
immediately. Domains sitting behind an open instruction gap start `capped` or
`blocked` with the gap named (G3, G5, G6), matching the framework.

**Operating System (`/operating-system`)** — the Overview tiles, Members
Register, CEMAC Chapters and Roadmap all read live counts. The **Gap Register**
is editable: status, owner and a progress note per gap, persisted and
attributed. It was a read-only constant, though BACKEND_NOTES gives the
secretariat full edit rights and the design tags it a "Living document".

**Password resets** — there is no mail transport, so self-service reset is not
possible. Staff issue a single-use token from the application detail panel and
pass the link on directly; it expires in 24 hours, and only its SHA-256 hash is
stored.

## The admin system

`/admin` is a working applications queue, not a mock.

- **Auth.** Staff sign in at `/admin/login`. Passwords are scrypt-hashed; the
  session is a signed httpOnly cookie verified in `src/middleware.ts` *before*
  the page renders, and again in every server component and route handler that
  touches applicant data. An unauthenticated request to `/admin` or
  `/operating-system` gets a 307 to the login page; the APIs return 401.
- **Provisioning.** `npm run staff:add -- you@vaaca.org 'a-long-password' [role]`
  and `npm run staff:list`. Roles: `secretary_general`, `standards_officer`,
  `council_member`.
- **Data.** `POST /api/applications` (public), `GET /api/applications` and
  `PATCH /api/applications/:id` (staff). The registration form posts to the
  first, so a real submission lands in the queue.
- **Queue.** Search, status filter, sort, a detail panel with reviewer notes,
  and an attributed history on every application — each decision records who
  made it and when.
- **Storage.** JSON files under `data/` (gitignored), behind the single
  interface in `src/lib/server/store.ts`.

> **Before deploying:** serverless filesystems are ephemeral and often
> read-only, so writes will not survive on Vercel. Point `VAACA_DATA_DIR` at a
> persistent volume, or replace `store.ts` with a database client — the rest of
> the app does not change. `SESSION_SECRET` is required in production.

## Governance — the Coordination Council

Nine founding seats, defined once in `src/lib/seat-types.ts` and given
recruitment state in `documents`-style persistence (`seats.json`). The public
Governance page and the Operating System's seats tracker read the same
register, so they can no longer describe a different Council — previously the
two kept separate seat lists, and the tracker printed "Vacant — recruiting" on
every row from a constant, so nothing could be tracked.

Seats move `vacant → candidate → filled`. A seat will not save as `filled`
without both a holder and an organisation, checked against the state the patch
would produce rather than the patch alone; returning a seat to `vacant` clears
both, so a withdrawn nomination cannot linger.

**What is published.** A filled seat publishes the body it represents. A
candidate under consideration is not announced at all, and the individual's
name is never published from here — `listPublicSeats` builds the public view by
construction rather than by omission, so a holder cannot leak through the API
or the page.

### The majority rule

The page asserts that "no single interest holds a majority", so it reports
against that claim instead of leaving the reader to take it on trust. Each seat
carries a bloc (industry, professional, independent) and the page shows the
balance.

Measuring a majority against *filled* seats declares one the moment the first
seat is taken — arithmetically true and useless. A bloc controls the Council
only by holding five of nine, so that is what `majorityHolder` tests. The seat
definitions already make it unreachable: the largest bloc is four seats wide,
which is the structural guarantee the page now states.

## Documents

The `Document` entity from BACKEND_NOTES.md, and the last one that was still a
hardcoded list. Documents are persisted in `documents.json`, listed publicly on
`/resources`, managed by the secretariat on `/documents`, and served by
`src/app/documents/[file]/route.ts`.

**Status is the access control, not a label.** `ratified`, `living` and `draft`
are public — the prototype published its working drafts and withheld only the
internal brief, so maturity and access stay separate concepts. `internal`
removes a document from the public listing *and* makes its file unreachable
without a staff session.

That only works because the files are no longer in `public/`. Anything under
`public/` is served before any application code runs, so an “Internal” document
would have stayed downloadable by anyone who knew the URL. They now live in
`documents/` (override with `VAACA_DOCUMENT_DIR`) and are read by a route
handler that checks status first. Middleware never sees these requests — its
matcher skips paths with a file extension — so that check is the only gate.

A document is either an uploaded file or generated from live data:

| | Served as | Source |
|---|---|---|
| The three founding documents | PDF | `documents/*.pdf` |
| Instruction Gap Register | CSV | generated per request from the live register |

The Gap Register used to read “maintained in the Operating System — not yet
exported”, which was a dead end. It is now exported on request from the same
rows the console edits, so a download cannot disagree with the register.

Sizes are measured from the file rather than stored, so a replaced file can
never be described by a stale number, and a row promising a file that is missing
from disk reports itself unavailable instead of offering a link that 404s.

URLs are derived from the document id (`/documents/<id>.<ext>`), never stored —
a withdrawn document cannot leave a stale public link behind, and requesting the
wrong extension is a 404 rather than a redirect.

## Configuration

Copy `.env.example` to `.env.local` and set `NEXT_PUBLIC_SITE_URL` to the real
origin. Without it, `sitemap.xml`, `robots.txt` and social-card URLs fall back to
Vercel's project URL and then to `localhost`.

| Variable | Purpose |
|---|---|
| `SESSION_SECRET` | Signs session cookies. Required in production. |
| `NEXT_PUBLIC_SITE_URL` | Canonical origin for sitemap, robots and social cards. |
| `VAACA_DATA_DIR` | Where the JSON stores live. Defaults to `./data`. |
| `VAACA_DOCUMENT_DIR` | Where document files live. Defaults to `./documents`. |
| `STAFF_SEED_EMAIL` / `STAFF_SEED_PASSWORD` | Seeds one staff account on first run. |

Both directories need to be writable and persistent — neither survives a
serverless filesystem.

## Languages

English and French. Five of the six CEMAC member states are francophone —
Gabon, Congo, the Central African Republic and Chad, with Cameroon bilingual —
so French is a primary language here, not a courtesy translation.

**English is served at the root, French under a prefix**: `/standards` and
`/fr/standards`. Every URL that existed before still resolves, and a French
page has its own shareable, indexable address.

The prefix is handled by a rewrite in middleware rather than an
`app/[locale]/` directory. The rewrite keeps `/fr/...` in the address bar while
the existing route tree serves it, and the locale travels to the server on a
request header. That avoided moving seventeen page directories, which is churn
the translation work itself did not need.

English is deliberately *not* rewritten. Attaching a request header makes every
request an internal rewrite, and a rewrite bypasses the static-params check
that lets an unknown chapter slug 404 — it renders instead, and a `notFound()`
thrown mid-render streams a 200 shell. `getLocale()` defaults to English when
the header is absent, so nothing is lost by staying out of the way.

Reading the locale in the root layout does make every route dynamic, which is
why `middleware.ts` now checks the closed set of chapter slugs itself: that is
the only way to answer `/fr/chapters/nope` with a real 404.

### The registry

`lib/i18n/dictionaries.ts` holds both locales. English is the source of truth
and `Dictionary` is a recursive mapped type over it, so **a missing, extra or
misspelled French key is a compile error**. There is no runtime fallback that
would quietly ship English text on a French page.

```bash
npm run i18n:coverage    # what is still English on the French pages
```

The coverage script fetches each page in both locales and reports prose that is
byte-identical in both — which is almost certainly untranslated. Public pages
are at 100%; the only match left is the organisation's own name, which is a
proper noun.

### Selection

A visitor arriving at the root is sent to their language: a remembered choice
first, then `Accept-Language`. Only the root redirects — someone who followed
an English deep link stays where they were sent. Visiting a `/fr` page records
the choice for next time. The switcher navigates to the same page in the other
locale rather than toggling in place, so the URL a visitor copies afterwards
reproduces what they see.

hreflang is declared per URL in `sitemap.ts`, not as a link tag in the layout:
layout metadata is static, so a tag there would claim the homepage's alternates
on every page, and a wrong signal is worse than none.

## The mark

`components/Logo.tsx` draws the VAACA mark: a pointy-top hexagon with a node at
each vertex, a V whose arms meet at a filled node, and a rule beneath it.
Geometry is measured from the artwork — circumradius 30 in a 64 viewBox, side
nodes at ±R/2, the V's arms converging at 37° from vertical.

Two deliberate departures from the artwork, both about size:

- **Stroke weights are heavier.** The artwork is 1280px wide with an 11px
  hexagon outline — a hairline that disappears entirely at the 24–36px the mark
  renders at in a header.
- **The rule is dropped below 28px**, where it lands within a pixel of the
  hexagon's lower edge and the two merge into a smudge.

The V is white in the artwork, which is drawn on the brand green. On a light
surface that would vanish, so `tone="light"` renders it in the brand green
instead; the bars pass the tone that matches the surface they are on.
`app/icon.svg` is the same mark on a green tile, minus the rule.

## Design system

Tokens live in `src/app/globals.css` under Tailwind's `@theme`. Several were
adjusted after measuring every rendered text node against WCAG AA — the
prototype's palette was built for looks, and a number of pairings came in under
4.5:1:

### The palette is the mark's

Deep green `#0B4944` and gold `#CAA228`, sampled from the artwork. The
prototype shipped navy and teal, so the token *names* are historical — `navy`
holds the brand green and the `teal` family holds the gold. They are named for
the role each plays, which has not changed; `globals.css` documents the
mapping. Renaming them is a separate mechanical pass over ~270 call sites.

Recolouring broke pairings that had been tuned against navy, all caught by the
contrast audit and fixed:

- **The on-dark greys were blue.** On green surfaces they fell to 2.5–4.4:1.
  They are now a green-neutral ramp, five steps, each clearing 4.5:1 on all
  four dark surfaces.
- **The gradient partners were too light** (`#106A63` at 6.4:1 with white),
  which pulled every grey above it. Darkened, so the ramp keeps its hierarchy
  instead of washing out to near-white.
- **Gold is not a text colour on green** — `#CAA228` reaches 4.3:1 there, which
  carries a fill but not 11px type. The accent `Eyebrow` and the chapter fact
  strip render in `teal-bright` instead.
- **The hero's second wash became green**, which is darker than the teal it
  replaced, so `muted` and `teal-ink` were nudged down to clear 4.5:1 on it.

| Token | Was | Now | Why |
|---|---|---|---|
| `muted` | `#6b7680` | `#636c75` | 4.4:1 on canvas, then 4.43:1 on the hero wash |
| `on-dark-faint` | `#5c6b75` | `#7c8d99` | 3.1:1 on navy-deep |
| `doc-muted` | `#6e8a84` | `#587169` | 3.5:1 on the doc canvas |
| `red` | `#c0392b` | `#a8322a` | 4.4:1 on its own tint |
| — | — | `teal-deep #0e7a86` | white-on-teal buttons were 2.9:1 |
| — | — | `teal-ink #0c6e79` | teal *text* was 2.9:1 |
| — | — | `gold-ink #8a5709` | gold on `tint-gold` was 3.3:1 |

Brand teal `#1aa6b3` is unchanged and still carries the identity — it reaches
5:1 on navy, so it stays for fills, borders and anything on a dark section. On
light surfaces, text uses `teal-ink` and buttons use `teal-deep`. The focus ring
uses `teal-ink` too, since the brand tone missed the 3:1 that WCAG wants of a
focus indicator.

Two things the first pass missed, both found by measuring *composited*
backgrounds rather than declared ones:

- The landing hero lays a 10% gold radial wash over the canvas, taking the
  effective surface to `rgb(243,236,224)`. `muted` measured 4.96:1 on bare
  canvas but 4.43:1 there, so it moved one step darker to `#636c75`.
- Brand teal as a *fill behind white text* is 2.94:1 — below even the 3:1
  large-text floor. It was doing that on the Operating System and Documents
  KPI cards, the registration submit button, the selected-class indicator, the
  readiness bar and two hover states. All now use `teal-deep` (5.06:1). Teal
  survives where it is decorative or carries dark text: the Console's active
  tab is `#0B3134` on teal at 4.76:1, and the accent rules carry no text.

The focus ring carries a second, canvas-coloured ring inside its offset
(`box-shadow: 0 0 0 2px var(--color-canvas)`). `teal-ink` alone is 5.7:1 on
canvas but only 2.5:1 on navy, and the header, footer and hero are navy with
links in them — so whichever ring contrasts with the surface behind it is the
one that shows.

### Icons

`src/components/icons.tsx` is the icon set: one 24×24 grid, 1.5 stroke, round
caps and joins, and `currentColor` throughout — so an icon inherits its context
and follows hover, focus and disabled states instead of being pinned to a hex.
Sizes come from `ICON_SIZE` rather than arbitrary numbers. Icons are
`aria-hidden` by default because every one sits beside its own label.

Before this there was no set: ten inline SVGs across ten files, six different
stroke widths, and no `currentColor` anywhere — which also meant the contrast
pass above, being text-only, never checked them.

The padlock **emoji** `🔒` was doing duty as a UI icon in three places. Emoji
render differently on every platform, are announced as "locked padlock" by
screen readers, and did not match the line-icon style; it is now `LockIcon`.

Decorative arrows in link text (`Learn more →`) are wrapped in
`<span aria-hidden>` so they are not announced. Arrows *inside prose* — the
document outlines on `/documents`, which convey sequence — are left readable.

The brand mark, favicon, social card and the CEMAC map keep their own colours:
they are artwork, not icons.

Also set globally: `text-wrap: balance` on headings and `pretty` on body copy
(no orphans), tabular numerals for figures and tables, grayscale font smoothing,
a brand selection colour, and a reduced-motion block that neutralises every
animation and smooth scroll.

## Membership standing

A member's `status` and their application's status are different things, and
were previously conflated: rejecting an application set the member to
`suspended`, so a rejected applicant read **"Suspended"** on their own
dashboard despite never having been admitted.

- The **application** records the accession decision — submitted, in review,
  approved, rejected.
- The **member** records standing — `applicant` until admitted, then `active`,
  and `suspended` only when staff suspend them.

`suspended` was unreachable before: `setMemberStatus` was exported and never
called, so the only route to it was a rejection. It is now reached from the
applications queue (*Suspend member* / *Reinstate member*), and an accession
decision arriving afterwards will not silently clear a suspension.

### Staff roles

`secretary_general`, `standards_officer` and `council_member` carry identical
permissions today, deliberately — BACKEND_NOTES.md's matrix has one
"Secretariat/Council staff" column reading "full" against every internal
surface. The role is read for display and drives which secretariat posts
`/institution` reports as appointed. See the note in `lib/staff-roles.ts` for
where a narrower Council right would go.

## One definition per fact

Several things were defined more than once and had begun to disagree. Each now
has a single home, and the pages read from it:

| Fact | Lives in | Read by |
|---|---|---|
| The eight domains, their tests, the three gates, the T0–T2 bands | `lib/member-types.ts` | `/standards`, the console, scoring |
| The nine Council seats | `lib/seat-types.ts` | `/governance`, the seats tracker |
| The institutional map and engagement posture | `lib/institutions.ts` | `/ecosystem`, the console |
| The six CEMAC chapters, and the countries an application may name | `lib/chapters.ts` | `/region`, the chapter pages, `application-types.ts` |
| The five accession classes | `lib/application-types.ts` | the registration form, the API, the console |
| The document library | `documents.json` | `/resources`, `/documents` |

`lib/demo-account.ts` is gone. It held a second copy of the country list and
the class metadata, and was still named for a localStorage "demo account"
removed long before — so the registration form and the endpoint validating its
submissions were maintained as separate arrays.

The drift this had already produced: the public Standards page called D7 "Tech
& Ops Resilience" while the framework members are actually scored against
called it "Technology & Ops Resilience". `/ecosystem` kept two lists that
disagreed with each other — ANIF carried an engagement posture without being
listed as a priority institution, while COBAC and BEAC were listed as
priorities with no posture.

Pages also now report against claims they make rather than asserting them:

- `/institution` read both secretariat posts as "Not yet appointed" from a
  constant, which stopped being true once a Secretary General account existed.
  It now reads which roles are filled from the provisioned accounts — the set
  of roles only, never names or addresses.
- The launch seminar is dated, so the page says whether it is still ahead
  instead of advertising it as upcoming indefinitely.
- `/region` shows real applications and member accounts per state; the console
  already did, so the two had described different regions.
- `/standards` described a 24-point scale without ever saying what a score
  meant, and linked nothing. It now shows the T0–T2 bands and links the
  published framework and the application form.

## Readiness scoring and the Gap Register

Classes A and B are scored against the PSAN framework: eight domains, 0–3 each,
24 points, thresholds T0/T1/T2.

The Gap Register is what caps that scoring, and now actually does. Each gap's
scoring consequence is declared once in `GAP_EFFECT` (`src/lib/gap-types.ts`),
taken from the gap's own `consequence` text — G3 caps D2 at 1/3, G5 makes D4
unscoreable, G6 caps D5. `activeCaps()` reads the live register, so closing a
gap in the Operating System lifts its cap everywhere, and a fresh scorecard
derives its capped and blocked domains instead of hardcoding them.

Enforcement is server-side: a score above the cap is rejected with `409` naming
the gap responsible. Before this the cap was presentational — a domain *blocked*
because no regulation exists would accept a full 3/3 while keeping the note
saying it was blocked.

## Tests

```bash
npm run test:e2e          # against http://localhost:3007
BASE=http://host npm run test:e2e
```

`scripts/e2e.mjs` drives a running server over HTTP — no mocks — so middleware,
route handlers and the store are exercised together. 288 assertions covering
routing and canonical casing, both auth boundaries in both directions, session
tamper resistance (tampered signature, forged payload, garbage cookie, and each
audience's cookie against the other's surfaces), registration validation, the
member and secretariat lifecycles, queue filters, the gap register, the document
library (access control, path traversal, conditional requests, and the
withdraw/restore lifecycle) and the single-use password-reset flow.

It writes real records, so point `VAACA_DATA_DIR` at a disposable directory. It
is re-runnable against a directory that already holds rows from a previous run.

Run it against a build, not `next dev`:

```bash
rm -rf data
STAFF_SEED_EMAIL=… STAFF_SEED_PASSWORD=… npm run staff:add -- <email> <password> secretary_general
npm run build
SESSION_SECRET="$(openssl rand -hex 32)" npm start
npm run test:e2e
```

What the suite deliberately does not cover, and was checked in a browser
instead: rendered contrast against composited backgrounds, horizontal overflow
at 375/768/1440, keyboard focus visibility, and the interactive surfaces
(registration flow, applications queue, readiness scoring, gap register, mobile
menu).

## Structure

- `src/components/` — shared UI. `Shell` (rule + nav + footer) wraps the public
  pages; `AuthShell` wraps login/register; `DocPanel` holds the surfaces used by
  the two document-palette screens.
- `src/lib/` — page content as typed data: `chapters.ts`, `dashboard-roles.ts`,
  `operating-system.ts`, plus `routes.ts` (every internal link) and
  `demo-account.ts`.
- `src/app/globals.css` — design tokens in Tailwind's `@theme`. Colours are
  named for the role they play, so a rebrand touches this file only.

Base element styles live in `@layer base`. This matters: unlayered CSS beats
every layered utility regardless of specificity, so a bare `a { color }` outside
a layer silently overrides `text-white` on link-styled buttons.

## Deviations from the prototypes

Three, all deliberate:

1. **The three empty `<image-slot>`s are now real artwork.** None of them
   shipped with images. Rather than leave placeholders, all three are drawn
   from the CEMAC member-state outlines in `src/lib/cemac-geo.ts` — projected
   from public-domain Natural Earth borders. `/region` gets a labelled map with
   a legend, each chapter hero highlights its own country within the bloc, and
   the landing hero is a branded network graphic wiring the five pending states
   back to the Cameroon founding chapter. They are diagrams, not stand-ins for
   photography; swap them for real imagery whenever that exists.
2. **Five chapter files → one dynamic route.** Per `BACKEND_NOTES.md`, chapters
   belong in a table rather than five near-identical templates; the per-country
   copy lives in `src/lib/chapters.ts`.
3. **Login/registration are walkthroughs, not auth.** See below.

The Operating System console also gained a mobile layout the prototype had no
answer for: its sidebar was a fixed 230px `height:100vh` rail, which stacked into
a full screen of navigation on a phone. Below `lg` it is now a horizontally
scrollable tab strip; at `lg` and up the rail is pixel-identical to the design.

Two prototype affordances did nothing when clicked and now respond honestly:
**“Forgot password?”** (a bare `<span>`) is a button that explains resets aren't
available pre-launch, and the dashboard's **Quick actions** link out where a real
destination exists and are disabled with a reason where none does.

The dashboard reads `?role=` on the server rather than through
`useSearchParams`. With the client-side read it rendered blank until hydration;
now it arrives complete, and an unrecognised role falls back to Class A.

## Deploying

The store is JSON files, and a serverless filesystem is read-only apart from
`/tmp`. That is not a caveat you can leave for later: seeding a store *writes*
a file, so on Vercel the first read of `documents`, `seats` or `applications`
failed with `EACCES` and every page touching one rendered nothing.

Two things follow, both now handled:

- **Reading never depends on writing.** If the store cannot be persisted,
  `readOrSeed` returns the seed anyway, so a read-only deployment renders its
  starting data. Writes are what complain — they raise
  `StoreUnavailableError` with the file that could not be written, rather than
  an opaque `EACCES` stack.
- **`DATA_DIR` defaults to `/tmp/vaaca-data` on Vercel**, which is writable, so
  the internal surfaces work. `/tmp` is per-instance and lost on redeploy or
  scale-out, so this is fine for a preview and is **not** persistence.

```bash
npm run test:readonly   # every public page must render against an unwritable store
```

That check exists because the failure returns HTTP 200: a server component that
throws mid-render streams a shell, so status codes alone report a healthy site.

### Environment

| Variable | Needed | Notes |
|---|---|---|
| `SESSION_SECRET` | **Required in production** | 32+ random chars. Sessions throw without it. |
| `VAACA_DATA_DIR` | Strongly recommended | A persistent volume. Without it, data is ephemeral. |
| `NEXT_PUBLIC_SITE_URL` | Recommended | Canonical origin for sitemap, robots and social cards. |
| `STAFF_SEED_EMAIL` / `STAFF_SEED_PASSWORD` | First run only | Seeds one staff account, or use `npm run staff:add`. |

Without a seeded staff account there is no way into `/admin`,
`/operating-system` or `/documents` — the public site works, the internal
surfaces have no one to let in.

For anything beyond a preview, replace `lib/server/json-store.ts` with a
database client. Every read and write already goes through it.

## Before this handles real data

`../project/BACKEND_NOTES.md` is the spec. Two items are load-bearing:

- **Member passwords are scrypt-hashed** and never leave `lib/server/members.ts`
  — the exported `Member` type has no credential field, so a hash cannot be
  serialised into a page or an API response by accident.
- **`/admin`, `/operating-system` and `/dashboard` are all gated** — staff and
  member sessions are separate cookies carrying a `kind` discriminator, so a
  member cookie cannot be replayed against a staff surface. Enforced in
  middleware and re-checked in every server component and route handler.
- **Role granularity.** BACKEND_NOTES' permission matrix only distinguishes
  staff from non-staff — it does not subdivide the three `staff_role` values, so
  any signed-in staff member can act on anything. The roles are recorded and
  displayed. Gap *ownership* is a data field, not an access control.
- **Self-service password reset** needs a mail transport; resets are
  secretariat-issued until there is one.
