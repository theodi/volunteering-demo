import {
  TermWrapper,
  ValueMapping,
  TermMapping,
  ObjectMapping,
} from "rdfjs-wrapper";
import type { DatasetCore, DataFactory } from "@rdfjs/types";
import { VOLUNTEER_SCHEMA } from "@/app/lib/class/Vocabulary";

/**
 * Wraps a single location blank node under hasLocation.
 * Each node carries lat, lon, distance (metres), and a human-readable label.
 */
export class LocationNode extends TermWrapper {
  get latitude(): number | null {
    const v = this.singularNullable(VOLUNTEER_SCHEMA.latitude, ValueMapping.literalToString);
    return v != null ? Number(v) : null;
  }
  get longitude(): number | null {
    const v = this.singularNullable(VOLUNTEER_SCHEMA.longitude, ValueMapping.literalToString);
    return v != null ? Number(v) : null;
  }
  /** Search radius in metres. */
  get distance(): number | null {
    const v = this.singularNullable(VOLUNTEER_SCHEMA.distance, ValueMapping.literalToString);
    return v != null ? Number(v) : null;
  }
  get label(): string | null {
    return this.singularNullable(VOLUNTEER_SCHEMA.locationLabel, ValueMapping.literalToString) ?? null;
  }
}

/**
 * Wraps the volunteer profile document subject ({pod}/volunteer/profile.ttl#me).
 * Exposes skills, causes, equipment as read/write IRI sets, and locations as
 * structured LocationNode objects via rdfjs-wrapper.
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

  /** Read-only: location blank nodes. Use writeLocationsToPod for mutations. */
  get locationNodes(): Set<LocationNode> {
    return this.objects(
      VOLUNTEER_SCHEMA.hasLocation,
      ObjectMapping.as(LocationNode),
      ObjectMapping.as(LocationNode),
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
