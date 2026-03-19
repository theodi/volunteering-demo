/** RDF vocabulary IRIs used for WebID profile (Agent) parsing. */

export const FOAF = {
  fname: "http://xmlns.com/foaf/0.1/name",
  email: "http://xmlns.com/foaf/0.1/email",
  homepage: "http://xmlns.com/foaf/0.1/homepage",
  knows: "http://xmlns.com/foaf/0.1/knows",
} as const;

export const PIM = {
  storage: "http://www.w3.org/ns/pim/space#storage",
} as const;

export const SOLID = {
  oidcIssuer: "http://www.w3.org/ns/solid/terms#oidcIssuer",
  storage: "http://www.w3.org/ns/solid/terms#storage",
  preferredSubjectPronoun: "http://www.w3.org/ns/solid/terms#preferredSubjectPronoun",
} as const;

/** schema.org - sameAs often used for social profile URLs */
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

export const RDFS = {
  label: "http://www.w3.org/2000/01/rdf-schema#label",
} as const;

export const VCARD = {
  fn: "http://www.w3.org/2006/vcard/ns#fn",
  hasEmail: "http://www.w3.org/2006/vcard/ns#hasEmail",
  /** Standard predicate for the value of an email/telephone/url node (W3C vCard ...#value). */
  value: "http://www.w3.org/2006/vcard/ns#value",
  hasPhoto: "http://www.w3.org/2006/vcard/ns#hasPhoto",
  hasTelephone: "http://www.w3.org/2006/vcard/ns#hasTelephone",
  title: "http://www.w3.org/2006/vcard/ns#title",
  hasUrl: "http://www.w3.org/2006/vcard/ns#hasUrl",
  organizationName: "http://www.w3.org/2006/vcard/ns#organization-name",
  role: "http://www.w3.org/2006/vcard/ns#role",
  bday: "http://www.w3.org/2006/vcard/ns#bday",
  note: "http://www.w3.org/2006/vcard/ns#note",
  hasAddress: "http://www.w3.org/2006/vcard/ns#hasAddress",
  region: "http://www.w3.org/2006/vcard/ns#region",
  countryName: "http://www.w3.org/2006/vcard/ns#country-name",
} as const;
