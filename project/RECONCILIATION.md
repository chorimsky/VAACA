# Where the three specifications disagree

There are now three master implementation prompts, written at different times
and from different angles:

| | Subject |
| --- | --- |
| **A** | Institutional ecosystem — chambers, councils, policy lab, observatory, graph |
| **B** | Revenue, business model and sustainability |
| **C** | Institutional architecture, governance and operating model |

They agree on the thesis and on most of the structure. Where they disagree they
do so quietly — the same body appears in two of them with a different size, a
different composition rule, or a different name — and three documents that
disagree cannot be executed against. This is the list, with what the platform
currently does and what it would take to change.

Nothing here is a criticism of the specifications. B and C were written after A
and are refinements; the problem is only that A is the one already built.

---

## 1. Settled by building it

### 1.1 Seven chambers — agreed, and now named as C names them

A §5 and C §8 describe the same seven constituencies. The platform had five of
the seven labels already matching C exactly; the other two are now aligned:

| id | was | now (C §8) |
| --- | --- | --- |
| `financial` | Financial System | Finance & Financial Services |
| `technology` | Technology & Digital Infrastructure | Technology & Innovation |
| `civil-society` | Civil Society & Public Interest | Public Interest & Civil Society |

The ids did not move, so no record changed. C §4 uses the same seven as the
General Assembly's constituencies, which means one taxonomy serves membership,
representation and governance.

### 1.2 Councils must be cross-sector — now enforced

C §9 is explicit: *"A Council should not be composed only of one Chamber."*
A §10 says nothing about composition, and the platform tied each council to a
single chamber.

**Changed.** A council seat now names the chamber it is drawn from, and a
council cannot be activated unless its seats come from **at least three**
chambers. The council's own chamber became the *convening* chamber — whose
agenda it sits on — not its composition.

Three, rather than two, because two is a sector plus a guest. The refusal is
visible before activation, alongside the existing tests: five seats minimum, a
composition no bloc can capture, a quorum its seats can meet, and enough of
them filled to reach it.

This is the fourth governance rule the software refuses to violate rather than
merely document. The others are the bloc-capture test, the perimeter gate on
scoring, and the chamber-class pairing on accession.

---

## 2. Open — these need a decision

### 2.1 Twelve councils or eight?

| A §10 | C §9 |
| --- | --- |
| 12 sector councils | 8 permanent councils |

C's eight are a consolidation of A's twelve, but not a clean one — two of A's
councils have no home in C:

| A §10 | C §9 |
| --- | --- |
| Banking & Payments + Payments & Settlement | Banking, Payments & Digital Money |
| Insurance & Risk | Insurance, Risk & Protection |
| Capital Markets & Tokenization | Capital Markets & Tokenization |
| Microfinance & Financial Inclusion | Financial Inclusion & Microfinance |
| Fintech & Infrastructure + Digital Identity & Cybersecurity | Technology, Infrastructure & Cybersecurity |
| SME & Real Economy | Enterprise, SME & Real Economy |
| Academic & Research | Academia, Research & Professional Education |
| Civil Society & Public Interest | Consumer Protection, Financial Literacy & Public Interest |
| **Professional Standards** | — |
| **Digital Assets & Virtual Asset Infrastructure** | — |

The second omission matters. Digital assets are the subject the institution
exists for; folding them into a general technology council makes the only
council about VAACA's own perimeter a sub-topic of infrastructure.

Professional Standards is the one that produces certification and audit
guidance — a named revenue engine in B §4.

**Recommendation: eight, plus those two, so ten.** C is right that twelve is
too many to stand up and that payments did not need two councils. But both
omissions are load-bearing, and all twelve currently ship as `proposed` with no
composition, so consolidating costs nothing — no council has been stood up yet.

### 2.2 A nine-seat Coordination Council or an eleven-to-fifteen Governing Council?

| Built (from A) | C §5 |
| --- | --- |
| 9 seats, named, bloc-balanced, no bloc may hold a majority | 11–15 members, chair and vice-chair, sector + country representatives, independent risk expert, IAFN seat |

These are the same body under two designs. C's is larger and adds roles the
nine does not have: a vice-chair, country representatives, an independent
governance/risk expert, and a seat for IAFN.

