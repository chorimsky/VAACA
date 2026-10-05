# VAACA Business Model — specification notes and what the model says

The Revenue, Business Model & Institutional Sustainability prompt is the
business-model master specification. This records the decisions taken in
turning it into numbers, the things it does not settle, and what the model says
once the numbers are in.

The model itself is [`model/VAACA-financial-model.xlsx`](model/VAACA-financial-model.xlsx)
— twelve sheets, driver-based, with a scenario switch. Every figure is a unit
count times a price, or a cost driver. Nothing in it is typed in as a result.

---

## 1. What the model says

Base case, all figures XAF:

| | Year 1 | Year 2 | Year 3 | Year 4 | Year 5 |
| --- | ---: | ---: | ---: | ---: | ---: |
| Revenue | 249m | 532m | 1,059m | 1,818m | 2,642m |
| Specification target | 250m | 550m | 1,000m | 1,750m | 2,750m |
| Operating surplus | (31m) | 41m | 261m | 622m | 1,056m |
| Operating margin | (12.5%) | 7.7% | 24.6% | 34.2% | 40.0% |
| Recurring share | 20% | 30% | 34% | 36% | 39% |
| Headcount | 6 | 11 | 19 | 28 | 39 |

Every year lands within 6% of the specification's planning targets, and the
Year 5 mix matches §39 — membership 22%, education and certification 18%,
research and intelligence 18%, events 13%, advisory 13%, partnerships 8%, data
and platform 8%.

That agreement is not evidence the targets are achievable. It means the counts
were tuned until the model reproduced them, which is what a planning model is
for: it converts a target into the number of members, delegates and
engagements that would have to exist for the target to be met. **Those counts
are the real output.** Year 1 asks for 247 paying members, six strategic
partners, a 250-delegate forum, 50 training seats and four advisory
engagements — against an institution that today has no members and no staff.

## 2. The number that matters most

**Lowest cumulative cash: −63m XAF, in month 13.** The institution does not
turn cash-positive until month 27.

That is the working capital that has to be in place before any of this starts,
and nothing in the specification provides it. Membership and sponsorship are
collected late in the year; salaries are paid from month one.

The scenarios make the point sharper:

| Scenario | Year 5 revenue | Lowest cash |
| --- | ---: | ---: |
| Conservative | 1,495m | **(225m)** |
| Base | 2,642m | (63m) |
| Aggressive | 4,019m | (47m) |

**The downside case needs nearly four times the funding of the base case.**
Costs are largely fixed — eleven of the twelve cost lines do not fall with
revenue — so a slow year does not cost less, it just lasts longer. Any funding
conversation should be sized against the conservative column, not the base one.

## 3. Decisions taken in building it

**Prices are the mid-points of the specification's bands**, except where the
band is very wide (§8 partnerships at 500,000–100M, §23 transformation at
50M–250M+), where the lower part is used. Each price on the Pricing sheet
names the paragraph it came from. Two prices are not in the specification at
all and are marked as such: the forum delegate fee and the database
subscription.

**Scoring and membership follow the institutional model already built.** The
chambers, the seven accession classes and the Gate 1 perimeter test are in the
platform; the revenue model's six membership tiers in §6 are a *pricing*
ladder, not a second taxonomy. An organisation sits in one chamber, accedes in
one class, and pays at the tier matching its size.

**The surplus is spent.** A 40% operating margin is not a target for an
institution of this kind — left unspent it would say the public-interest half
of the mandate is being under-funded. The P&L carries a reinvestment line
(§38, §81): 40% of surplus from Year 2, rising to 60%, into subsidised
civil-society and student membership, scholarships, literacy and
consumer-protection programmes, and the research nobody will sponsor. After
reinvestment the retained result is 25m / 117m / 249m / 423m across Years 2–5.

**Concentration stays inside the §39 ceiling.** The largest single relationship
modelled is one founding partner at 15m, which is 6.0% of Year 1 revenue and
falls from there. The ceiling binds whoever signs the contract, not the
spreadsheet — but a year that would breach it is visible here first.

## 4. What the specification does not settle, and the model therefore assumes

| Open question | Assumption used | Where |
| --- | --- | --- |
| Working capital — who funds the first 27 months? | Opening cash of zero | Assumptions!C33 |
| Collection terms | One month between invoice and receipt | Assumptions!C34 |
| Salary scale | Yaoundé planning figures, 22% employer charges | Staffing |
| Delivery cost of events | 52% of event revenue, falling to 42% | Assumptions |
| Renewal rates | 78% membership, 82% intelligence, 25% open-enrolment | Unit Economics |
| Acquisition cost | 120,000 per member; 2.5m per strategic partner | Unit Economics |

All six are blue cells. None of them is researched — they are placeholders
chosen to be defensible, and the first real quotes should replace them.

## 5. What this depends on that does not exist

Four of the ten engines are zero in Year 1, and not because of a slow start.

| Engine | Year 1 | Why |
| --- | ---: | --- |
| Intelligence | 0 | Needs the Observatory with dashboards, alerts and saved searches |
| Data products | 0 | Needs the Institutional Directory and the graph |
| Platform services | 0 | Needs premium and enterprise tiers, and therefore accounts and billing |
| Certification | 0 | Needs an examination and credential system |

By Year 5 those four carry **582m XAF, 22% of revenue**, and three of them are
the highest-scoring products in the §44 prioritisation: intelligence ranks
first, data third, platform seventh of ten on the composite — ahead of events
and advisory, which rank last.

So the commercial model's best products are the ones the platform cannot yet
deliver. Two consequences worth stating plainly:

1. **The directory and the intelligence subscription are the same build.** §26
   lists them as platform modules; §17 and §25 sell them. They are blocked on
   the same thing — a database. The store is JSON files in `/tmp` on the
   deployed host, erased on every redeploy. **A paid subscription cannot be
   taken against a store that forgets.**
2. **Year 1 revenue has to come from the engines that need no platform** —
   membership, partnerships, education, events, research, advisory. That is
   exactly how the model is built, and it is also §40's Stage 1. The sequencing
   in the specification is right; what it understates is that Stage 2 has a
   hard engineering prerequisite.

## 6. What is already built

From §26's module list: the **Regulatory Observatory** is live, bilingual, and
already does the thing an intelligence product is sold on — entries carry a
status, a source and an institutional response, and a closed entry lifts its
cap on readiness scoring. The **Knowledge Commons** exists as the document
store. The **sector councils** are stood up with an activation rule.

Missing: Institutional Directory, Expert Network, Consultation Platform, Policy
Lab, Research Repository, Training Platform, Event Platform, Institutional
Graph, Intelligence Dashboard, Collaboration Engine. The build order for those
is in [BLUEPRINT.md](BLUEPRINT.md) §4.

## 7. The firewall

§3 is the load-bearing paragraph of the whole specification: *policy
participation is not for sale; knowledge, education, research, technology and
services are.*

Nothing in the financial model prices policy access, and nothing should. The
two places where the line could erode in practice:

- **Sponsored research (§30).** The sponsor funds the programme and is
  published alongside the methodology and the conflicts. The sponsor does not
  see conclusions before publication. This has to be a written rule before the
  first sponsored programme, not after.
- **Strategic partnership benefits (§9).** Visibility, collaboration and
  co-branded programmes are sellable. A seat at a consultation is not, and the
  council activation rule in the platform already enforces who sits on what —
  a seat is appointed against a composition, not bought.

The §54 committees — finance, audit, commercial services, research ethics,
conflict of interest — are governance that does not exist yet. The first three
can wait; **research ethics and conflict of interest cannot wait past the first
sponsored programme.**
