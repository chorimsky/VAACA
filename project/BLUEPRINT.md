# VAACA System Blueprint

Translating the Master Implementation Prompt into something buildable, against
the platform that is already running at vaa-ca.org.

This is the step the master prompt names for itself at the end: *organizational
chart + platform modules + database/entities + governance workflows + UI
sitemap + implementation plan.* It is not a restatement of that document. It
answers three questions the document does not: **what already exists**, **what
the document would change about it**, and **what order to build the rest in**.

---

## 1. What is already built

The running platform implements a coherent subset of the master prompt. It is
narrower and more concrete, because it was built to do a specific job: assess
PSAN regulatory readiness and run an accession process for a founding chapter.

| Master prompt asks for | Status | Where it lives |
| --- | --- | --- |
| National chapters (§34) | **Built** — six CEMAC states, one founding, five pending | `lib/chapters.ts`, `/chapters/[slug]` |
| Membership architecture (§32) | **Partial** — five classes, not nine levels | `lib/application-types.ts`, `/membership`, `/register` |
| Governance architecture (§30) | **Partial** — one nine-seat Council with a balance rule | `lib/seat-types.ts`, `/governance`, `/operating-system` |
| Regulator relationship (§11) | **Built** — Class E is observer-only, non-voting | `/membership` |
| Professional standards (§7) | **Partial** — a readiness framework, not a certification system | `lib/member-types.ts`, `/standards` |
| Regulatory Observatory (§15) | **Seed** — ten instruction gaps, tracked and acted on | `lib/gap-types.ts`, `lib/server/gaps.ts` |
| Knowledge Commons (§19) | **Seed** — six documents, status-gated, versioned by hand | `lib/document-types.ts`, `/resources`, `/documents` |
| Institutional Directory (§13) | **Seed** — nine priority institutions, read-only | `lib/institutions.ts`, `/ecosystem` |
| Document workflow (§38) | **Partial** — four statuses, no review chain | `lib/document-types.ts` |
| Bilingual platform (§19) | **Built** — English and French, 95% coverage | `lib/i18n/` |
| Seven chambers (§5) | **Absent** | — |
| Twelve sector councils (§10) | **Absent** | — |
| Policy Lab (§16–18) | **Absent** | — |
| Expert registry (§23) | **Absent** | — |
| Collaboration engine (§22) | **Absent** | — |
| Institutional graph (§14) | **Absent** | — |
| RWA observatory (§25) | **Absent** | — |
| SME bankability (§26) | **Absent** | — |
| AI layer (§37) | **Absent** — the name is used as a label only | `/standards` |

Roughly: the **assessment and accession machinery is real**, the **network and
knowledge machinery is not yet there**.

That is a good position to be in. The hard, boring parts — signed sessions, two
audiences, a role-gated document store, an append-only decision trail, a scoring
rule that a regulator could argue with — are built and tested. What the master
prompt adds is mostly *more entities of a kind the platform already knows how to
handle*.

---

## 2. Four decisions

These are governance choices, not implementation details. All four are
**resolved and built**.

### 2.1 Does the chamber replace the class, or sit beside it? — **resolved: two axes**

The platform has five accession classes (A Operating, B Adjacent, C
Professional, D Academic, E Institutional), stated on `/membership` as coming
from Charter Part 4, stored on every member and application record, and used to
decide who gets scored against the readiness framework.

The master prompt proposes seven chambers (§5) *and* nine participation levels
(§32). These are three different taxonomies.

They reconcile cleanly if they are treated as two independent axes:

- **Chamber** — *which part of the ecosystem you belong to.* Financial System,
  Technology, Academia, Civil Society, Professional Services, Enterprise,
  Diaspora & International.
- **Participation level** — *how you take part.* The existing A–E, extended.

A university is Academia / Academic. A bank is Financial System / Corporate. An
NGO is Civil Society / — and here the model breaks: **civil society and students
have no class in the current five.** So does the registration form.

**The decision:** add chambers as a second axis and extend A–E to cover civil
society and students, or replace A–E with §32's nine levels. The first is a
Charter *amendment*; the second is a Charter *rewrite*, and it invalidates the
class recorded on every existing application.

**Decided: two axes, A–E extended to A–G.** The five classes encode something
the nine levels do not — who is inside the virtual-asset perimeter and therefore
scorable. That distinction is load-bearing for the readiness framework and was
not worth trading for a membership taxonomy.