The nine seats are published on `/governance` and the bloc rule is enforced in
code. Moving to eleven–fifteen means amending the Founding Coalition &
Alliance Architecture, re-deriving the bloc balance, and republishing — none of
it hard, but it is a constitutional change rather than a configuration one.

**Recommendation: keep nine until the Council is actually seated, then grow to
eleven.** Nine of nine seats are currently vacant. Designing a fifteen-member
body before filling a nine-member one adds six more vacancies to report. The
roles C adds that the nine lack — vice-chair, risk expert, IAFN — are the right
additions when the body exists.

### 2.3 Where do working groups live?

C §10 introduces working groups as a distinct entity: a mandate, a scope, a
chair, members, deliverables, a timeline, a reporting line, and — the part that
matters — *"Working Groups should normally terminate when their mandate is
completed."*

Nothing like this is built, and A does not mention it. It is the right idea and
the opposite of a council: a council is permanent and must be refused if it is
not properly composed; a working group is temporary and must be **closed** when
it is done, or the institution accumulates committees.

**Recommendation: build it, with termination enforced the way activation is.**
A working group with no closing date cannot be opened; one past its date shows
as overdue until it is closed or extended by a named decision.

### 2.4 Three standing committees, or working groups?

C creates three permanent committees — Ethics & Standards (§11), Audit &
Finance (§12), Risk & Technology (§13) — and then says in §28: *"Use temporary
Working Groups rather than permanent committees wherever possible."*

Those two instructions pull against each other. The resolution is in the
subject matter rather than the preference: **ethics and audit cannot be
temporary**, because their value is that they exist before the thing they
review. Risk & Technology plausibly can be, until the intelligence platform is
carrying data for paying subscribers.

**Recommendation: Ethics and Audit permanent, Risk & Technology a working group
until the platform holds third-party data.** B §7 already flagged that research
ethics and conflict of interest cannot wait past the first sponsored programme.

### 2.5 Six directorates, or two posts?

C §14 specifies a Secretariat of six directorates. The institution has two
established posts — Secretary General and Standards & Assessment Officer — and
both are vacant. The financial model's base case reaches six staff in Year 1
and thirty-nine by Year 5.

The six directorates map onto the Year 3 staffing plan, not Year 1.
**Recommendation: adopt the six as the target structure and say so, while
staffing against the model.** Publishing six directorates with one person in
each would be the kind of thing that reads as serious and is not.

---

## 3. Where C restates what B already settled

C §22's revenue mix and 15% concentration ceiling are identical to B §39, and
the model enforces both — the mix converges on every band by Year 5 and the
largest modelled relationship is 6.0% of Year 1 revenue. C §41–48's financial
deliverables (five-year model, staffing plan, operating budget, break-even,
cash runway) are the sheets built in `model/VAACA-financial-model.xlsx`.

C §19's governance firewall is B §3 word for word: *policy participation is not
for sale.* It needs writing as a policy, not restating a third time.

---

## 4. What C adds that nothing else has, and nothing has been built for

In rough order of how soon each is needed:

| C ref | Thing | Needed by |
| --- | --- | --- |
| §11 | Ethics, Standards & Professional Conduct Committee | the first sponsored programme |
| §12 | Audit & Finance Committee | the first partner contract |
| §20 | Comparative legal analysis before incorporation | incorporation |
| §15 | IAFN cooperation framework — IP, revenue share, certification ownership | the first joint programme |
| §6 | Advisory Council | when there is something to advise on |
| §7 | Regulatory & Institutional Forum | the first regulator conversation |
| §10 | Working-group framework | the first working group |
| §16 | National Chapter playbook | the second chapter |
| §13 | Risk & Technology Committee | third-party data on the platform |

**§20 is the one with a hard dependency.** The specification says, correctly,
*"Do not assume the final legal structure"* — and everything in B's two-entity
model (association plus commercial arm) assumes one. Whether VAACA incorporates
as a Cameroonian association with a regional framework, a federation of
national associations, or a non-profit with a commercial subsidiary changes the
tax treatment of every revenue line in the financial model.

That analysis needs OHADA counsel. It is not something to generate, and the
model should carry a note saying its tax assumptions are pending it.
