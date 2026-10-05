import "server-only";

import { readStore, writeStore } from "./persistence";
import { GAP_EFFECT, type GapOwner } from "@/lib/gap-types";
import {
  fromStoredGap,
  type ObservatoryItem,
  type ObservatoryKind,
  type ObservatoryStatus,
  type Localised,
  type ObservatoryTopic,
} from "@/lib/observatory-types";

/**
 * The Regulatory Observatory, persisted.
 *
 * It keeps the gap register's file name on purpose. The register is the
 * Observatory's first ten entries, it is already a living document the
 * secretariat edits, and renaming the file would either lose those edits or
 * require a migration step that buys nothing — the rows are read forward
 * instead, by `fromStoredGap`.
 */

const ITEMS = "gaps.json";

type SeedItem = Omit<
  ObservatoryItem,
  "note" | "updatedBy" | "updatedAt" | "effect"
>;

/**
 * The ten instruction gaps, as entries in the register they always belonged in.
 *
 * Nothing beyond them is seeded. A regulatory observatory is a publication with
 * a cadence, and inventing entries to make the page look busy would put claims
 * about COBAC and COSUMAF into the product that nobody had checked.
 */
const SEED: SeedItem[] = [
  {
    id: "G1",
    kind: "gap",
    country: "Cameroon",
    institution: "MINFI",
    topic: "virtual-assets",
    title: {
      en: "No published PSAN application form or fee schedule in Cameroon.",
      fr: "Aucun formulaire de demande PSAN ni barème de frais publié au Cameroun.",
    },
    date: null,
    status: "in_progress",
    owner: "Secretary General",
    whatChanged: {
      en: "No published PSAN application form or fee schedule in Cameroon.",
      fr: "Aucun formulaire de demande PSAN ni barème de frais publié au Cameroun.",
    },
    whyItMatters: {
      en: "Applicants cannot self-file; VAACA becomes the de facto intake point.",
      fr: "Les candidats ne peuvent pas déposer eux-mêmes ; VAACA devient de fait le point d'entrée.",
    },
    whoIsAffected: {
      en: "Every prospective PSAN applicant in Cameroon.",
      fr: "Tout candidat PSAN potentiel au Cameroun.",
    },
    whatIsUnclear: {
      en: "Which ministry owns the form, and on what timetable.",
      fr: "Quel ministère pilote le formulaire, et selon quel calendrier.",
    },
    sources: [],
    response: null,
  },
  {
    id: "G2",
    kind: "gap",
    country: "Cameroon",
    institution: "COBAC / COSUMAF",
    topic: "virtual-assets",
    title: {
      en: "No designated regulator for pure virtual-asset activity (vs. banking/securities).",
      fr: "Aucun régulateur désigné pour l'activité purement liée aux actifs numériques (par opposition à la banque ou aux titres).",
    },
    date: null,
    status: "blocked",
    owner: "Legal seat",
    whatChanged: {
      en: "No designated regulator for pure virtual-asset activity, as distinct from banking or securities.",
      fr: "Aucun régulateur désigné pour l'activité purement liée aux actifs numériques, distincte de la banque ou des titres.",
    },
    whyItMatters: {
      en: "Gate 3 fails by default; escalation to COBAC/COSUMAF required case-by-case.",
      fr: "La porte 3 échoue par défaut ; une saisine de la COBAC ou de la COSUMAF est nécessaire au cas par cas.",
    },
    whoIsAffected: {
      en: "Any applicant outside an existing licensed perimeter.",
      fr: "Tout candidat hors d'un périmètre déjà agréé.",
    },
    whatIsUnclear: {
      en: "Whether a CEMAC-level authority is intended, or national designation.",
      fr: "Si une autorité au niveau CEMAC est envisagée, ou une désignation nationale.",
    },
    sources: [],
    response: null,
  },
  {
    id: "G3",
    kind: "gap",
    country: "Cameroon",
    institution: "ANIF",
    topic: "aml-cft",
    title: {
      en: "AML/CFT travel-rule guidance not adapted for virtual assets.",
      fr: "Les orientations LBC/FT sur la règle du voyage ne sont pas adaptées aux actifs numériques.",
    },
    date: null,
    status: "not_started",
    owner: "Compliance seat",
    whatChanged: {
      en: "Travel-rule guidance has not been adapted to virtual-asset transfers.",
      fr: "Les orientations sur la règle du voyage n'ont pas été adaptées aux transferts d'actifs numériques.",
    },
    whyItMatters: {
      en: "D2 scores capped at 1/3 until ANIF issues sector guidance.",
      fr: "Les notes du domaine D2 sont plafonnées à 1/3 tant que l'ANIF n'a pas publié d'orientations sectorielles.",
    },
    whoIsAffected: {
      en: "Exchanges and custodians moving client assets.",
      fr: "Les plateformes d'échange et les conservateurs qui déplacent des actifs de clients.",
    },
    whatIsUnclear: {
      en: "The threshold and the data set expected with a transfer.",
      fr: "Le seuil applicable et les données attendues avec un transfert.",
    },
    sources: [],
    response: null,
  },
  {
    id: "G4",
    kind: "gap",
    country: "Cameroon",
    institution: "COBAC",
    topic: "virtual-assets",
    title: {
      en: "No custody-specific prudential standard (cold storage, proof-of-reserves).",
      fr: "Aucune norme prudentielle propre à la conservation (stockage à froid, preuve de réserves).",
    },
    date: null,
    status: "in_progress",
    owner: "Standards & Assessment Officer",
    whatChanged: {
      en: "No prudential standard specific to virtual-asset custody has been issued.",
      fr: "Aucune norme prudentielle propre à la conservation d'actifs numériques n'a été publiée.",
    },
    whyItMatters: {
      en: "D3 relies on VAACA’s own interim standard, not law.",
      fr: "Le domaine D3 repose sur la norme intérimaire de VAACA, et non sur la loi.",
    },
    whoIsAffected: {
      en: "Any firm holding client keys.",
      fr: "Toute entreprise détenant les clés de ses clients.",
    },
    whatIsUnclear: {
      en: "Whether proof-of-reserves attestation would be accepted as evidence.",
      fr: "Si une attestation de preuve de réserves serait acceptée comme élément probant.",
    },
    sources: [],
    response: {
      en: "Interim VAACA custody standard circulated as a working draft.",
      fr: "Norme de conservation intérimaire de VAACA diffusée comme projet de travail.",
    },
  },
  {
    id: "G5",
    kind: "gap",
    country: "Cameroon",
    institution: "COBAC",
    topic: "virtual-assets",
    title: {
      en: "No minimum-capital threshold set for VASPs.",
      fr: "Aucun seuil de capital minimum fixé pour les PSAN.",
    },
    date: null,
    status: "not_started",
    owner: "Legal seat",
    whatChanged: {
      en: "No minimum-capital threshold has been set for VASPs.",
      fr: "Aucun seuil de capital minimum n'a été fixé pour les PSAN.",
    },
    whyItMatters: {
      en: 'D4 unscoreable; framework flags as "pending regulator instruction."',
      fr: "Le domaine D4 n'est pas notable ; le cadre le signale comme « en attente d'instruction du régulateur ».",
    },
    whoIsAffected: {
      en: "Every applicant in Classes A and B.",
      fr: "Tout candidat des classes A et B.",
    },
    whatIsUnclear: {
      en: "Whether capital would be set by activity or by volume.",
      fr: "Si le capital serait fixé par activité ou par volume.",
    },
    sources: [],
    response: null,
  },
];

