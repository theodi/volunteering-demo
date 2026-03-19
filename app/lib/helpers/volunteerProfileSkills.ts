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
import { VP, GEO, RDFS, VOLUNTEERING_NS } from "@/app/lib/class/Vocabulary";
import type { SavedLocation } from "@/app/components/volunteer-info/PreferredLocations";

const RDF_TYPE = "http://www.w3.org/1999/02/22-rdf-syntax-ns#type";

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
      volunteering: "https://ns.volunteeringdata.io/",
      rdf: "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
      rdfs: "http://www.w3.org/2000/01/rdf-schema#",
      geo: "http://www.w3.org/2003/01/geo/wgs84_pos#",
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

type ProfileProperty = "skills" | "causes" | "equipment" | "preferredTimes";

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
    store.addQuad(subjectNode, DataFactory.namedNode(RDF_TYPE), DataFactory.namedNode(VP.VolunteerProfile));
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
 * Structure follows the volunteer-profile ontology:
 *   <#me> vp:preferredLocation _:loc.
 *   _:loc a vp:PreferredLocation; vp:point _:pt; vp:rad "10"; rdfs:label "...".
 *   _:pt a vp:Point; geo:lat "51.5"; geo:long "-0.1".
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
  for (const locNode of profile.locationNodes) {
    const pt = locNode.point;
    if (!pt) continue;
    const lat = pt.lat;
    const lon = pt.long;
    if (lat == null || lon == null) continue;
    locations.push({
      id: `${lat.toFixed(5)},${lon.toFixed(5)}`,
      label: locNode.label ?? "",
      lat,
      lng: lon,
      radiusKm: locNode.rad ?? 10,
    });
  }
  return locations;
}

/**
 * Writes locations to {pod}/volunteer/profile.ttl following the volunteer-profile ontology:
 *   <#me> vp:preferredLocation _:loc.
 *   _:loc a vp:PreferredLocation; vp:point _:pt; vp:rad "10"; rdfs:label "...".
 *   _:pt a vp:Point; geo:lat "51.5"; geo:long "-0.1".
 *
 * Clears existing location nodes (and their nested points), preserving other triples.
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
    store.addQuad(subjectNode, DataFactory.namedNode(RDF_TYPE), DataFactory.namedNode(VP.VolunteerProfile));
  }

  const prefLocPred = DataFactory.namedNode(VP.preferredLocation);
  const pointPred = DataFactory.namedNode(VP.point);

  // Remove existing location graphs: for each preferredLocation blank node,
  // remove its nested point blank node's triples, then the location's own triples.
  for (const locQuad of store.getQuads(subjectNode, prefLocPred, null, null)) {
    const locBNode = locQuad.object;
    for (const ptQuad of store.getQuads(locBNode, pointPred, null, null)) {
      for (const ptProp of store.getQuads(ptQuad.object, null, null, null)) {
        store.removeQuad(ptProp);
      }
    }
    for (const locProp of store.getQuads(locBNode, null, null, null)) {
      store.removeQuad(locProp);
    }
    store.removeQuad(locQuad);
  }

  const rdfType = DataFactory.namedNode(RDF_TYPE);
  const prefLocType = DataFactory.namedNode(VP.PreferredLocation);
  const pointType = DataFactory.namedNode(VP.Point);
  const radPred = DataFactory.namedNode(VP.rad);
  const labelPred = DataFactory.namedNode(RDFS.label);
  const latPred = DataFactory.namedNode(GEO.lat);
  const lonPred = DataFactory.namedNode(GEO.long);

  for (const loc of locations) {
    const locBNode = DataFactory.blankNode();
    const ptBNode = DataFactory.blankNode();

    store.addQuad(subjectNode, prefLocPred, locBNode);
    store.addQuad(locBNode, rdfType, prefLocType);
    store.addQuad(locBNode, pointPred, ptBNode);
    store.addQuad(locBNode, radPred, DataFactory.literal(String(loc.radiusKm)));
    if (loc.label) {
      store.addQuad(locBNode, labelPred, DataFactory.literal(loc.label));
    }

    store.addQuad(ptBNode, rdfType, pointType);
    store.addQuad(ptBNode, latPred, DataFactory.literal(String(loc.lat)));
    store.addQuad(ptBNode, lonPred, DataFactory.literal(String(loc.lng)));
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

// ---------------------------------------------------------------------------
// Public API — availability (PreferredTime as composed IRIs)
// ---------------------------------------------------------------------------

const DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] as const;
const PERIOD_NAMES = ["Morning", "Afternoon", "Evening"] as const;

const PERIOD_HOURS: Record<string, number[]> = {
  Morning: [6, 7, 8, 9, 10, 11],
  Afternoon: [12, 13, 14, 15, 16, 17],
  Evening: [18, 19, 20, 21, 22, 23, 0],
};

const TIME_IRI_LOOKUP = new Map<string, { dayIdx: number; hours: number[] }>();
for (let d = 0; d < 7; d++) {
  for (const period of PERIOD_NAMES) {
    TIME_IRI_LOOKUP.set(`${VOLUNTEERING_NS}${DAY_NAMES[d]}${period}`, { dayIdx: d, hours: PERIOD_HOURS[period] });
  }
}

/**
 * Converts scheduler slot keys ("dayIdx-hour") to composed time IRIs
 * (e.g. https://ns.volunteeringdata.io/MondayMorning).
 */
export function slotsToTimeIris(slots: Set<string>): string[] {
  const result: string[] = [];
  for (let dayIdx = 0; dayIdx < 7; dayIdx++) {
    for (const period of PERIOD_NAMES) {
      if (PERIOD_HOURS[period].some((h) => slots.has(`${dayIdx}-${h}`))) {
        result.push(`${VOLUNTEERING_NS}${DAY_NAMES[dayIdx]}${period}`);
      }
    }
  }
  return result;
}

/**
 * Expands composed time IRIs back into scheduler slot keys.
 */
export function timeIrisToSlots(iris: string[]): Set<string> {
  const slots = new Set<string>();
  for (const iri of iris) {
    const entry = TIME_IRI_LOOKUP.get(iri);
    if (!entry) continue;
    for (const h of entry.hours) {
      slots.add(`${entry.dayIdx}-${h}`);
    }
  }
  return slots;
}

/**
 * Reads preferred times from {pod}/volunteer/profile.ttl and returns
 * scheduler slot keys (Set<"dayIdx-hour">).
 */
export async function readTimesFromPod(
  fetchFn: typeof fetch,
  podRoot: string,
): Promise<Set<string>> {
  const iris = await readPropertyFromPod(fetchFn, podRoot, "preferredTimes");
  return timeIrisToSlots(iris);
}

/**
 * Writes preferred times to {pod}/volunteer/profile.ttl as composed IRIs:
 *   <#me> vp:preferredTime volunteering:MondayMorning, volunteering:WednesdayEvening .
 */
export async function writeTimesToPod(
  fetchFn: typeof fetch,
  podRoot: string,
  slots: Set<string>,
): Promise<void> {
  await writePropertyToPod(fetchFn, podRoot, "preferredTimes", slotsToTimeIris(slots));
}
