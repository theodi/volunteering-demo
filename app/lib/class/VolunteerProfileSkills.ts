import {
  TermWrapper,
  ValueMapping,
  TermMapping,
} from "rdfjs-wrapper";
import type { DatasetCore, DataFactory } from "@rdfjs/types";
import { VOLUNTEER_SCHEMA } from "@/app/lib/class/Vocabulary";

/**
 * Wraps the volunteer profile skills document subject (e.g. {doc}#me).
 * Exposes skills as a read/write set of skill concept URIs via the ontology predicate hasSkill.
 * Mutations (add/delete/clear) update the underlying dataset; serialize and PUT to persist to the Pod.
 */
export class VolunteerProfileSkills extends TermWrapper {
  /**
   * Set of skill concept URIs (objects of hasSkill).
   * Use .add(uri), .delete(uri), .clear() to mutate; changes affect the underlying dataset.
   */
  get skills(): Set<string> {
    return this.objects(
      VOLUNTEER_SCHEMA.hasSkill,
      ValueMapping.iriToString,
      TermMapping.stringToIri
    );
  }
}

/**
 * Builds a VolunteerProfileSkills wrapper for the given subject in the dataset.
 * Use when the subject may not exist yet (e.g. new document); add rdf:type before writing.
 */
export function wrapVolunteerProfileSkills(
  subjectIri: string,
  dataset: DatasetCore,
  factory: DataFactory
): VolunteerProfileSkills {
  const subject = factory.namedNode(subjectIri);
  return new VolunteerProfileSkills(subject, dataset, factory);
}
