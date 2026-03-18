/**
 * Volunteer extended profile: read/write skills, causes, equipment, and locations
 * in the volunteer profile document at {pod}/volunteer/profile.ttl.
 * Uses rdfjs-wrapper VolunteerProfile for clean RDF access; N3 for serialization.
 *
 * All functions are pure async — caching and dedup are handled by React Query
 * at the hook layer.
 */

import { Parser, Writer, Store, DataFactory } from "n3";
import { wrapVolunteerProfile } from "@/app/lib/class/VolunteerProfile";
import { VOLUNTEER_SCHEMA } from "@/app/lib/class/Vocabulary";
import type { SavedLocation } from "@/app/components/volunteer-info/PreferredLocations";

const RDF_TYPE = "http://www.w3.org/1999/02/22-rdf-syntax-ns#type";
const FOAF_PERSON = "http://xmlns.com/foaf/0.1/Person";

/** Constructs the volunteer profile doc URL and subject IRI from the pod root. */
function volunteerProfileDoc(podRoot: string): { docUrl: string; subjectIri: string } {
  const base = podRoot.endsWith("/") ? podRoot : `${podRoot}/`;
  const docUrl = `${base}volunteer/profile.ttl`;
  return { docUrl, subjectIri: `${docUrl}#me` };
}

/** Parses turtle content into an N3 Store. Returns null on failure. */
function parseTurtle(content: string, baseIRI: string): Store | null {
  const store = new Store();
  try {
    store.addQuads(new Parser({ baseIRI }).parse(content));
    return store;
  } catch {
    return null;
  }
}

/** Serializes all quads in the store to turtle. */
function serializeToTurtle(store: Store): Promise<string> {
  const writer = new Writer({
    prefixes: {
      vp: "https://id.volunteeringdata.io/volunteer-profile/",
      schema: "https://id.volunteeringdata.io/schema/",
      foaf: "http://xmlns.com/foaf/0.1/",
      rdf: "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
    },
  });
  for (const q of store.getQuads(null, null, null, null)) {
    writer.addQuad(q);
  }
  return new Promise<string>((resolve, reject) => {
    writer.end((err, result) => (err ? reject(err) : resolve(result ?? "")));
  });
}

// ---------------------------------------------------------------------------
// Generic read / write for any VolunteerProfile property
// ---------------------------------------------------------------------------

type ProfileProperty = "skills" | "causes" | "equipment";

async function readPropertyFromPod(
  fetchFn: typeof fetch,
  podRoot: string,
  property: ProfileProperty,
): Promise<string[]> {
  const { docUrl, subjectIri } = volunteerProfileDoc(podRoot);

  let response: Response;
  try {
    response = await fetchFn(docUrl, {
      method: "GET",
      headers: { Accept: "text/turtle, application/turtle" },
    });
  } catch {
    return [];
  }

  if (!response.ok) {
    if (response.status === 404) return [];
    throw new Error(`Failed to read ${property}: ${response.status}`);
  }

  const text = await response.text();
  if (!text.trim()) return [];

  const store = parseTurtle(text, docUrl);
  if (!store) return [];

  const profile = wrapVolunteerProfile(subjectIri, store, DataFactory);
  return [...profile[property]];
}

async function writePropertyToPod(
  fetchFn: typeof fetch,
  podRoot: string,
  property: ProfileProperty,
  uris: string[],
): Promise<void> {
  const { docUrl, subjectIri } = volunteerProfileDoc(podRoot);

  const store = new Store();
  const getRes = await fetchFn(docUrl, { method: "GET", headers: { Accept: "text/turtle" } });
  if (getRes.ok) {
    const text = await getRes.text();
    if (text.trim()) {
      const existing = parseTurtle(text, docUrl);
      if (existing) {
        for (const q of existing.getQuads(null, null, null, null)) {
          store.addQuad(q);
        }
      }
    }
  }

  const subjectNode = DataFactory.namedNode(subjectIri);
  if (store.getQuads(subjectNode, DataFactory.namedNode(RDF_TYPE), null, null).length === 0) {
    store.addQuad(subjectNode, DataFactory.namedNode(RDF_TYPE), DataFactory.namedNode(FOAF_PERSON));
  }

  const profile = wrapVolunteerProfile(subjectIri, store, DataFactory);
  const set: Set<string> = profile[property];
  set.clear();
  for (const uri of uris) {
    const trimmed = uri.trim();
    if (trimmed) set.add(trimmed);
  }

  const turtle = await serializeToTurtle(store);
  const putResponse = await fetchFn(docUrl, {
    method: "PUT",
    headers: { "Content-Type": "text/turtle" },
    body: turtle,
  });

  if (!putResponse.ok) {
    throw new Error(`Failed to write ${property}: ${putResponse.status}`);
  }
}

// ---------------------------------------------------------------------------
// Public API — skills
// ---------------------------------------------------------------------------

export const readSkillsFromPod = (fetchFn: typeof fetch, podRoot: string) =>
  readPropertyFromPod(fetchFn, podRoot, "skills");

export const writeSkillsToPod = (fetchFn: typeof fetch, podRoot: string, uris: string[]) =>
  writePropertyToPod(fetchFn, podRoot, "skills", uris);