/**
 * The remaining five gaps keep the text they were drafted with. They are
 * carried forward unchanged rather than rewritten into the fuller shape,
 * because the editorial fields are findings and inventing them here would put
 * unchecked claims in the register.
 */
const CARRIED: {
  id: string;
  title: Localised;
  whyItMatters: Localised;
  owner: GapOwner;
  status: ObservatoryStatus;
  institution: string;
  topic: ObservatoryTopic;
}[] = [
  {
    id: "G6",
    title: {
      en: "No consumer-redress mechanism for virtual-asset disputes.",
      fr: "Aucun mécanisme de recours des consommateurs pour les litiges sur actifs numériques.",
    },
    whyItMatters: {
      en: "D5 capped; VAACA ombuds function proposed as interim measure.",
      fr: "Le domaine D5 est plafonné ; une fonction de médiation VAACA est proposée à titre intérimaire.",
    },
    owner: "Consumer seat",
    status: "not_started",
    institution: "MINFI",
    topic: "consumer-protection",
  },
  {
    id: "G7",
    title: {
      en: "No incident-reporting channel for virtual-asset operators.",
      fr: "Aucun canal de déclaration d'incidents pour les opérateurs d'actifs numériques.",
    },
    whyItMatters: {
      en: "D7 evidence rests on self-attestation.",
      fr: "Les éléments probants du domaine D7 reposent sur l'auto-attestation.",
    },
    owner: "Cybersecurity seat",
    status: "not_started",
    institution: "ANTIC",
    topic: "cybersecurity",
  },
  {
    id: "G8",
    title: {
      en: "No reporting template or cadence defined for PSAN activity.",
      fr: "Aucun modèle ni périodicité de reporting définis pour l'activité PSAN.",
    },
    whyItMatters: {
      en: "D8 cannot be assessed against a published expectation.",
      fr: "Le domaine D8 ne peut être évalué au regard d'une attente publiée.",
    },
    owner: "Standards & Assessment Officer",
    status: "not_started",
    institution: "COBAC",
    topic: "virtual-assets",
  },
  {
    id: "G9",
    title: {
      en: "Tax treatment of virtual-asset gains undefined.",
      fr: "Le traitement fiscal des plus-values sur actifs numériques n'est pas défini.",
    },
    whyItMatters: {
      en: "Applicants cannot model compliance cost.",
      fr: "Les candidats ne peuvent pas modéliser le coût de la conformité.",
    },
    owner: "Secretary General",
    status: "not_started",
    institution: "DGI",
    topic: "tax",
  },
  {
    id: "G10",
    title: {
      en: "No cross-border recognition between CEMAC states.",
      fr: "Aucune reconnaissance transfrontalière entre les États de la CEMAC.",
    },
    whyItMatters: {
      en: "A Cameroon assessment does not travel.",
      fr: "Une évaluation camerounaise n'est pas transposable.",
    },
    owner: "Convenor",
    status: "blocked",
    institution: "CEMAC",
    topic: "virtual-assets",
  },
];

