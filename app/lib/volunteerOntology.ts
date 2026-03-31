/**
 * Volunteer ontology: parse Turtle (ontology/volunteer.ttl) and expose causes and
 * equipment/requirements by category. Single source for both parsers.
 * Loaded on the server via loadVolunteerOntology.server.
 */

import { Parser, Store, DataFactory } from "n3";
import { TermWrapper, DatasetWrapper, LiteralAs, NamedNodeAs } from "@rdfjs/wrapper";

const SKOS = {
  prefLabel: "http://www.w3.org/2004/02/skos/core#prefLabel",
  broader: "http://www.w3.org/2004/02/skos/core#broader",
  hasTopConcept: "http://www.w3.org/2004/02/skos/core#hasTopConcept",
} as const;

const BASE_IRI = "https://ns.volunteeringdata.io/";
const CAUSES_SCHEME_IRI = `${BASE_IRI}CausesScheme`;
const EQUIPMENT_SCHEME_IRI = `${BASE_IRI}EquipmentRequirements`;
const SKILLS_SCHEME_IRI = `${BASE_IRI}SkillsScheme`;

// —— Causes ——

export type CauseCategories = Record<string, string[]>;

export type VolunteerCauses = {
  categories: CauseCategories;
  allCauseLabels: string[];
  causeIriToLabel: Record<string, string>;
  labelToCauseIri: Record<string, string>;
};

// —— Equipment ——

export type EquipmentCategories = Record<string, string[]>;

export type VolunteerEquipment = {
  categories: EquipmentCategories;
  allEquipmentLabels: string[];
  equipmentIriToLabel: Record<string, string>;
  labelToEquipmentIri: Record<string, string>;
};

// —— Skills ——

export type SkillCategories = Record<string, string[]>;

export type VolunteerSkills = {
  categories: SkillCategories;
  allSkillLabels: string[];
  /** Map from skill concept IRI to display label (for reading from Pod). */
  skillIriToLabel: Record<string, string>;
  /** Map from display label to skill concept IRI (for writing to Pod). */
  labelToSkillIri: Record<string, string>;
};

// —— Shared SKOS helpers ——

class SkosConcept extends TermWrapper {
  get label(): string | undefined {
    return this.singularNullable(SKOS.prefLabel, LiteralAs.string);
  }
}

/** Concept with skos:broader (category). Used for both causes and equipment. */
class ConceptWithBroader extends SkosConcept {
  get categoryIri(): string | undefined {
    return this.singularNullable(SKOS.broader, NamedNodeAs.string);
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

/** Category labels from a ConceptScheme (hasTopConcept). */
function getCategoryLabelsFromScheme(
  store: Store,
  dataset: VolunteerOntologyDataset,
  schemeIri: string
): string[] {
  const scheme = DataFactory.namedNode(schemeIri);
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
 * Parses Turtle and returns cause categories and labels.
 * Only includes concepts whose category is in the vp:CausesScheme scheme.
 */
export function parseVolunteerTtl(turtleText: string): VolunteerCauses {
  const { store, dataset } = parseTurtle(turtleText);
  const categoryOrder = getCategoryLabelsFromScheme(store, dataset, CAUSES_SCHEME_IRI);
  const causeCategoryLabels = new Set(categoryOrder);
  const categories: CauseCategories = {};
  const causeIriToLabel: Record<string, string> = {};
  const labelToCauseIri: Record<string, string> = {};
  for (const cat of categoryOrder) categories[cat] = [];

  for (const concept of dataset.conceptsWithBroader) {
    const label = concept.label;
    const catLabel = concept.categoryLabel;
    if (!label || !catLabel) continue;
    if (!causeCategoryLabels.has(catLabel)) continue;
    const iri = concept.value;
    categories[catLabel].push(label);
    causeIriToLabel[iri] = label;
    labelToCauseIri[label] = iri;
  }

  const allCauseLabels = categoryOrder.flatMap((cat) => categories[cat] ?? []);
  return { categories, allCauseLabels, causeIriToLabel, labelToCauseIri };
}

/**
 * Parses Turtle and returns equipment/requirements categories and labels.
 * Only includes concepts whose category is in the vp:EquipmentRequirements scheme.
 */
export function parseVolunteerEquipmentTtl(turtleText: string): VolunteerEquipment {
  const { store, dataset } = parseTurtle(turtleText);
  const categoryOrder = getCategoryLabelsFromScheme(store, dataset, EQUIPMENT_SCHEME_IRI);
  const equipmentCategoryLabels = new Set(categoryOrder);

  const categories: EquipmentCategories = {};
  const equipmentIriToLabel: Record<string, string> = {};
  const labelToEquipmentIri: Record<string, string> = {};
  for (const cat of categoryOrder) categories[cat] = [];

  for (const concept of dataset.conceptsWithBroader) {
    const label = concept.label;
    const catLabel = concept.categoryLabel;
    if (!label || !catLabel) continue;
    if (!equipmentCategoryLabels.has(catLabel)) continue;
    const iri = concept.value;
    categories[catLabel].push(label);
    equipmentIriToLabel[iri] = label;
    labelToEquipmentIri[label] = iri;
  }

  const allEquipmentLabels = categoryOrder.flatMap((cat) => categories[cat] ?? []);
  return { categories, allEquipmentLabels, equipmentIriToLabel, labelToEquipmentIri };
}

/**
 * Parses Turtle and returns skill categories, labels, and IRI↔label maps for Pod read/write.
 * Only includes concepts whose category is in the vp:SkillsScheme scheme.
 */
export function parseVolunteerSkillsTtl(turtleText: string): VolunteerSkills {
  const { store, dataset } = parseTurtle(turtleText);
  const categoryOrder = getCategoryLabelsFromScheme(store, dataset, SKILLS_SCHEME_IRI);
  const skillCategoryLabels = new Set(categoryOrder);

  const categories: SkillCategories = {};
  const skillIriToLabel: Record<string, string> = {};
  const labelToSkillIri: Record<string, string> = {};
  for (const cat of categoryOrder) categories[cat] = [];

  for (const concept of dataset.conceptsWithBroader) {
    const label = concept.label;
    const catLabel = concept.categoryLabel;
    if (!label || !catLabel) continue;
    if (!skillCategoryLabels.has(catLabel)) continue;
    const iri = concept.value;
    categories[catLabel].push(label);
    skillIriToLabel[iri] = label;
    labelToSkillIri[label] = iri;
  }

  const allSkillLabels = categoryOrder.flatMap((cat) => categories[cat] ?? []);
  return { categories, allSkillLabels, skillIriToLabel, labelToSkillIri };
}
