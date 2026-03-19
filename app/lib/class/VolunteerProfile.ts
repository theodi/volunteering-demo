import {
  TermWrapper,
  ValueMapping,
  TermMapping,
  ObjectMapping,
} from "rdfjs-wrapper";
import type { DatasetCore, DataFactory } from "@rdfjs/types";
import { VP, GEO, RDFS } from "@/app/lib/class/Vocabulary";

/**
 * Wraps a vp:Point blank node (geo:lat, geo:long).
 */
export class PointNode extends TermWrapper {
  get lat(): number | null {
    const v = this.singularNullable(GEO.lat, ValueMapping.literalToString);
    return v != null ? Number(v) : null;
  }
  get long(): number | null {
    const v = this.singularNullable(GEO.long, ValueMapping.literalToString);
    return v != null ? Number(v) : null;
  }
}

/**
 * Wraps a vp:PreferredLocation blank node.
 * Contains a nested vp:Point (with geo:lat / geo:long) and vp:rad (km).
 */
export class PreferredLocationNode extends TermWrapper {
  get point(): PointNode | null {
    return this.singularNullable(VP.point, ObjectMapping.as(PointNode)) ?? null;
  }

  /** Radius in kilometres. */
  get rad(): number | null {
    const v = this.singularNullable(VP.rad, ValueMapping.literalToString);
    return v != null ? Number(v) : null;
  }

  get label(): string | null {
    return this.singularNullable(RDFS.label, ValueMapping.literalToString) ?? null;
  }
}

/**
 * Wraps the volunteer profile document subject ({pod}/volunteer/profile.ttl#me).
 * Exposes skills, causes, equipment, preferred times as read/write IRI sets,
 * and locations as structured PreferredLocationNode objects.
 */
export class VolunteerProfile extends TermWrapper {
  get skills(): Set<string> {
    return this.objects(
      VP.hasSkill,
      ValueMapping.iriToString,
      TermMapping.stringToIri,
    );
  }

  get causes(): Set<string> {
    return this.objects(
      VP.preferredCause,
      ValueMapping.iriToString,
      TermMapping.stringToIri,
    );
  }

  get equipment(): Set<string> {
    return this.objects(
      VP.hasRequirement,
      ValueMapping.iriToString,
      TermMapping.stringToIri,
    );
  }

  /** Read-only: preferred location nodes. Use writeLocationsToPod for mutations. */
  get locationNodes(): Set<PreferredLocationNode> {
    return this.objects(
      VP.preferredLocation,
      ObjectMapping.as(PreferredLocationNode),
      ObjectMapping.as(PreferredLocationNode),
    );
  }

  /** Preferred time IRIs (e.g. volunteering:MondayMorning). */
  get preferredTimes(): Set<string> {
    return this.objects(
      VP.preferredTime,
      ValueMapping.iriToString,
      TermMapping.stringToIri,
    );
  }
}

export function wrapVolunteerProfile(
  subjectIri: string,
  dataset: DatasetCore,
  factory: DataFactory,
): VolunteerProfile {
  const subject = factory.namedNode(subjectIri);
  return new VolunteerProfile(subject, dataset, factory);
}