const seed = (): ObservatoryItem[] =>
  [
    ...SEED,
    ...CARRIED.map((g): SeedItem => ({
      id: g.id,
      kind: "gap",
      country: g.institution === "CEMAC" ? "CEMAC" : "Cameroon",
      institution: g.institution,
      topic: g.topic,
      title: g.title,
      date: null,
      status: g.status,
      owner: g.owner,
      whatChanged: g.title,
      whyItMatters: g.whyItMatters,
      whoIsAffected: null,
      whatIsUnclear: null,
      sources: [],
      response: null,
    })),
  ].map((item) => ({
    ...item,
    effect: GAP_EFFECT[item.id] ?? null,
    note: null,
    updatedBy: null,
    updatedAt: null,
  }));

/**
 * Reads every row forward into the current shape.
 *
 * Deliberately not `readOrSeed`: rows written before the Observatory existed
 * are missing most of its fields, and a straight read would hand them to the
 * page as undefined.
 *
 * For a seeded entry the two halves come from different places, and which is
 * which matters. The *description* of an entry — its country, institution,
 * topic, title, editorial fields and scoring effect — is editorial content that
 * belongs to the register, so the seed wins. Its *state* — status, owner, note,
 * response — is what the secretariat maintains, so the store wins.
 *
 * Without that split, a field the forward-read had to guess at got written back
 * on the first edit and became indistinguishable from a real value: G3 was
 * filed under "virtual assets" rather than AML/CFT that way, and nothing in the
 * data said it had been guessed.
 */
