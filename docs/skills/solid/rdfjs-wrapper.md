# rdfjs-wrapper Usage in volunteering-demo

This document explains how the **rdfjs-wrapper** library is used in this codebase to read and write RDF data stored in Solid Pods. It covers the wrapper classes, vocabulary definitions, helper patterns, and concrete examples drawn from the actual source files.

---

## 1. Overview

### 1.1 What is rdfjs-wrapper?

[`rdfjs-wrapper`](https://www.npmjs.com/package/rdfjs-wrapper) is a small library that wraps RDF/JS datasets and terms in TypeScript classes. Instead of manually querying quads, you define **getter properties** on class subclasses that declaratively map RDF predicates to typed values.

### 1.2 How this project uses it

| Layer | What it does |
|-------|-------------|
| **Vocabulary constants** (`Vocabulary.ts`) | Centralises all RDF predicate/type IRIs in const objects. |
| **TermWrapper subclasses** (`Agent.ts`, `VolunteerProfile.ts`) | Wrap a single RDF subject and expose its properties as getters. |
| **DatasetWrapper subclasses** (`WebIdDataset.ts`, `VolunteerOntologyDataset`) | Wrap an entire RDF dataset and locate root subjects. |
| **N3 (`Parser`, `Store`, `Writer`, `DataFactory`)** | Parse Turtle → in-memory store, serialize store → Turtle. The wrapper reads *from* the store; N3 handles parsing and serialization. |

### 1.3 Dependencies

From `package.json`:

```json
{
  "n3": "^2.0.1",
  "rdfjs-wrapper": "^0.28.0"
}
```

- **n3** — Parse Turtle (`Parser`), in-memory quad store (`Store`), write Turtle (`Writer`), and `DataFactory` for creating RDF terms.
- **rdfjs-wrapper** — `TermWrapper`, `DatasetWrapper`, `ValueMapping`, `TermMapping`, `ObjectMapping`.

---

## 2. Vocabulary — centralised IRIs

**File:** `app/lib/class/Vocabulary.ts`

All RDF predicate and type IRIs are defined as `const` objects so they can be referenced by name throughout the codebase:

```ts
export const VP = {
  VolunteerProfile: "https://id.volunteeringdata.io/volunteer-profile/VolunteerProfile",
  hasSkill:         "https://id.volunteeringdata.io/volunteer-profile/hasSkill",
  preferredCause:   "https://id.volunteeringdata.io/volunteer-profile/preferredCause",
  hasRequirement:   "https://id.volunteeringdata.io/volunteer-profile/hasRequirement",
  preferredLocation:"https://id.volunteeringdata.io/volunteer-profile/preferredLocation",
  point:            "https://id.volunteeringdata.io/volunteer-profile/point",
  rad:              "https://id.volunteeringdata.io/volunteer-profile/rad",
  preferredTime:    "https://id.volunteeringdata.io/volunteer-profile/preferredTime",
  // ...
} as const;

export const FOAF  = { fname: "http://xmlns.com/foaf/0.1/name", /* ... */ } as const;
export const VCARD = { fn: "http://www.w3.org/2006/vcard/ns#fn", /* ... */ } as const;
export const PIM   = { storage: "http://www.w3.org/ns/pim/space#storage" } as const;
export const SOLID = { oidcIssuer: "http://www.w3.org/ns/solid/terms#oidcIssuer", /* ... */ } as const;
export const GEO   = { lat: "http://www.w3.org/2003/01/geo/wgs84_pos#lat", /* ... */ } as const;
export const RDFS  = { label: "http://www.w3.org/2000/01/rdf-schema#label" } as const;
```

**Convention:** Each standard vocabulary gets its own object. Custom ontology predicates go in `VP` (volunteer profile).

---

## 3. TermWrapper — wrapping a single RDF subject

### 3.1 Key API methods

| Method | Returns | Purpose |
|--------|---------|---------|
| `singularNullable(predicate, mapping)` | `T \| undefined` | Read a single value for a predicate. Returns `undefined` if no match or multiple. |
| `objects(predicate, readMapping, writeMapping)` | `Set<T>` | Read/write set of values. The set is live — `add()` / `delete()` / `clear()` mutate the underlying dataset. |

### 3.2 Mappings

| Mapping | Usage |
|---------|-------|
| `ValueMapping.literalToString` | Read a literal's string value. |
| `ValueMapping.iriToString` | Read a named node's IRI as a string. |
| `TermMapping.stringToIri` | Write a string back as a named node (IRI). |
| `ObjectMapping.as(SomeClass)` | Wrap the object node in a TermWrapper subclass. |

### 3.3 Example: Agent (WebID profile subject)

**File:** `app/lib/class/Agent.ts`

```ts
import { TermWrapper, ValueMapping, TermMapping, ObjectMapping } from "rdfjs-wrapper";
import { FOAF, PIM, SOLID, VCARD, SCHEMA } from "@/app/lib/class/Vocabulary";

class HasValue extends TermWrapper {
  get value(): string {
    const literal = this.singularNullable(VCARD.value, ValueMapping.literalToString);
    if (literal != null) return literal;
    const iri = this.singularNullable(VCARD.value, ValueMapping.iriToString);
    if (iri != null) return iri;
    return this.term.value;            // fallback to the node's own IRI
  }
}

export class Agent extends TermWrapper {
  // Simple literal getter
  get name(): string | null {
    return this.vcardFn ?? this.foafName ?? null;
  }

  get vcardFn(): string | undefined {
    return this.singularNullable(VCARD.fn, ValueMapping.literalToString);
  }

  // Nested object: wrap the email node in HasValue
  get hasEmail(): HasValue | undefined {
    return this.singularNullable(VCARD.hasEmail, ObjectMapping.as(HasValue));
  }

  get email(): string | null {
    return this.hasEmail?.value ?? null;
  }

  // IRI set (read + write)
  get pimStorage(): Set<string> {
    return this.objects(PIM.storage, ValueMapping.iriToString, TermMapping.stringToIri);
  }

  // Set of nested wrapper objects
  get telephones(): Set<HasValue> {
    return this.objects(
      VCARD.hasTelephone,
      ObjectMapping.as(HasValue),
      ObjectMapping.as(HasValue),
    );
  }

  // Social links via schema:sameAs
  get sameAs(): Set<string> {
    return this.objects(SCHEMA.sameAs, ValueMapping.iriToString, TermMapping.stringToIri);
  }
}
```

**Key patterns:**

1. **`singularNullable`** for 0-or-1 values (name, email, phone).
2. **`objects`** for 0-to-many values (storage URLs, social links, knows).
3. **`ObjectMapping.as(SubClass)`** for nested structures (vCard email → `HasValue` → `.value`).
4. **Fallback chains** — `Agent.name` tries `vcardFn`, then `foafName`, then extracts from the IRI.

### 3.4 Example: VolunteerProfile (profile data in Pod)

**File:** `app/lib/class/VolunteerProfile.ts`

```ts
import { TermWrapper, ValueMapping, TermMapping, ObjectMapping } from "rdfjs-wrapper";
import { VP, GEO, RDFS } from "@/app/lib/class/Vocabulary";

class PointNode extends TermWrapper {
  get lat(): number | null {
    const v = this.singularNullable(GEO.lat, ValueMapping.literalToString);
    return v != null ? Number(v) : null;
  }
  get long(): number | null {
    const v = this.singularNullable(GEO.long, ValueMapping.literalToString);
    return v != null ? Number(v) : null;
  }
}

class PreferredLocationNode extends TermWrapper {
  // Nested object: wrap the point blank node
  get point(): PointNode | null {
    return this.singularNullable(VP.point, ObjectMapping.as(PointNode)) ?? null;
  }
  get rad(): number | null {
    const v = this.singularNullable(VP.rad, ValueMapping.literalToString);
    return v != null ? Number(v) : null;
  }
  get label(): string | null {
    return this.singularNullable(RDFS.label, ValueMapping.literalToString) ?? null;
  }
}

export class VolunteerProfile extends TermWrapper {
  // Simple IRI sets (read + write via .add/.delete/.clear)
  get skills(): Set<string> {
    return this.objects(VP.hasSkill, ValueMapping.iriToString, TermMapping.stringToIri);
  }
  get causes(): Set<string> {
    return this.objects(VP.preferredCause, ValueMapping.iriToString, TermMapping.stringToIri);
  }
  get equipment(): Set<string> {
    return this.objects(VP.hasRequirement, ValueMapping.iriToString, TermMapping.stringToIri);
  }

  // Nested objects (read-only in the wrapper; manual N3 for writes)
  get locationNodes(): Set<PreferredLocationNode> {
    return this.objects(
      VP.preferredLocation,
      ObjectMapping.as(PreferredLocationNode),
      ObjectMapping.as(PreferredLocationNode),
    );
  }

  get preferredTimes(): Set<string> {
    return this.objects(VP.preferredTime, ValueMapping.iriToString, TermMapping.stringToIri);
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
```

**Key insight:** For simple IRI-based properties (skills, causes, equipment, times), the wrapper's live `Set` is used for both reading and writing — call `set.clear()` then `set.add(uri)` and the underlying N3 Store is mutated. For complex structured data (locations, credentials), the wrapper is used for **reading only**, and writes are done with raw N3 `DataFactory` + `Store` operations.

### 3.5 Example: SKOS concepts (ontology parsing)

**File:** `app/lib/volunteerOntology.ts`

```ts
import { TermWrapper, DatasetWrapper, ValueMapping } from "rdfjs-wrapper";

const SKOS = {
  prefLabel: "http://www.w3.org/2004/02/skos/core#prefLabel",
  broader:   "http://www.w3.org/2004/02/skos/core#broader",
};

class SkosConcept extends TermWrapper {
  get label(): string | undefined {
    return this.singularNullable(SKOS.prefLabel, ValueMapping.literalToString);
  }
}

class ConceptWithBroader extends SkosConcept {
  get categoryIri(): string | undefined {
    return this.singularNullable(SKOS.broader, ValueMapping.iriToString);
  }
  get categoryLabel(): string | undefined {
    const iri = this.categoryIri;
    if (!iri) return undefined;
    // Create a new wrapper for the broader concept to get its label
    const category = new SkosConcept(
      this.factory.namedNode(iri),
      this.dataset,
      this.factory,
    );
    return category.label;
  }
}
```

**Key pattern:** You can instantiate wrapper classes *inside* other wrapper getters to follow RDF links. Here, `ConceptWithBroader.categoryLabel` creates a new `SkosConcept` wrapper for the broader concept to read its `skos:prefLabel`.

---

## 4. DatasetWrapper — wrapping an entire RDF dataset

### 4.1 Key API methods

| Method | Returns | Purpose |
|--------|---------|---------|
| `subjectsOf(predicate, WrapperClass)` | `Iterable<T>` | Find all subjects that have the given predicate and wrap each in `WrapperClass`. |
| `instancesOf(typeIri, WrapperClass)` | `Iterable<T>` | Find all subjects of a given `rdf:type` and wrap each. |

### 4.2 Example: WebIdDataset

**File:** `app/lib/class/WebIdDataset.ts`

```ts
import { DatasetWrapper } from "rdfjs-wrapper";
import { Agent } from "@/app/lib/class/Agent";
import { SOLID } from "@/app/lib/class/Vocabulary";

export class WebIdDataset extends DatasetWrapper {
  get mainSubject(): Agent | undefined {
    for (const s of this.subjectsOf(SOLID.oidcIssuer, Agent)) {
      return s;   // return the first subject that has solid:oidcIssuer
    }
    return undefined;
  }
}
```

**Usage in `profileUtils.ts`:**

```ts
const store = new Store();
store.addQuads(new Parser({ baseIRI: docUrl }).parse(content));
const agent = new WebIdDataset(store, DataFactory).mainSubject;
// agent.name, agent.email, agent.storageUrls, ...
```

### 4.3 Example: VolunteerOntologyDataset

**File:** `app/lib/volunteerOntology.ts`

```ts
class VolunteerOntologyDataset extends DatasetWrapper {
  get conceptsWithBroader(): Iterable<ConceptWithBroader> {
    return this.subjectsOf(SKOS.broader, ConceptWithBroader);
  }
}
```

This finds every SKOS concept that has a `skos:broader` link and wraps it in `ConceptWithBroader`, giving you `.label`, `.categoryIri`, `.categoryLabel` on each.

---

## 5. N3 — parsing, storing, and serializing RDF

The wrapper provides the **reading abstraction**; N3 provides the **plumbing**.

### 5.1 Parsing Turtle → N3 Store

```ts
import { Parser, Store, DataFactory } from "n3";

function parseTurtle(content: string, baseIRI: string): Store | null {
  const store = new Store();
  try {
    store.addQuads(new Parser({ baseIRI }).parse(content));
    return store;
  } catch {
    return null;
  }
}
```

### 5.2 Serializing N3 Store → Turtle

```ts
import { Writer, Store } from "n3";

function serializeToTurtle(store: Store): Promise<string> {
  const writer = new Writer({
    prefixes: {
      vp:           "https://id.volunteeringdata.io/volunteer-profile/",
      volunteering: "https://ns.volunteeringdata.io/",
      rdf:          "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
      rdfs:         "http://www.w3.org/2000/01/rdf-schema#",
      xsd:          "http://www.w3.org/2001/XMLSchema#",
      geo:          "http://www.w3.org/2003/01/geo/wgs84_pos#",
    },
  });
  for (const q of store.getQuads(null, null, null, null)) {
    writer.addQuad(q);
  }
  return new Promise<string>((resolve, reject) => {
    writer.end((err, result) => (err ? reject(err) : resolve(result ?? "")));
  });
}
```

### 5.3 Reading with the wrapper + N3

```ts
const store = parseTurtle(text, docUrl);
const profile = wrapVolunteerProfile(subjectIri, store, DataFactory);
const skills: string[] = [...profile.skills];     // reads vp:hasSkill quads
```

### 5.4 Writing simple IRI properties (via wrapper's live Set)

For properties that are simple IRI lists (skills, causes, equipment, times):

```ts
const profile = wrapVolunteerProfile(subjectIri, store, DataFactory);
const set: Set<string> = profile.skills;
set.clear();                          // removes all vp:hasSkill quads
for (const uri of newUris) {
  set.add(uri);                       // adds vp:hasSkill <uri> quads
}
const turtle = await serializeToTurtle(store);   // serialize the mutated store
```

### 5.5 Writing structured data (manual N3 DataFactory)

For complex structures like locations and credentials that use blank nodes, the wrapper is only used for reading. Writes are done directly with N3:

```ts
import { DataFactory, Store } from "n3";

const subjectNode = DataFactory.namedNode(subjectIri);
const locBNode    = DataFactory.blankNode();
const ptBNode     = DataFactory.blankNode();

// Add the location blank node graph
store.addQuad(subjectNode, DataFactory.namedNode(VP.preferredLocation), locBNode);
store.addQuad(locBNode, DataFactory.namedNode(RDF_TYPE), DataFactory.namedNode(VP.PreferredLocation));
store.addQuad(locBNode, DataFactory.namedNode(VP.point), ptBNode);
store.addQuad(locBNode, DataFactory.namedNode(VP.rad), DataFactory.literal("10"));
store.addQuad(locBNode, DataFactory.namedNode(RDFS.label), DataFactory.literal("London"));
store.addQuad(ptBNode, DataFactory.namedNode(GEO.lat), DataFactory.literal("51.5"));
store.addQuad(ptBNode, DataFactory.namedNode(GEO.long), DataFactory.literal("-0.1"));
```

### 5.6 Removing structured data (manual N3 Store operations)

Before rewriting, you remove existing blank node subgraphs:

```ts
const prefLocPred = DataFactory.namedNode(VP.preferredLocation);
const pointPred   = DataFactory.namedNode(VP.point);

for (const locQuad of store.getQuads(subjectNode, prefLocPred, null, null)) {
  const locBNode = locQuad.object;
  // Remove nested point blank node triples
  for (const ptQuad of store.getQuads(locBNode, pointPred, null, null)) {
    for (const ptProp of store.getQuads(ptQuad.object, null, null, null)) {
      store.removeQuad(ptProp);
    }
  }
  // Remove location blank node triples
  for (const locProp of store.getQuads(locBNode, null, null, null)) {
    store.removeQuad(locProp);
  }
  store.removeQuad(locQuad);
}
```

---

## 6. Complete data flow: reading and writing to a Solid Pod

### 6.1 Document structure

All volunteer profile data lives in a single Turtle document:

```
{podRoot}/volunteer/profile.ttl
```

Subject IRI: `{podRoot}/volunteer/profile.ttl#me`

Example Turtle output:

```turtle
@prefix vp: <https://id.volunteeringdata.io/volunteer-profile/> .
@prefix volunteering: <https://ns.volunteeringdata.io/> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
@prefix geo: <http://www.w3.org/2003/01/geo/wgs84_pos#> .

<#me> a vp:VolunteerProfile ;
    vp:hasSkill volunteering:FirstAid, volunteering:Driving ;
    vp:preferredCause volunteering:Environment, volunteering:Education ;
    vp:preferredTime volunteering:MondayMorning, volunteering:WednesdayEvening ;
    vp:preferredLocation _:loc1 ;
    vp:hasCredential _:cred1 .

_:loc1 a vp:PreferredLocation ;
    vp:point _:pt1 ;
    vp:rad "10" ;
    rdfs:label "London" .

_:pt1 a vp:Point ;
    geo:lat "51.5" ;
    geo:long "-0.1" .

_:cred1 a vp:Credential ;
    vp:credentialType volunteering:DBSCheck ;
    vp:credentialIssuer <https://www.gov.uk/...> ;
    vp:credentialTitle "UK DBS Check" ;
    vp:credentialStatus "collect" ;
    vp:credentialIssuedAt "2026-03-24T11:00:00Z"^^xsd:dateTime ;
    rdfs:label "Disclosure and Barring Service GOV.UK" .
```

### 6.2 Read flow

```
1. HTTP GET  {podRoot}/volunteer/profile.ttl  (with authenticated fetch)
2. Parse response text → N3 Store  (parseTurtle)
3. Wrap store in TermWrapper       (wrapVolunteerProfile)
4. Read properties via getters     (profile.skills, profile.locationNodes, etc.)
```

### 6.3 Write flow (simple IRIs)

```
1. HTTP GET  existing document → parse into N3 Store
2. Wrap store with VolunteerProfile
3. Mutate the live Set: set.clear() + set.add(uri)
4. Serialize store → Turtle         (serializeToTurtle)
5. HTTP PUT  the new Turtle back    (Content-Type: text/turtle)
```

### 6.4 Write flow (structured blank nodes)

```
1. HTTP GET  existing document → parse into N3 Store
2. Remove old blank node subgraphs  (store.getQuads + store.removeQuad)
3. Add new blank nodes + triples    (DataFactory.blankNode + store.addQuad)
4. Serialize store → Turtle         (serializeToTurtle)
5. HTTP PUT  the new Turtle back    (Content-Type: text/turtle)
```

### 6.5 Reading the WebID profile

```
1. HTTP GET  webId document  (text/turtle)
2. Parse → N3 Store
3. Wrap with WebIdDataset → .mainSubject → Agent
4. Read: agent.name, agent.email, agent.storageUrls, agent.photoUrl, ...
```

---

## 7. Helper file structure

**File:** `app/lib/helpers/volunteerProfileSkills.ts`

This single file is the central helper for all volunteer profile read/write operations. It contains:

| Section | Functions | Data shape |
|---------|-----------|------------|
| **Shared utilities** | `volunteerProfileDoc()`, `parseTurtle()`, `serializeToTurtle()` | — |
| **Generic read/write** | `readPropertyFromPod()`, `writePropertyToPod()` | Simple IRI arrays via `VolunteerProfile` wrapper |
| **Skills** | `readSkillsFromPod()`, `writeSkillsToPod()` | `string[]` of skill IRIs |
| **Causes** | `readCausesFromPod()`, `writeCausesToPod()` | `string[]` of cause IRIs |
| **Equipment** | `readEquipmentFromPod()`, `writeEquipmentToPod()` | `string[]` of equipment IRIs |
| **Locations** | `readLocationsFromPod()`, `writeLocationsToPod()` | `SavedLocation[]` (blank nodes) |
| **Availability** | `readTimesFromPod()`, `writeTimesToPod()`, `slotsToTimeIris()`, `timeIrisToSlots()` | Composed time IRIs ↔ scheduler slots |
| **Credentials** | `readCredentialsFromPod()`, `writeCredentialToPod()`, `updateCredentialStatusInPod()` | `PodCredential[]` (blank nodes) |

**File:** `app/lib/helpers/profileUtils.ts`

Fetches and parses the WebID profile document into an `Agent`:

```ts
export async function fetchAndParseProfile(
  webId: string,
  fetchFn: typeof fetch = fetch,
): Promise<Agent | null> {
  const docUrl = webId.split("#")[0];
  const res = await fetchFn(docUrl, {
    headers: { Accept: "text/turtle, application/turtle, text/n3, application/n3" },
  });
  const content = await res.text();
  const store = new Store();
  store.addQuads(new Parser({ baseIRI: docUrl }).parse(content));
  return new WebIdDataset(store, DataFactory).mainSubject ?? null;
}
```

---

## 8. Adding a new property to the volunteer profile

### Step 1: Add vocabulary IRIs

In `Vocabulary.ts`, add the new predicate(s) to the `VP` object:

```ts
export const VP = {
  // ...existing
  hasLanguage: "https://id.volunteeringdata.io/volunteer-profile/hasLanguage",
} as const;
```

### Step 2a: Simple IRI property

Add a getter to `VolunteerProfile`:

```ts
get languages(): Set<string> {
  return this.objects(VP.hasLanguage, ValueMapping.iriToString, TermMapping.stringToIri);
}
```

Then add `"languages"` to the `ProfileProperty` union type in `volunteerProfileSkills.ts` and export `readLanguagesFromPod` / `writeLanguagesToPod` following the existing pattern.

### Step 2b: Structured blank node property

Add a read-only getter to `VolunteerProfile` using `ObjectMapping.as(YourNodeClass)`, then write manual N3 read/write functions in `volunteerProfileSkills.ts` following the locations or credentials pattern.

### Step 3: Create a hook

Follow the pattern in any `useVolunteerProfile*.ts` hook — use `useSolidAuth()` for the authenticated fetch, `usePodRoot()` for the Pod URL, and React Query for caching.

---

## 9. Summary of patterns

| Pattern | When to use | Example |
|---------|------------|---------|
| `singularNullable(pred, ValueMapping)` | 0-or-1 literal/IRI value | `agent.name`, `location.label` |
| `objects(pred, ValueMapping, TermMapping)` | 0-to-many IRI values (read + write) | `profile.skills`, `agent.pimStorage` |
| `objects(pred, ObjectMapping.as(Class))` | 0-to-many nested objects | `profile.locationNodes`, `agent.telephones` |
| `DatasetWrapper.subjectsOf(pred, Class)` | Find root subjects in a dataset | `WebIdDataset.mainSubject` |
| `DatasetWrapper.instancesOf(type, Class)` | Find subjects by rdf:type | Not used here, but available |
| Manual N3 `DataFactory` + `Store` | Write structured blank node graphs | Locations, credentials |
| `parseTurtle()` + `serializeToTurtle()` | Round-trip Turtle to/from N3 Store | All Pod read/write operations |
