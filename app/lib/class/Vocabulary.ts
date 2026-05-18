/**
 * Vocabulary constants for RDF predicates and types.
 *
 * Standard vocabularies used by the base Agent class (FOAF, PIM, etc.) are
 * handled internally by @solid/object and do not need to be defined here.
 * We only define constants needed by our own extended classes and helpers.
 */

// ---------------------------------------------------------------------------
// Standard vocabularies — only IRIs needed beyond @solid/object's Agent
// ---------------------------------------------------------------------------

export const SOLID = {
  preferredSubjectPronoun: "http://www.w3.org/ns/solid/terms#preferredSubjectPronoun",
} as const;

export const RDFS = {
  label: "http://www.w3.org/2000/01/rdf-schema#label",
} as const;

/** VCARD predicates not covered by @solid/object's Agent. */
export const VCARD = {
  bday: "http://www.w3.org/2006/vcard/ns#bday",
  note: "http://www.w3.org/2006/vcard/ns#note",
  hasAddress: "http://www.w3.org/2006/vcard/ns#hasAddress",
  region: "http://www.w3.org/2006/vcard/ns#region",
  countryName: "http://www.w3.org/2006/vcard/ns#country-name",
} as const;

// ---------------------------------------------------------------------------
// Project-specific vocabularies
// ---------------------------------------------------------------------------

/** schema.org — sameAs often used for social profile URLs. */
export const SCHEMA = {
  sameAs: "https://schema.org/sameAs",
} as const;

/**
 * Volunteer Profile ontology (vp:) — profile predicates and classes.
 * @see https://github.com/theodi/volunteer-profile-manager/blob/main/src/ontology/volunteer.ttl
 */
export const VP = {
  VolunteerProfile: "https://id.volunteeringdata.io/volunteer-profile/VolunteerProfile",
  hasSkill: "https://id.volunteeringdata.io/volunteer-profile/hasSkill",
  preferredCause: "https://id.volunteeringdata.io/volunteer-profile/preferredCause",
  hasRequirement: "https://id.volunteeringdata.io/volunteer-profile/hasRequirement",
  PreferredLocation: "https://id.volunteeringdata.io/volunteer-profile/PreferredLocation",
  Point: "https://id.volunteeringdata.io/volunteer-profile/Point",
  preferredLocation: "https://id.volunteeringdata.io/volunteer-profile/preferredLocation",
  point: "https://id.volunteeringdata.io/volunteer-profile/point",
  /** Radius in kilometres. */
  rad: "https://id.volunteeringdata.io/volunteer-profile/rad",
  preferredTime: "https://id.volunteeringdata.io/volunteer-profile/preferredTime",
  // Credential predicates
  hasCredential: "https://id.volunteeringdata.io/volunteer-profile/hasCredential",
  Credential: "https://id.volunteeringdata.io/volunteer-profile/Credential",
  credentialType: "https://id.volunteeringdata.io/volunteer-profile/credentialType",
  credentialIssuer: "https://id.volunteeringdata.io/volunteer-profile/credentialIssuer",
  credentialStatus: "https://id.volunteeringdata.io/volunteer-profile/credentialStatus",
  credentialTitle: "https://id.volunteeringdata.io/volunteer-profile/credentialTitle",
  credentialIssuedAt: "https://id.volunteeringdata.io/volunteer-profile/credentialIssuedAt",
  documentType: "https://id.volunteeringdata.io/volunteer-profile/documentType",
  issuingCountry: "https://id.volunteeringdata.io/volunteer-profile/issuingCountry",
  expiryDate: "https://id.volunteeringdata.io/volunteer-profile/expiryDate",
  documentNumber: "https://id.volunteeringdata.io/volunteer-profile/documentNumber",
} as const;

/**
 * Volunteering Data Model namespace — taxonomy terms (skills, causes,
 * requirements) and pre-composed temporal entities (MondayMorning, etc.).
 * @see https://standard.volunteeringdata.io/ontology/
 */
export const VOLUNTEERING_NS = "https://ns.volunteeringdata.io/" as const;

/** W3C WGS84 Geo Positioning vocabulary. */
export const GEO = {
  lat: "http://www.w3.org/2003/01/geo/wgs84_pos#lat",
  long: "http://www.w3.org/2003/01/geo/wgs84_pos#long",
} as const;
