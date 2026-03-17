/**
 * Volunteer ontology: parse Turtle (ontology/volunteer.ttl) and expose causes and
 * equipment/requirements by category. Single source for both parsers.
 * Loaded on the server via loadVolunteerOntology.server.
 */

import { Parser, Store, DataFactory } from "n3";
import { TermWrapper, DatasetWrapper, ValueMapping } from "rdfjs-wrapper";

const SKOS = {
  prefLabel: "http://www.w3.org/2004/02/skos/core#prefLabel",
  broader: "http://www.w3.org/2004/02/skos/core#broader",
  hasTopConcept: "http://www.w3.org/2004/02/skos/core#hasTopConcept",
} as const;

const BASE_IRI = "https://id.volunteeringdata.io/volunteer-profile/";
const EQUIPMENT_SCHEME_IRI = `${BASE_IRI}EquipmentRequirements`;

// —— Causes ——

export type CauseCategories = Record<string, string[]>;

export type VolunteerCauses = {
  categories: CauseCategories;
  allCauseLabels: string[];
};

// —— Equipment ——

export type EquipmentCategories = Record<string, string[]>;

export type VolunteerEquipment = {
  categories: EquipmentCategories;
  allEquipmentLabels: string[];
};

// —— Shared SKOS helpers ——

class SkosConcept extends TermWrapper {
  get label(): string | undefined {
    return this.singularNullable(SKOS.prefLabel, ValueMapping.literalToString);
  }
}

/** Concept with skos:broader (category). Used for both causes and equipment. */
class ConceptWithBroader extends SkosConcept {
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

class VolunteerOntologyDataset extends DatasetWrapper {
  /** All concepts that have a broader (category). */
  get conceptsWithBroader(): Iterable<ConceptWithBroader> {
    return this.subjectsOf(SKOS.broader, ConceptWithBroader);
  }
}

function parseTurtle(turtleText: string): { store: Store; dataset: VolunteerOntologyDataset } {
  const store = new Store();
  const parser = new Parser({ baseIRI: BASE_IRI });
  store.addQuads(parser.parse(turtleText));
  const dataset = new VolunteerOntologyDataset(store, DataFactory);
  return { store, dataset };
}

/** Category labels for equipment/requirements from the ConceptScheme (vp:EquipmentRequirements). */
function getEquipmentCategoryLabelsFromScheme(
  store: Store,
  dataset: VolunteerOntologyDataset
): string[] {
  const scheme = DataFactory.namedNode(EQUIPMENT_SCHEME_IRI);
  const hasTopConcept = DataFactory.namedNode(SKOS.hasTopConcept);
  const quads = store.getQuads(scheme, hasTopConcept, null, null);
  const order: string[] = [];
  for (const q of quads) {
    if (q.object.termType !== "NamedNode") continue;
    const concept = new SkosConcept(q.object, dataset, DataFactory);
    const label = concept.label;
    if (label) order.push(label);
  }
  return order;
}

// —— Public parsers ——

/**
 * Parses Turtle and returns cause categories and labels (all concepts with skos:broader).
 */
export function parseVolunteerTtl(turtleText: string): VolunteerCauses {
  const { dataset } = parseTurtle(turtleText);
  const categories: CauseCategories = {};
  const categoryOrder: string[] = [];
  const seenCategories = new Set<string>();

  for (const concept of dataset.conceptsWithBroader) {
    const label = concept.label;
    const catLabel = concept.categoryLabel;
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

/**
 * Parses Turtle and returns equipment/requirements categories and labels.
 * Only includes concepts whose category is in the vp:EquipmentRequirements scheme.
 */
export function parseVolunteerEquipmentTtl(turtleText: string): VolunteerEquipment {
  const { store, dataset } = parseTurtle(turtleText);
  const categoryOrder = getEquipmentCategoryLabelsFromScheme(store, dataset);
  const equipmentCategoryLabels = new Set(categoryOrder);

  const categories: EquipmentCategories = {};
  for (const cat of categoryOrder) categories[cat] = [];

  for (const concept of dataset.conceptsWithBroader) {
    const label = concept.label;
    const catLabel = concept.categoryLabel;
    if (!label || !catLabel) continue;
    if (!equipmentCategoryLabels.has(catLabel)) continue;
    categories[catLabel].push(label);
  }

  const allEquipmentLabels = categoryOrder.flatMap((cat) => categories[cat] ?? []);
  return { categories, allEquipmentLabels };
}
