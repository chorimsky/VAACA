/**
 * VAACA-RDFECF-01 — Regional Digital Financial Literacy Framework.
 *
 * The first standard in the education family, and the counterpart to the PSAN
 * Readiness Framework: that one asks what an *institution* must be able to
 * evidence, this one asks what a *person* must be able to do.
 *
 * It is a competency standard, not a syllabus. The distinction is the whole
 * point of the architecture — a competency says what someone can do, a
 * curriculum says what is taught to get them there, and a certificate says it
 * was demonstrated. Collapsing the three is how an institution ends up issuing
 * certificates for attendance.
 *
 * Only the ids and the structure live here. Every name, statement and example
 * is translated, because a literacy standard for a bloc where five of six
 * states work in French cannot be published in English and translated later.
 */

/* -------------------------------------------------------------------------- */
/* The progression                                                             */
/* -------------------------------------------------------------------------- */

/**
 * Seven levels, shared by every framework in the family, so that a citizen, a
 * student, a professional and a regulator are described in one language.
 *
 * The verbs are the standard's own: a level is named by what the learner can
 * *do*, never by how long they sat in a room.
 */
export const COMPETENCY_LEVELS = [
  { n: 0, id: "awareness" },
  { n: 1, id: "literacy" },
  { n: 2, id: "application" },
  { n: 3, id: "practice" },
  { n: 4, id: "design" },
  { n: 5, id: "leadership" },
  { n: 6, id: "transformation" },
] as const;

export type CompetencyLevelId = (typeof COMPETENCY_LEVELS)[number]["id"];

/** The highest level this framework addresses. Citizens are not expected to
 *  design regional market infrastructure, and saying so is part of the
 *  standard rather than an omission from it. */
export const LITERACY_CEILING = 2;

/**
 * The learner progression inside a single level: understand it, use it safely,
 * judge it, build with it. Stage D is optional for citizens and increasingly
 * expected of students and professionals.
 */
export const LEARNER_STAGES = [
  "understand",
  "apply",
  "evaluate",
  "create",
] as const;

export type LearnerStage = (typeof LEARNER_STAGES)[number];

/* -------------------------------------------------------------------------- */
/* The six domains                                                             */
/* -------------------------------------------------------------------------- */

export const LITERACY_DOMAINS = [
  "money",
  "services",
  "assets",
  "safety",
  "decisions",
  "rights",
] as const;

export type LiteracyDomainId = (typeof LITERACY_DOMAINS)[number];

/**
 * Which stage each domain is assessed to at the literacy level.
 *
 * Digital safety is the one domain assessed at `evaluate` rather than `apply`,
 * and deliberately: recognising a fraudulent message is a judgement, not a
 * procedure, and a learner who can recite the definition of phishing while
 * still clicking the link has not met the standard.
 */
export const DOMAIN_STAGE: Record<LiteracyDomainId, LearnerStage> = {
  money: "understand",
  services: "apply",
  assets: "understand",
  safety: "evaluate",
  decisions: "evaluate",
  rights: "understand",
};

/**
 * Digital assets are assessed at `understand`, not `apply`, and that is a
 * position rather than an oversight. A literacy standard that taught people to
 * *use* digital assets would be teaching participation; this one teaches
 * comprehension first. The standard's own principle: understand before
 * participating.
 */
export const UNDERSTAND_BEFORE_PARTICIPATING: LiteracyDomainId = "assets";

/* -------------------------------------------------------------------------- */
/* Assessment                                                                  */
/* -------------------------------------------------------------------------- */

export const ASSESSMENT_METHODS = [
  "knowledge",
  "scenario",
  "practical",
  "ethics",
] as const;

export type AssessmentMethod = (typeof ASSESSMENT_METHODS)[number];

/**
 * What each domain has to be assessed by. A domain assessed only by a
 * knowledge test is a domain that can be passed by reading, which is the
 * failure mode this framework exists to avoid.
 */
export const DOMAIN_ASSESSMENT: Record<
  LiteracyDomainId,
  readonly AssessmentMethod[]
> = {
  money: ["knowledge"],
  services: ["knowledge", "practical"],
  assets: ["knowledge", "scenario"],
  safety: ["scenario", "practical"],
  decisions: ["knowledge", "scenario"],
  rights: ["knowledge", "ethics"],
};

/** The rule that separates a credential from a receipt. */
export const PRACTICAL_REQUIRED_ABOVE = 2;

export const isLiteracyDomain = (v: unknown): v is LiteracyDomainId =>
  typeof v === "string" && (LITERACY_DOMAINS as readonly string[]).includes(v);
