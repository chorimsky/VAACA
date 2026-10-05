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
| `test:e2e` (twice) | routing, both auth boundaries, the member and secretariat lifecycles, validation, tamper resistance — run against the file store **and** against Postgres, because both backings are supported |
| `test:persistence` | a write survives the process that made it: register, restart the server, sign in again |

The end-to-end steps generate their own `SESSION_SECRET` and provision their own
staff account — into a temporary directory for the file run, and from
`STAFF_SEED_*` for the Postgres run, which is how it works in production.
Postgres comes from a service container. There are no repository secrets to
configure, and nothing any of it creates exists outside the run.

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

`DATABASE_URL` is the one that matters most. Set it and the store writes to
Postgres: a write survives a redeploy, two instances see the same data, and a
read-modify-write is serialised across processes. Leave it unset and the store
falls back to JSON files — which on Vercel means `/tmp`, per-instance and
erased on every redeploy.

| variable | why |
| --- | --- |
| `DATABASE_URL` | Postgres connection string. Without it nothing written on Vercel survives. |

Sign-in survives the file fallback because the staff account re-seeds from the
environment, but nothing written through the admin area does. **Set
`DATABASE_URL` before the internal surfaces hold anything that matters** —
before the first accession request, not after.