Built: seven chambers in `lib/chambers.ts`; classes **F — Civil Society** and
**G — Student** added; `CHAMBER_CLASSES` narrows which classes a chamber may
accede under, checked on the endpoint as well as in the form. Both axes are
recorded on the application and on the member.

Charter consequence: Part 4 gains two classes and a chamber axis. The existing
five keep their letters and their voting rights, so no record in the queue is
invalidated.

### 2.2 Who is scored? — **resolved: the perimeter, not the class**

Classes A and B are assessed against the PSAN framework; C–E are not. With seven
chambers, the rule needs restating in chamber terms, or the two taxonomies will
drift apart within a release.

**Decided: scoring follows Gate 1 and nothing else.** A member is assessed if
and only if their activity falls inside the virtual-asset perimeter.

Built: `perimeter: boolean | null` on the member record, `null` meaning the
secretariat has not ruled and the class default stands. `PATCH
/api/members/:id/perimeter` records the finding, and bringing a member inside
opens their scorecard immediately.

This also closed a hole that predates the chambers: the perimeter question was
previously answered by a dropdown the applicant filled in themselves, so an
exchange that described itself as "professional" was never scored, and the
secretariat had nowhere to say otherwise.

### 2.3 What is a sector council, operationally? — **resolved: one that can be refused**

The master prompt lists twelve (§10). The platform has one Coordination Council
of nine seats, with a rule enforced in code: no single bloc may hold a majority
of the nine. That rule is the most valuable thing in the governance module — it
is a constitutional constraint that the software refuses to violate.

Twelve councils need: a membership rule, a chair, a quorum, an output type, and
a relationship to the Coordination Council. Without those they are page
furniture.

**Decided: a council is operational when it can be refused.** All twelve exist
as `proposed` with no composition — which is what §10 asks for, councils stood
up against strategic priorities rather than all at once — and activation is
guarded:

- at least five seats defined;
- a composition **no single bloc could capture**, tested on the definitions
  rather than on who happens to be appointed, so capture is impossible rather
  than merely not-yet-happened;
- a quorum of at least three that the seats can actually meet;
- enough of those seats filled to reach it.

A council that fails any of these cannot be activated, and the refusal says
which. A council that is not active publishes nothing — no composition, no
seats, no output. Standing one down is always allowed: a body that has stopped
meeting should be able to say so.

The seat compositions are deliberately **not** in the code. Twelve councils at
five seats each is sixty appointments' worth of governance, and that belongs to
the Coordination Council. What is in the code is the rule those appointments
have to satisfy.

### 2.4 Does the Regulatory Observatory replace or extend the Gap Register? — **resolved: generalise**

The Gap Register tracks ten named instruction gaps, each capping a readiness
domain until it closes. Closing a gap lifts its cap everywhere. It is small,
specific, and it *does something* — the caps are enforced server-side.

The Observatory (§15) is the general case of the same entity: a tracked
regulatory fact with a status, a source, an affected population and an
institutional response. A gap is an Observatory entry whose consequence happens
to be a scoring cap.

**Decided: generalise, do not replace.** One `ObservatoryItem` entity; the
scoring cap is one optional field on it, and the Instruction Gap Register is a
view over the Observatory filtered to `kind: "gap"`. The console, the API and
the scoring rule all kept the shape they already read, so none of them changed.

Built: the five §15 editorial fields on every entry — what changed, why it
matters, who is affected, what is still unclear, and VAACA's own response —
public pages at `/observatory` with filters by type, topic and status, and the
cap shown on the entry that imposes it.

Entry text carries both languages in the record rather than in the dictionary,
because entries are data the secretariat writes and the register is published
to a bloc where five of six states work in French.

Two things this surfaced:

- **A guessed value becomes a fact the moment it is written back.** Reading old
  rows forward filled in the fields they lacked, and the first secretariat edit
  persisted those guesses — G3 was filed under "virtual assets" rather than
  AML/CFT, with nothing in the data saying it had been guessed. The read now
  splits the two halves: an entry's *description* comes from the register and
  its *state* from the store.
