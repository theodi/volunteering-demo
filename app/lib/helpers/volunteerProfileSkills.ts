/**
 * Volunteer extended profile (SRS FR-1.4, FR-1.9): read/write skills in the
 * volunteer profile document at {pod}/volunteer/profile.ttl using ontology
 * predicate hasSkill (concept URIs). Uses rdfjs-wrapper VolunteerProfileSkills
 * for clean RDF access; N3 for serialization and raw fetch for HTTP.
 *
 * All functions are pure async — caching and dedup are handled by React Query
 * at the hook layer.
 */

import { Parser, Writer, Store, DataFactory } from "n3";
import { wrapVolunteerProfileSkills } from "@/app/lib/class/VolunteerProfileSkills";

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
// Read / write skills
// ---------------------------------------------------------------------------

/**
 * Reads skill concept URIs from {pod}/volunteer/profile.ttl (hasSkill objects).
 * Uses rdfjs-wrapper VolunteerProfileSkills.skills (WrappingSet) for clean RDF access.
 */
export async function readSkillsFromPod(
  fetchFn: typeof fetch,
  podRoot: string,
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
    throw new Error(`Failed to read skills: ${response.status}`);
  }

  const text = await response.text();
  if (!text.trim()) return [];

  const store = parseTurtle(text, docUrl);
  if (!store) return [];

  const profile = wrapVolunteerProfileSkills(subjectIri, store, DataFactory);
  return [...profile.skills];
}

/**
 * Writes skill concept URIs to {pod}/volunteer/profile.ttl.
 * Uses rdfjs-wrapper WrappingSet.clear() + .add() to mutate the dataset,
 * then serializes and PUTs the full document.
 */
export async function writeSkillsToPod(
  fetchFn: typeof fetch,
  podRoot: string,
  skillUris: string[],
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

  const profile = wrapVolunteerProfileSkills(subjectIri, store, DataFactory);
  profile.skills.clear();
  for (const uri of skillUris) {
    const trimmed = uri.trim();
    if (trimmed) profile.skills.add(trimmed);
  }

  const turtle = await serializeToTurtle(store);
  const putResponse = await fetchFn(docUrl, {
    method: "PUT",
    headers: { "Content-Type": "text/turtle" },
    body: turtle,
  });

  if (!putResponse.ok) {
    throw new Error(`Failed to write skills: ${putResponse.status}`);
  }
}
