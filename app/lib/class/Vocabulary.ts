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
