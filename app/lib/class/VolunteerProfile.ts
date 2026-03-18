import {
  TermWrapper,
  ValueMapping,
  TermMapping,
} from "rdfjs-wrapper";
import type { DatasetCore, DataFactory } from "@rdfjs/types";
import { VOLUNTEER_SCHEMA } from "@/app/lib/class/Vocabulary";

/**
 * Wraps the volunteer profile document subject ({pod}/volunteer/profile.ttl#me).
 * Exposes skills and causes as read/write sets of concept URIs via ontology predicates.
 * Mutations (.add/.delete/.clear) update the underlying dataset; serialize and PUT to persist.
 */
export class VolunteerProfile extends TermWrapper {
  get skills(): Set<string> {
    return this.objects(
      VOLUNTEER_SCHEMA.hasSkill,
      ValueMapping.iriToString,
      TermMapping.stringToIri
    );
  }

  get causes(): Set<string> {
    return this.objects(
      VOLUNTEER_SCHEMA.hasCause,
      ValueMapping.iriToString,
      TermMapping.stringToIri
    );
  }

  get equipment(): Set<string> {
    return this.objects(
      VOLUNTEER_SCHEMA.hasEquipment,
      ValueMapping.iriToString,
      TermMapping.stringToIri
    );
  }
}

export function wrapVolunteerProfile(
  subjectIri: string,
  dataset: DatasetCore,
  factory: DataFactory
): VolunteerProfile {
  const subject = factory.namedNode(subjectIri);
  return new VolunteerProfile(subject, dataset, factory);
}
