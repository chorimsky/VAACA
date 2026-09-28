# VAACA — Backend Integration Notes

These pages are a static prototype (no real backend). This is a sketch for a future implementation.

## Core entities
- **Member** — id, name, email, password_hash, class (A–E), country, status (applicant/active/suspended), created_at
- **Application** — id, member_id, class, submitted_at, status (submitted/in_review/approved/rejected), reviewer_id
- **ReadinessScore** — id, member_id, domain (D1–D8), score (0–3), status (scored/capped/blocked), notes, updated_by, updated_at
- **InstructionGap** — id, code (G1–G10), description, owner, status, consequence
- **Institution** — id, name, description, posture, contact_status
- **Chapter** — id, country_code, status (founding/pending/active), fiu_name, language, local_notes
- **Document** — id, title, description, status (draft/ratified/internal), file_url, updated_at

## Auth
- Session-based or JWT; password hashing (bcrypt/argon2)
- Role field on Member drives dashboard view (maps to class A–E)
- Secretariat/Council roles are separate from membership class — need a `staff_role` field (secretary_general, standards_officer, council_member) for CAVAA Operating System access

## Key API endpoints (sketch)
- `POST /applications` — registration submission
- `PATCH /applications/:id` — approve/reject (secretariat only) — powers the Secretariat Admin queue
- `GET /applications?status=` — filtered queue (mirrors the Admin page's filter pills)
- `POST /auth/login`, `POST /auth/logout`
- `GET /members/:id/readiness` — scores across 8 domains
- `GET /gaps`, `PATCH /gaps/:id` — secretariat-only
- `GET /institutions`
- `GET /chapters/:country`
- `GET /documents`

## Permission matrix (who accesses what)
| Area | Class A–D members | Class E (institutional) | Secretariat/Council staff |
|---|---|---|---|
| Member Dashboard | own data only | own data only | n/a |
| Operating System | no access | no access | full |
| Secretariat Admin (applications) | no access | no access | full |
| Gap Register — view | no | aggregate only | full |
| Gap Register — edit | no | no | full |
| Institutional Map | public (landing page) | public | full detail |

## Security caveats in this prototype
- Login/registration use `localStorage` only — no real password hashing, no server-side session. Do not treat as secure; replace entirely before handling real member data.
- The Secretariat Admin queue and Operating System have no auth gate — anyone with the URL can view/edit. Real build needs the `staff_role` check above enforced server-side, not just hidden in the UI.

## Notes
- Search/filter on Gap Register & Institutional Map (client-side now) should move server-side once data volume grows.
- The chapter pages (Gabon, Congo, Chad, CAR, Eq. Guinea) currently use static content per country — model as rows in `Chapter`, not separate templates.
- Member Dashboard's `?role=` query param is a prototype shortcut; real implementation reads role from the authenticated session.