- **An open set cannot soft-404.** `notFound()` from a dynamic page — and from
  its metadata — can only swap the body under a 200 once the response has
  committed, so middleware answers for unknown entry ids the way it does for
  chapters and councils. An endpoint that creates entries has to extend that
  check; the constant that holds the ids says so.

---

## 3. Entity model

Existing entities, unchanged:

```
Member            id, name, email, country, classKey, status, applicationId
Application       id, name, email, country, classKey, status, submittedAt, audit[]
ReadinessScore    memberId, domain, score, status, note, updatedBy, updatedAt
Seat              n, definition, holder, bloc, status
Document          id, title, description, status, file, generated, updatedAt
Gap               id, description, status, instrument, owner
StaffAccount      email, name, role, passwordHash
```

Added, in dependency order:

```
Chamber           id, name, description                      (fixed set of 7)
Organization      id, name, country, chamberId, type, sectors[], website,
                  profile, memberId?, status                 (§13 directory)
Relationship      fromId, toId, kind, note                   (§14 graph edges)
Council           id, name, chamberId?, status, mandate, chairSeat?, quorum
CouncilSeat       councilId, n, definition, holder, bloc
RegulatoryItem    id, country, institution, instrument, topic, date, status,
                  summary, whatChanged, whyItMatters, whoIsAffected,
                  whatIsUnclear, sources[], response, effect?   (§15, absorbs Gap)
Expert            id, name, organizationId?, country, expertise[], languages[],
                  publications[], availability, status        (§23)
PolicyIssue       id, title, problem, scope, sectors[], stakeholders[],
                  institutions[], options[], evidence[], recommendation,
                  status, councilId                           (§17)
Consultation      id, reference, issueId, councilId, opensAt, closesAt,
                  status, submissions[]                       (§18)
Submission        consultationId, organizationId, position, document, at
Publication       id, title, type, language, year, chamberId?, councilId?,
                  documentId, authors[], status               (§19)
Initiative        id, title, objective, partners[], status, timeline,
                  outputs[], councilId                        (§24)
Contribution      organizationId, kind, description, at, weight    (§33)
```

Two notes on this list:

- **`Organization` is the keystone.** The directory, the graph, the expert
  registry, consultations, initiatives and contributions all hang off it.
  Nothing else in this list should be built before it exists.
- **`Member` and `Organization` are different things.** A member is an account
  with a password; an organization is a record in a public directory. Most
  organizations in the directory will never have an account — that is the point
  of a directory. The optional `memberId` links the two where both exist.

---

## 4. Module map and build order

Ordered by dependency and by how much existing machinery each module reuses.

**Stage 1 — the spine** *(reuses: json-store, admin gating, document workflow)*

1. `Organization` + Institutional Directory (§13). Public read, staff write.
   Seeded from `lib/institutions.ts` and the chapter data already present.
2. `Chamber` as a fixed taxonomy; every organization sits in one.
3. Registration writes an `Organization` alongside the `Member`, so the
   directory grows as accession runs instead of being maintained separately.

**Stage 2 — the observatory** *(reuses: gap register, caps, admin queue)*

4. Generalise `Gap` → `RegulatoryItem`; keep the scoring cap as one effect.
5. Country / institution / topic filtering; the per-entry editorial fields from
   §15 (*what changed, why it matters, who is affected, what is unclear*).
6. Public Observatory page; staff editing in the Operating System.

**Stage 3 — the network** *(reuses: directory, document store)*

7. `Relationship` + the Institutional Graph (§14). Needs the directory to be
   populated first or it renders an empty picture.
8. `Expert` registry (§23), linked to organizations.
9. Knowledge Commons (§19) — the document store, widened: publication types,
   language, year, author, chamber.

**Stage 4 — the deliberation machinery** *(new, but modelled on the gap flow)*

10. `Council` + `CouncilSeat`, with the bloc-balance rule generalised from the
    Coordination Council.
11. `PolicyIssue` + the §16 ten-step workflow as a state machine.
12. `Consultation` + `Submission` — the Consultation Room (§18).
13. Document review chain (§38): draft → technical → sector → consultation →
    legal → executive → approved → published, with version history.

**Stage 5 — the economy layer** *(depends on everything above)*

14. `Initiative` registry (§24) and the collaboration engine (§22).
15. RWA & Tokenization Observatory (§25) — a `RegulatoryItem` sibling with an
    asset-side schema.
