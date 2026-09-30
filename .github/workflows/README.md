# Continuous integration and deployment

## What deploys, and how

The Vercel project **`cho-2860s-projects/web`** is connected to this repository
through Vercel's GitHub integration. Every push to `main` produces a Production
deployment; every pull request produces a Preview one. Nothing in this directory
triggers that — it happens on Vercel's side, and there is no deploy token or
`vercel` CLI step here to keep in sync.

The project's **Root Directory** is `web`, because the Next.js app is a
subdirectory of this repository.

## What `ci.yml` does

It runs the same checks a change should pass locally, on every push to `main`
and every pull request:

| step | what it protects |
| --- | --- |
| `tsc --noEmit` | the French dictionary is a mapped type of the English one, so a missing translation is a type error |
| `eslint --max-warnings=0` | unused imports and dead code from half-finished refactors |
| `next build` | the thing Vercel is about to do anyway, but where you can see it fail |
| `test:readonly` | every public page renders against a store it cannot write to — Vercel's filesystem |
| `test:e2e` | routing, both auth boundaries, the member and secretariat lifecycles, validation, persistence, tamper resistance |

The end-to-end step generates its own `SESSION_SECRET` and provisions its own
staff account into a temporary directory. There are no repository secrets to
configure, and nothing it creates exists outside the run.

## Gating the deploy

CI and deployment are independent: a push that fails these checks still
deploys, and you find out from a red tick rather than a broken site. Closing
that gap takes one of two changes, neither of which lives in this repository:

1. **Branch protection** (GitHub → Settings → Branches). Require the
   `Types, lint, build and tests` check on `main`. This also means changes
   reach `main` through pull requests rather than direct pushes — the checks
   have to run somewhere before the push is accepted.

2. **Ignored Build Step** (Vercel → Project Settings → Git). Vercel can run a
   command and skip the build when it exits non-zero, which can be pointed at
   the commit's check status. This keeps direct pushes to `main` working.

Option 1 is the stronger of the two, because it stops the commit rather than
the build.

## Environment variables

Production needs these set in the Vercel project, not here:

| variable | why |
| --- | --- |
| `SESSION_SECRET` | signs the staff and member session cookies; required in production, and a missing one silently invalidates every session |
| `STAFF_SEED_EMAIL` | the first secretariat account's address |
| `STAFF_SEED_PASSWORD` | read once, at seed time, and stored scrypt-hashed |
| `NEXT_PUBLIC_SITE_URL` | canonical origin for `sitemap.xml`, `robots.txt`, `hreflang` and social cards |

`VAACA_DATA_DIR` is the one to watch: unset, the store falls back to
`/tmp/vaaca-data` on Vercel, which is per-instance and lost on redeploy. Sign-in
survives that because the account re-seeds from the variables above, but
anything written through the admin area does not. Point it at a persistent
volume, or replace `src/lib/server/json-store.ts` with a database client, before
the internal surfaces hold anything that matters.