export async function listItems(): Promise<ObservatoryItem[]> {
  const stored = await readStore<Record<string, unknown>[] | null>(ITEMS, null);
  if (!stored?.length) return seed();

  const seeded = new Map(seed().map((item) => [item.id, item]));
  return stored.map((row) => {
    const item = fromStoredGap(row);
    const base = seeded.get(item.id);
    if (!base) return item;
    return {
      ...base,
      status: item.status,
      owner: item.owner,
      note: item.note,
      response: item.response ?? base.response,
      updatedBy: item.updatedBy,
      updatedAt: item.updatedAt,
    };
  });
}

/**
 * Case-insensitive on purpose. Entry ids are written as the register names them
 * — G1, G10 — but every URL in this app is canonical lowercase, and middleware
 * 308s a mis-cased path. So `/observatory/g3` is the address and `G3` is the
 * name.
 */
export async function getItem(
  id: string,
): Promise<ObservatoryItem | undefined> {
  const wanted = id.trim().toLowerCase();
  return (await listItems()).find((i) => i.id.toLowerCase() === wanted);
}

export type ObservatoryFilter = {
  kind?: ObservatoryKind | "all";
  topic?: ObservatoryTopic | "all";
  country?: string | "all";
  status?: ObservatoryStatus | "all";
};

export async function filterItems(
  filter: ObservatoryFilter,
): Promise<ObservatoryItem[]> {
  const items = await listItems();
  const matches = (value: string, want?: string) =>
    !want || want === "all" || value === want;
  return items.filter(
    (i) =>
      matches(i.kind, filter.kind) &&
      matches(i.topic, filter.topic) &&
      matches(i.country, filter.country) &&
      matches(i.status, filter.status),
  );
}

export async function countItems(): Promise<{
  total: number;
  open: number;
  blocked: number;
  closed: number;
  capping: number;
}> {
  const items = await listItems();
  return {
    total: items.length,
    open: items.filter((i) => i.status !== "closed").length,
    blocked: items.filter((i) => i.status === "blocked").length,
    closed: items.filter((i) => i.status === "closed").length,
    // The entries that are doing something to scoring right now.
    capping: items.filter((i) => i.effect && i.status !== "closed").length,
  };
}

export type ItemPatch = {
  status?: ObservatoryStatus;
  owner?: GapOwner;
  note?: string | null;
  /** Written in one language and mirrored into both until it is translated. */
  response?: string | null;
};

export async function updateItem(
  id: string,
  patch: ItemPatch,
  actor: string,
): Promise<ObservatoryItem | null> {
  const current = await listItems();
  return writeStore<ObservatoryItem[], ObservatoryItem | null>(
    ITEMS,
    current,
    async (rows) => {
      const list = rows.length ? rows.map(fromStoredGap) : current;
      const index = list.findIndex((i) => i.id === id);
      if (index === -1) return { next: list, result: null };

      const updated: ObservatoryItem = {
        ...list[index],
        status: patch.status ?? list[index].status,
        owner: patch.owner ?? list[index].owner,
        note: patch.note === undefined ? list[index].note : patch.note,
        response:
          patch.response === undefined
            ? list[index].response
            : patch.response === null
              ? null
              : { en: patch.response, fr: patch.response },
        updatedBy: actor,
        updatedAt: new Date().toISOString(),
      };

      const next = [...list];
      next[index] = updated;
      return { next, result: updated };
    },
  );
}