// ---------------------------------------------------------------------------
// Public API — causes
// ---------------------------------------------------------------------------

export const readCausesFromPod = (fetchFn: typeof fetch, podRoot: string) =>
  readPropertyFromPod(fetchFn, podRoot, "causes");

export const writeCausesToPod = (fetchFn: typeof fetch, podRoot: string, uris: string[]) =>
  writePropertyToPod(fetchFn, podRoot, "causes", uris);

// ---------------------------------------------------------------------------
// Public API — equipment
// ---------------------------------------------------------------------------

export const readEquipmentFromPod = (fetchFn: typeof fetch, podRoot: string) =>
  readPropertyFromPod(fetchFn, podRoot, "equipment");

export const writeEquipmentToPod = (fetchFn: typeof fetch, podRoot: string, uris: string[]) =>
  writePropertyToPod(fetchFn, podRoot, "equipment", uris);

// ---------------------------------------------------------------------------
// Public API — locations (structured blank nodes, not simple URIs)
// ---------------------------------------------------------------------------

/**
 * Reads locations from {pod}/volunteer/profile.ttl.
 * Uses rdfjs-wrapper LocationNode to read structured blank node properties.
 */
export async function readLocationsFromPod(
  fetchFn: typeof fetch,
  podRoot: string,
): Promise<SavedLocation[]> {
  const { docUrl, subjectIri } = volunteerProfileDoc(podRoot);

  let response: Response;
  try {
    response = await fetchFn(docUrl, {
      method: "GET",
      headers: { Accept: "text/turtle, application/turtle" },
    });
  } catch {
    return [];
  }

  if (!response.ok) {
    if (response.status === 404) return [];
    throw new Error(`Failed to read locations: ${response.status}`);
  }

  const text = await response.text();
  if (!text.trim()) return [];

  const store = parseTurtle(text, docUrl);
  if (!store) return [];

  const profile = wrapVolunteerProfile(subjectIri, store, DataFactory);
  const locations: SavedLocation[] = [];
  for (const node of profile.locationNodes) {
    const lat = node.latitude;
    const lon = node.longitude;
    if (lat == null || lon == null) continue;
    const distanceM = node.distance ?? 10000;
    locations.push({
      id: `${lat.toFixed(5)},${lon.toFixed(5)}`,
      label: node.label ?? "",
      lat,
      lng: lon,
      radiusKm: distanceM / 1000,
    });
  }
  return locations;
}

/**
 * Writes locations to {pod}/volunteer/profile.ttl as blank nodes under hasLocation.
 * Each blank node stores lat, lon, distance (metres), and label.
 * Clears existing location nodes, preserving all other triples (skills, causes, etc.).
 */
export async function writeLocationsToPod(
  fetchFn: typeof fetch,
  podRoot: string,
  locations: SavedLocation[],
): Promise<void> {
  const { docUrl, subjectIri } = volunteerProfileDoc(podRoot);

  const store = new Store();
  const getRes = await fetchFn(docUrl, { method: "GET", headers: { Accept: "text/turtle" } });
  if (getRes.ok) {
    const text = await getRes.text();
    if (text.trim()) {
      const existing = parseTurtle(text, docUrl);
      if (existing) {
        for (const q of existing.getQuads(null, null, null, null)) {
          store.addQuad(q);
        }
      }
    }
  }

  const subjectNode = DataFactory.namedNode(subjectIri);
  if (store.getQuads(subjectNode, DataFactory.namedNode(RDF_TYPE), null, null).length === 0) {
    store.addQuad(subjectNode, DataFactory.namedNode(RDF_TYPE), DataFactory.namedNode(FOAF_PERSON));
  }

  const hasLocation = DataFactory.namedNode(VOLUNTEER_SCHEMA.hasLocation);
  const latPred = DataFactory.namedNode(VOLUNTEER_SCHEMA.latitude);
  const lonPred = DataFactory.namedNode(VOLUNTEER_SCHEMA.longitude);
  const distPred = DataFactory.namedNode(VOLUNTEER_SCHEMA.distance);
  const labelPred = DataFactory.namedNode(VOLUNTEER_SCHEMA.locationLabel);

  for (const q of store.getQuads(subjectNode, hasLocation, null, null)) {
    for (const prop of store.getQuads(q.object, null, null, null)) {
      store.removeQuad(prop);
    }
    store.removeQuad(q);
  }

  for (const loc of locations) {
    const bnode = DataFactory.blankNode();
    store.addQuad(subjectNode, hasLocation, bnode);
    store.addQuad(bnode, latPred, DataFactory.literal(String(loc.lat)));
    store.addQuad(bnode, lonPred, DataFactory.literal(String(loc.lng)));
    store.addQuad(bnode, distPred, DataFactory.literal(String(Math.round(loc.radiusKm * 1000))));
    if (loc.label) {
      store.addQuad(bnode, labelPred, DataFactory.literal(loc.label));
    }
  }

  const turtle = await serializeToTurtle(store);
  const putResponse = await fetchFn(docUrl, {
    method: "PUT",
    headers: { "Content-Type": "text/turtle" },
    body: turtle,
  });

  if (!putResponse.ok) {
    throw new Error(`Failed to write locations: ${putResponse.status}`);
  }
}
