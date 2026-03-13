import { Parser, Store, DataFactory } from "n3";
import { WebIdDataset } from "@/app/lib/class/WebIdDataset";
import type { Agent } from "@/app/lib/class/Agent";

const profileCache = new Map<string, Agent>();

function parseTurtleIntoStore(content: string, baseUrl: string, store: Store): void {
  const parser = new Parser({ baseIRI: baseUrl });
  store.addQuads(parser.parse(content));
}

/**
 * Fetches and parses the WebID profile document (solid-file-manager style with rdfjs-wrapper).
 * Uses session fetch when provided for authenticated requests.
 */
export async function fetchAndParseProfile(
  webId: string,
  fetchFn: typeof fetch = fetch
): Promise<Agent | null> {
  if (profileCache.has(webId)) {
    return profileCache.get(webId) ?? null;
  }

  const acceptHeaders = [
    "text/turtle, application/turtle, text/n3, application/n3",
    "text/turtle",
    "application/ld+json",
  ];

  let content: string | null = null;
  let contentType = "";

  for (const acceptHeader of acceptHeaders) {
    try {
      const response = await fetchFn(webId, {
        method: "GET",
        headers: { Accept: acceptHeader },
      });

      if (response.ok) {
        contentType = response.headers.get("content-type") ?? "";
        content = await response.text();
        break;
      }
    } catch {
      continue;
    }
  }

  if (!content) {
    return null;
  }

  const store = new Store();
  const baseUrl = webId.split("#")[0];

  const isTurtle =
    contentType.includes("text/turtle") ||
    contentType.includes("application/turtle") ||
    contentType.includes("text/n3") ||
    contentType.includes("application/n3");
  const isJsonLd = contentType.includes("application/ld+json");

  if (isTurtle) {
    parseTurtleIntoStore(content, baseUrl, store);
  } else {
    try {
      parseTurtleIntoStore(content, baseUrl, store);
    } catch {
      if (!isJsonLd) return null;
    }
  }

  const webIdDataset = new WebIdDataset(store, DataFactory);
  const mainSubject = webIdDataset.mainSubject;

  if (mainSubject) {
    profileCache.set(webId, mainSubject);
  }

  return mainSubject ?? null;
}

export function clearProfileCache(webId?: string): void {
  if (webId) {
    profileCache.delete(webId);
  } else {
    profileCache.clear();
  }
}
