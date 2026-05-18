import {
  TermWrapper,
  LiteralAs,
  LiteralFrom,
  NamedNodeAs,
  NamedNodeFrom,
  TermAs,
  TermFrom,
} from "@rdfjs/wrapper";
import { VP, GEO, RDFS } from "@/app/lib/class/Vocabulary";

/**
 * Wraps a vp:Point blank node (geo:lat, geo:long).
 */
export class PointNode extends TermWrapper {
  get lat(): number | null {
    const v = this.singularNullable(GEO.lat, LiteralAs.string);
    return v != null ? Number(v) : null;
  }
  get long(): number | null {
    const v = this.singularNullable(GEO.long, LiteralAs.string);
    return v != null ? Number(v) : null;
  }
}

/**
 * Wraps a vp:PreferredLocation blank node.
 * Contains a nested vp:Point (with geo:lat / geo:long) and vp:rad (km).
 */
export class PreferredLocationNode extends TermWrapper {
  get point(): PointNode | null {
    return this.singularNullable(VP.point, TermAs.instance(PointNode)) ?? null;
  }

  /** Radius in kilometres. */
  get rad(): number | null {
    const v = this.singularNullable(VP.rad, LiteralAs.string);
    return v != null ? Number(v) : null;
  }

  get label(): string | null {
    return this.singularNullable(RDFS.label, LiteralAs.string) ?? null;
  }
}

/**
 * Wraps a vp:Credential named node (hash URI, e.g. <#cred-1234567890>).
 * Each property maps directly to a VP predicate, with getters and setters
 * backed by the underlying RDF dataset.
 */
export class CredentialNode extends TermWrapper {
  get title(): string | undefined {
    return this.singularNullable(VP.credentialTitle, LiteralAs.string);
  }
  set title(value: string | undefined) {
    this.overwriteNullable(VP.credentialTitle, value, LiteralFrom.string);
  }

  /** The requirement IRI, e.g. "https://id.volunteeringdata.io/document/DRIVING_LICENCE" */
  get credentialType(): string | undefined {
    return this.singularNullable(VP.credentialType, NamedNodeAs.string);
  }
  set credentialType(value: string | undefined) {
    this.overwriteNullable(VP.credentialType, value, NamedNodeFrom.string);
  }

  /** The issuer IRI */
  get credentialIssuer(): string | undefined {
    return this.singularNullable(VP.credentialIssuer, NamedNodeAs.string);
  }
  set credentialIssuer(value: string | undefined) {
    this.overwriteNullable(VP.credentialIssuer, value, NamedNodeFrom.string);
  }

  /** Issuer display label (rdfs:label) */
  get issuerLabel(): string | undefined {
    return this.singularNullable(RDFS.label, LiteralAs.string);
  }
  set issuerLabel(value: string | undefined) {
    this.overwriteNullable(RDFS.label, value, LiteralFrom.string);
  }

  get status(): string | undefined {
    return this.singularNullable(VP.credentialStatus, LiteralAs.string);
  }
  set status(value: string | undefined) {
    this.overwriteNullable(VP.credentialStatus, value, LiteralFrom.string);
  }

  get issuedAt(): string | undefined {
    return this.singularNullable(VP.credentialIssuedAt, LiteralAs.string);
  }
  set issuedAt(value: string | undefined) {
    this.overwriteNullable(VP.credentialIssuedAt, value, LiteralFrom.string);
  }

  // --- Optional document credential fields ---

  get documentType(): string | undefined {
    return this.singularNullable(VP.documentType, LiteralAs.string);
  }
  set documentType(value: string | undefined) {
    this.overwriteNullable(VP.documentType, value, LiteralFrom.string);
  }

  get issuingCountry(): string | undefined {
    return this.singularNullable(VP.issuingCountry, LiteralAs.string);
  }
  set issuingCountry(value: string | undefined) {
    this.overwriteNullable(VP.issuingCountry, value, LiteralFrom.string);
  }

  get expiryDate(): string | undefined {
    return this.singularNullable(VP.expiryDate, LiteralAs.string);
  }
  set expiryDate(value: string | undefined) {
    this.overwriteNullable(VP.expiryDate, value, LiteralFrom.string);
  }

  get documentNumber(): string | undefined {
    return this.singularNullable(VP.documentNumber, LiteralAs.string);
  }
  set documentNumber(value: string | undefined) {
    this.overwriteNullable(VP.documentNumber, value, LiteralFrom.string);
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
      NamedNodeAs.string,
      NamedNodeFrom.string,
    );
  }

  get causes(): Set<string> {
    return this.objects(
      VP.preferredCause,
      NamedNodeAs.string,
      NamedNodeFrom.string,
    );
  }

  get equipment(): Set<string> {
    return this.objects(
      VP.hasRequirement,
      NamedNodeAs.string,
      NamedNodeFrom.string,
    );
  }

  /** Read-only: preferred location nodes. Use writeLocationsToPod for mutations. */
  get locationNodes(): Set<PreferredLocationNode> {
    return this.objects(
      VP.preferredLocation,
      TermAs.instance(PreferredLocationNode),
      TermFrom.instance,
    );
  }

  /** Preferred time IRIs (e.g. volunteering:MondayMorning). */
  get preferredTimes(): Set<string> {
    return this.objects(
      VP.preferredTime,
      NamedNodeAs.string,
      NamedNodeFrom.string,
    );
  }

  /** Credential nodes (hash URIs, e.g. <#cred-1234567890>). */
  get credentials(): Set<CredentialNode> {
    return this.objects(
      VP.hasCredential,
      TermAs.instance(CredentialNode),
      TermFrom.instance,
    );
  }
}