16. SME bankability framework (§26).
17. `Contribution` tracking (§33).

**Stage 6 — intelligence** *(last, deliberately)*

18. Dashboards over the above (§36).
19. VAACA Intelligence (§37), under the constraint §37 sets for itself: machine
    output must be visibly separated from verified fact, and nothing it produces
    may appear as an institutional position without a named human approving it.

The AI layer is last not because it is hardest but because it is worthless
before stages 1–4 exist. An assistant over an empty directory and three
documents is a demo.

---

## 5. Route sitemap

Existing routes keep their paths. French lives under `/fr/*` and is handled by
middleware, so nothing below needs a second entry.

```
/                           home
/institution                the institution              [built]
/standards                  readiness framework          [built]
/ecosystem                  → becomes chamber index      [extend]
/membership                 classes and accession        [built]
/governance                 Coordination Council         [built]
/region                     chapters index               [built]
/chapters/[slug]            chapter                      [built]
/resources                  → becomes Knowledge Commons  [extend]
/register /login            accession and sign-in        [built]
/dashboard                  member portal                [built]

/directory                  institutional directory      [new, stage 1]
/directory/[id]             organization profile         [new, stage 1]
/chambers/[id]              chamber                      [new, stage 1]
/observatory                regulatory observatory       [new, stage 2]
/observatory/[id]           regulatory item              [new, stage 2]
/graph                      institutional graph          [new, stage 3]
/experts                    expert registry              [new, stage 3]
/councils                   council index                [new, stage 4]
/councils/[id]              council                      [new, stage 4]
/policy                     policy lab                   [new, stage 4]
/policy/[id]                policy issue                 [new, stage 4]
/consultations              consultation room            [new, stage 4]
/consultations/[ref]        consultation                 [new, stage 4]
/initiatives                initiative registry          [new, stage 5]
/transparency               transparency centre          [new, §39]

/admin /operating-system /documents   staff surfaces     [built, extend]
```

---

## 6. What the roadmap in §41 implies for this codebase

§41's five phases are organisational. Mapped onto the build:

| §41 phase | Stages here | Gate before moving on |
| --- | --- | --- |
| 1 Foundation (0–3m) | 1, 2 | Directory populated with real institutions, not seed data |
| 2 Network (3–6m) | 3 | Second chapter accedes; graph is non-trivial |
| 3 Knowledge (6–12m) | 4 | First policy paper published through the review chain |
| 4 Interoperability (12–18m) | 5 | One cross-sector initiative with named partners |
| 5 Regional institution (18–24m) | 6 | A recommendation taken up by a named institution |

The gates matter more than the dates. Each is a fact about the world, not a
shipped feature — which is the right test for an institution whose §42 metrics
are institutional participation rather than software delivery.

---

## 7. Two things the master prompt does not address

**Persistence — now resolved in code, pending one environment variable.**
Everything above assumes a database. The store had two problems on the deployed
host: `/tmp` is per-instance, and it is erased on every redeploy. A directory
whose contents can vanish is worse than no directory, because an institution
that registers and disappears has been told something false about how seriously
it was taken.

The store now has two backings behind the same three functions. Set
`DATABASE_URL` and it writes to Postgres — one JSON document per key, under an
advisory lock held for the transaction, so a write survives a redeploy and two
instances agree. Leave it unset and it writes files, which is what local
development and the read-only check need. No caller changed.

What is still needed: **the connection string.** Provisioning the database is
not something that can be done from the repository. Until it is set, the
deployed site is running on the file fallback and Stage 1 cannot ship.

The Postgres backing is a document store, not a relational model, and that is
deliberate — it is the smallest change that fixes the thing actually wrong.
The signal to move to real tables is when something needs to be *queried*
rather than loaded: a directory of a few thousand institutions filtered in
memory is fine, one needing `WHERE chamber = $1 AND country = $2` across tens
of thousands of rows is not.

**Who maintains it.** The Observatory, the directory and the Knowledge Commons
are not features; they are publications with a cadence. §12 assigns IAFN the
knowledge and capacity role, and §30 an Executive Secretariat — but
`/institution` currently reports both secretariat posts as unfilled. Building a
regulatory observatory before anyone is appointed to keep it current produces a
page that is accurate on launch day and misleading three months later.

The sequencing follows: **appoint, then build.**
