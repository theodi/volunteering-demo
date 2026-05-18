import { Parser, Store, DataFactory } from "n3";
import { Agent } from "@/app/lib/class/Agent";

/**
 * Fetches the WebID profile document, parses it as Turtle, and returns the
 * Agent wrapping that WebID subject.
 *
 * Throws if the fetch or parse fails — the WebID is required for the app.
 * Caching and dedup are handled by React Query (useAgent hook).
 */
export async function fetchAndParseProfile(
  webId: string,
  fetchFn: typeof fetch = fetch,
): Promise<Agent> {
  const res = await fetchFn(webId, {
    method: "GET",
    headers: { Accept: "text/turtle, application/turtle, text/n3, application/n3" },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch WebID profile: ${res.status}`);
  }

  const content = await res.text();
  const store = new Store();
  store.addQuads(new Parser({ baseIRI: webId }).parse(content));

  return new Agent(DataFactory.namedNode(webId), store, DataFactory);
}
