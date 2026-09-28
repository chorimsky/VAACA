# VAACA

**Virtual Assets Association of Central Africa** — the web application for the
Association's Cameroon founding chapter, and the CEMAC-wide mandate behind it.

A public site, a member dashboard, and three internal secretariat surfaces,
built from a Claude Design prototype bundle.

```bash
cd web
npm install
npm run dev          # http://localhost:3007
```

**[web/README.md](web/README.md) is the real documentation** — routes, the
access model, the dashboards, the document library, governance, readiness
scoring, the design system, and how to run the test suite.

## Layout

| Path | What it is |
|---|---|
| `web/` | The application — Next.js App Router, TypeScript, Tailwind |
| `project/` | The original Claude Design handoff: 21 `.dc.html` prototypes and `BACKEND_NOTES.md`, kept as the reference the implementation was built against |

## What is not in this repository

- **`web/data/`** — the JSON store holding member and staff records, scrypt
  password hashes and reset tokens. Generated at runtime; never committed.
- **The three founding documents** (`web/documents/*.pdf`,
  `project/uploads/*.pdf`) — working drafts for legal review, which the
  application withholds from anyone without a staff session. This repository is
  public, so they are excluded; see the note in `.gitignore`. The document
  library degrades gracefully without them: a row whose file is missing reports
  itself unavailable rather than offering a broken link.

## Before it handles real data

`SESSION_SECRET` is required in production, the JSON store needs a persistent
volume or a real database, and the seeded staff account must be replaced.
`web/README.md` has the full list.
