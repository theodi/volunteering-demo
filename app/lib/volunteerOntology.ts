/**
 * Volunteer ontology: parse Turtle and expose cause categories/causes.
 * Uses rdfjs-wrapper (same pattern as WebID Agent).
 * Source of truth: ontology/volunteer.ttl (read via API route).
 */

import { Parser, Store, DataFactory } from "n3";
import { TermWrapper, DatasetWrapper, ValueMapping } from "rdfjs-wrapper";

const SKOS = {
  prefLabel: "http://www.w3.org/2004/02/skos/core#prefLabel",
  broader: "http://www.w3.org/2004/02/skos/core#broader",
} as const;

export type CauseCategories = Record<string, string[]>;

export type VolunteerCauses = {
  categories: CauseCategories;
  allCauseLabels: string[];
};

/** SKOS concept with a prefLabel (used for category and cause). */
class SkosConcept extends TermWrapper {
  get label(): string | undefined {
    return this.singularNullable(SKOS.prefLabel, ValueMapping.literalToString);
  }
}

/** Cause concept: has skos:prefLabel and skos:broader (category). */
class CauseConcept extends SkosConcept {
  get categoryIri(): string | undefined {
    return this.singularNullable(SKOS.broader, ValueMapping.iriToString);
  }

  get categoryLabel(): string | undefined {
    const iri = this.categoryIri;
    if (!iri) return undefined;
    const category = new SkosConcept(
      this.factory.namedNode(iri),
      this.dataset,
      this.factory
    );
    return category.label;
  }
}

/** Wraps the volunteer ontology dataset; exposes cause concepts (subjects with skos:broader). */
class VolunteerOntologyDataset extends DatasetWrapper {
  get causeConcepts(): Iterable<CauseConcept> {
    return this.subjectsOf(SKOS.broader, CauseConcept);
  }
}

/**
 * Parses Turtle text and returns cause categories and labels.
 * Used by the API route (reads ontology/volunteer.ttl) and by tests.
 */
export function parseVolunteerTtl(turtleText: string): VolunteerCauses {
  const store = new Store();
  const parser = new Parser({
    baseIRI: "https://id.volunteeringdata.io/volunteer-profile/",
  });
  const quads = parser.parse(turtleText);
  store.addQuads(quads);

  const categories: CauseCategories = {};
  const categoryOrder: string[] = [];
  const seenCategories = new Set<string>();

  const dataset = new VolunteerOntologyDataset(store, DataFactory);

  for (const cause of dataset.causeConcepts) {
    const label = cause.label;
    const catLabel = cause.categoryLabel;
    if (!label || !catLabel) continue;

    if (!seenCategories.has(catLabel)) {
      seenCategories.add(catLabel);
      categoryOrder.push(catLabel);
      categories[catLabel] = [];
    }
    categories[catLabel].push(label);
  }

  const allCauseLabels = categoryOrder.flatMap((cat) => categories[cat] ?? []);

  return { categories, allCauseLabels };
}

let cached: VolunteerCauses | null = null;

/**
 * Loads causes from the API (which reads ontology/volunteer.ttl directly).
 * Cached for the session.
 */
export async function getVolunteerCauses(): Promise<VolunteerCauses> {
  if (cached) return cached;

  const base =
    typeof window !== "undefined"
      ? ""
      : process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const res = await fetch(`${base}/api/volunteer-causes`);
  if (!res.ok) throw new Error(`Failed to load causes: ${res.status}`);
  const data = (await res.json()) as VolunteerCauses;
  cached = data;
  return data;
}
