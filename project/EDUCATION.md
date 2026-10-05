# VAACA-RDFECF — the education standards family

The education architecture proposes twenty frameworks and names the build
order. The first is built and published: **VAACA-RDFECF-01, the Regional
Digital Financial Literacy Framework**, live at `/competency` in both
languages.

This records what was built, the three decisions taken inside it, a naming
collision that needs resolving, and what the other nineteen need.

---

## 1. What was built

A standard, not a page about a standard. The structure is in
`lib/competency-types.ts` and the substance is in the dictionaries, which means
it is published in full, in both languages, and any provider can teach to it
without asking permission.

- **Seven levels** — Awareness, Literacy, Application, Professional practice,
  Design, Leadership, Institutional transformation — shared by every framework
  in the family, so a citizen, a student, a professional and a supervisor sit
  on one scale. Each level is named by what the learner can *do*.
- **Four stages within a level** — understand, apply, evaluate, create.
- **Six domains**, each with one competency statement, the stage it is assessed
  to, and the methods it must be assessed by.
- **A mapping table**, so a university module, a bank's induction and a village
  workshop can be compared on the same axis.
- **The evidence rule**: above the application level, no practical assessment
  means no certification.

## 2. Three decisions taken inside the framework

### 2.1 Digital assets are assessed at comprehension, not use

The architecture states the principle — *understand before participating* — and
this is what it means in the standard: the digital-assets domain is assessed to
**understand**, while digital financial services is assessed to **apply**.

A literacy framework that taught people to transact in digital assets would be
teaching participation under the name of education. This one teaches them to
recognise what they are looking at, who owes what, and where the risk sits —
including when the honest answer is that it is not for them. For a bloc where
fraudulent token offerings are a live consumer-protection problem, that is the
difference between a public good and a funnel.

### 2.2 Digital safety is assessed at *evaluate*, alone among the six

Every other domain is assessed to understand or apply. Safety is assessed to
**evaluate**, because recognising a fraudulent approach is a judgement, not a
procedure. A learner who can define phishing and still clicks the link has not
met the standard, and an assessment that cannot tell those two apart is not
measuring the thing that protects anyone.

So safety is the one domain with **no knowledge test at all** — scenario
judgement and a practical exercise only.

### 2.3 The framework states its own ceiling

It addresses levels 0 to 2 and says so on the page. Citizens are not expected
to design regional market infrastructure. Writing the ceiling into the standard
rather than leaving it implied is what stops a literacy framework being quoted
as evidence of professional competence.

## 3. A naming collision that needs resolving

The platform already publishes **"VAACA Framework 01 — PSAN Regulatory
Readiness"** on `/standards`. This architecture introduces
**VAACA-RDFECF-01**, and refers to the broader standard as **V-RDFAS**.

There are now two things called Framework 01.

The architecture resolves it in principle — two families, one for assets and
readiness, one for education and competency — but the live page does not carry
a family designation. The options:

1. **Rename the readiness framework to V-RDFAS-01.** Consistent, and makes both
   designations self-describing. It changes the name of the institution's
   flagship published standard, which is a Council decision rather than an
   editorial one.
2. **Leave it and rely on context.** Cheap, and ambiguous exactly where
   precision is the product — a standard whose own number is unclear is a poor
   advertisement for a standards body.

**Recommendation: option 1, by Council decision.** I have not made the change,
because renaming a published standard is not an implementation detail. The new
framework carries its full designation, so nothing is ambiguous on the new page
— only on the old one.

## 4. How this sits with the IAFN structure

Cleanly, and it is worth saying why.

| | |
| --- | --- |
| **VAACA** owns | the competency architecture, the standard, and recognition against it |
| **IAFN** delivers | training and assessment administration |

That is the division already decided when services moved to IAFN, and this
framework is the first test of it. The standard is published in full precisely
so that IAFN's position is *delivery*, not control: any provider can teach to
it, which is what keeps the non-exclusivity rule real rather than a sentence in
an agreement.

It also puts the evidence rule in the right place. "No practical assessment
means no certification" binds **VAACA**, which owns the credential — not only
the provider delivering against it. A standards owner that lets its own
delivery partner relax the assessment has stopped owning a standard.

## 5. What the other nineteen need

The build order in the architecture is right. What it understates is that the
frameworks are not equal in cost.

**Cheap, because 01 did the structural work** — the levels, the stages, the
assessment vocabulary and the page are now reusable:

- 02 Student Digital Finance Competency
- 06 Executive & Board
- 05 Regulatory & Supervisory Capacity

**Expensive, because they need a decision first:**

- **03 Educator & Trainer.** The cascade — master trainers, national trainers,
  institutional trainers — is an operating commitment, not a document. Who
  accredits a master trainer, and who can revoke one?
- **04 Professional Competency.** Ten tracks, each needing an industry body to
  validate it, or the credential is self-certified.
- **08 Certification & CPD.** This one is a *system*, not a framework: a
  register of who holds what, renewal dates, credit tracking, and revocation.
  It belongs in the platform, alongside membership, and should not be written
  as a document until it is clear who maintains the register.

**Blocked on something else:**

- **19 Skills Observatory.** It is the Regulatory Observatory's shape applied to
  labour-market data, which means it is cheap to build and expensive to keep
  current. The Regulatory Observatory already carries that warning: an
  observatory is a publication with a cadence, and nobody is appointed to
  maintain either one.

**A note on the benchmarks.** The architecture cites UNESCO's competency
progressions, the OECD on digital financial literacy, the IMF's 2026
supervisory programme and the CEMAC recommendations on regional financial
education. Those are the brief's citations and are treated here as inputs — the
framework's structure follows them, but nothing in this repository has verified
them, and the final standard should cite them properly once someone has.
