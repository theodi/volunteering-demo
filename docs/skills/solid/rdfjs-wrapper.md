# @rdfjs/wrapper Usage in volunteering-demo

This document explains how the **rdfjs-wrapper** library is used in this codebase to read and write RDF data stored in Solid Pods. It covers the wrapper classes, vocabulary definitions, helper patterns, and concrete examples drawn from the actual source files.

---

## 1. Overview

### 1.1 What is @rdfjs/wrapper?

[`@rdfjs/wrapper`](https://www.npmjs.com/package/@rdfjs/wrapper) is a small library that wraps RDF/JS datasets and terms in TypeScript classes. Instead of manually querying quads, you define **getter properties** on class subclasses that declaratively map RDF predicates to typed values.

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
  "@rdfjs/wrapper": "^0.32.0"
}
```

- **n3** — Parse Turtle (`Parser`), in-memory quad store (`Store`), write Turtle (`Writer`), and `DataFactory` for creating RDF terms.
- **@rdfjs/wrapper** — `TermWrapper`, `DatasetWrapper`, `LiteralAs`, `NamedNodeAs`, `NamedNodeFrom`, `TermAs`, `TermFrom`.

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

### 3.2 Mappings (v0.32+)

| Mapping | Usage |
|---------|-------|
| `LiteralAs.string` | Read a literal's string value. |
| `NamedNodeAs.string` | Read a named node's IRI as a string. |
| `NamedNodeFrom.string` | Write a string back as a named node (IRI). |
| `TermAs.instance(SomeClass)` | Wrap the object node in a TermWrapper subclass (getter). |
| `TermFrom.instance` | Write back a TermWrapper instance (setter / set write mapping). |

**Migration from old API (< v0.29):**

| Old | New |
|-----|-----|
| `ValueMapping.literalToString` | `LiteralAs.string` |
| `ValueMapping.literalToNumber` | `LiteralAs.number` |
| `ValueMapping.literalToDate` | `LiteralAs.date` |
| `ValueMapping.iriToString` | `NamedNodeAs.string` |
| `TermMapping.stringToIri` | `NamedNodeFrom.string` |
| `ObjectMapping.as(Class)` (getter) | `TermAs.instance(Class)` |
| `ObjectMapping.as(Class)` (setter) | `TermFrom.instance` |
| `this.term.value` | `this.value` |

### 3.3 Example: Agent (WebID profile subject)

**File:** `app/lib/class/Agent.ts`

```ts
import { TermWrapper, LiteralAs, NamedNodeAs, NamedNodeFrom, TermAs, TermFrom } from "@rdfjs/wrapper";
import { FOAF, PIM, SOLID, VCARD, SCHEMA } from "@/app/lib/class/Vocabulary";

class HasValue extends TermWrapper {
  get actualValue(): string {
    return this.singularNullable(VCARD.value, LiteralAs.string) ?? this.value;
  }
}

export class Agent extends TermWrapper {
  get vcardFn(): string | undefined {
    return this.singularNullable(VCARD.fn, LiteralAs.string);
  }

  get hasEmail(): HasValue | undefined {
    return this.singularNullable(VCARD.hasEmail, TermAs.instance(HasValue));
  }

  get email(): string | null {
    return this.hasEmail?.actualValue ?? null;
  }

  get pimStorage(): Set<string> {
    return this.objects(PIM.storage, NamedNodeAs.string, NamedNodeFrom.string);
  }

  get telephones(): Set<HasValue> {
    return this.objects(VCARD.hasTelephone, TermAs.instance(HasValue), TermFrom.instance);
  }

  get sameAs(): Set<string> {
    return this.objects(SCHEMA.sameAs, NamedNodeAs.string, NamedNodeFrom.string);
  }
}
```

**Key patterns:**

1. **`singularNullable`** for 0-or-1 values (name, email, phone).
2. **`objects`** for 0-to-many values (storage URLs, social links, knows).
3. **`TermAs.instance(SubClass)`** for nested structures (vCard email → `HasValue` → `.actualValue`).
4. **Fallback chains** — `Agent.name` tries `vcardFn`, then `foafName`, then extracts from the IRI.

### 3.4 Example: VolunteerProfile (profile data in Pod)

**File:** `app/lib/class/VolunteerProfile.ts`

```ts
import { TermWrapper, LiteralAs, NamedNodeAs, NamedNodeFrom, TermAs, TermFrom } from "@rdfjs/wrapper";
import { VP, GEO, RDFS } from "@/app/lib/class/Vocabulary";

class PointNode extends TermWrapper {
  get lat(): number | null {
    const v = this.singularNullable(GEO.lat, LiteralAs.string);
    return v != null ? Number(v) : null;
  }
  get long(): number | null {
    const v = this.singularNullable(GEO.long, LiteralAs.string);
    return v != null ? Number(v) : null;
  }
}

class PreferredLocationNode extends TermWrapper {
  get point(): PointNode | null {
    return this.singularNullable(VP.point, TermAs.instance(PointNode)) ?? null;
  }
  get rad(): number | null {
    const v = this.singularNullable(VP.rad, LiteralAs.string);
    return v != null ? Number(v) : null;
  }
  get label(): string | null {
    return this.singularNullable(RDFS.label, LiteralAs.string) ?? null;
  }
}

export class VolunteerProfile extends TermWrapper {
  get skills(): Set<string> {
    return this.objects(VP.hasSkill, NamedNodeAs.string, NamedNodeFrom.string);
  }
  get causes(): Set<string> {
    return this.objects(VP.preferredCause, NamedNodeAs.string, NamedNodeFrom.string);
  }
  get equipment(): Set<string> {
    return this.objects(VP.hasRequirement, NamedNodeAs.string, NamedNodeFrom.string);
  }

  get locationNodes(): Set<PreferredLocationNode> {
    return this.objects(
      VP.preferredLocation,
      TermAs.instance(PreferredLocationNode),
      TermFrom.instance,
    );
  }

  get preferredTimes(): Set<string> {
    return this.objects(VP.preferredTime, NamedNodeAs.string, NamedNodeFrom.string);
  }
}
```

### 3.5 Example: SKOS concepts (ontology parsing)

**File:** `app/lib/volunteerOntology.ts`

```ts
import { TermWrapper, DatasetWrapper, LiteralAs, NamedNodeAs } from "@rdfjs/wrapper";

const SKOS = {
  prefLabel: "http://www.w3.org/2004/02/skos/core#prefLabel",
  broader:   "http://www.w3.org/2004/02/skos/core#broader",
};

class SkosConcept extends TermWrapper {
  get label(): string | undefined {
    return this.singularNullable(SKOS.prefLabel, LiteralAs.string);
  }
}

class ConceptWithBroader extends SkosConcept {
  get categoryIri(): string | undefined {
    return this.singularNullable(SKOS.broader, NamedNodeAs.string);
  }
  get categoryLabel(): string | undefined {
    const iri = this.categoryIri;
    if (!iri) return undefined;
    const category = new SkosConcept(
      this.factory.namedNode(iri),
      this.dataset,
      this.factory,
    );
    return category.label;
  }
}
```

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
import { DatasetWrapper } from "@rdfjs/wrapper";
import { Agent } from "@/app/lib/class/Agent";
import { SOLID } from "@/app/lib/class/Vocabulary";

export class WebIdDataset extends DatasetWrapper {
  get mainSubject(): Agent | undefined {
    for (const s of this.subjectsOf(SOLID.oidcIssuer, Agent)) {
      return s;
    }
    return undefined;
  }
}
```

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

For complex structures like locations that use blank nodes, the wrapper is only used for reading. Writes are done directly with N3:

```ts
import { DataFactory, Store } from "n3";

const subjectNode = DataFactory.namedNode(subjectIri);
const locBNode    = DataFactory.blankNode();
const ptBNode     = DataFactory.blankNode();

store.addQuad(subjectNode, DataFactory.namedNode(VP.preferredLocation), locBNode);
store.addQuad(locBNode, DataFactory.namedNode(RDF_TYPE), DataFactory.namedNode(VP.PreferredLocation));
store.addQuad(locBNode, DataFactory.namedNode(VP.point), ptBNode);
store.addQuad(locBNode, DataFactory.namedNode(VP.rad), DataFactory.literal("10"));
store.addQuad(locBNode, DataFactory.namedNode(RDFS.label), DataFactory.literal("London"));
store.addQuad(ptBNode, DataFactory.namedNode(GEO.lat), DataFactory.literal("51.5"));
store.addQuad(ptBNode, DataFactory.namedNode(GEO.long), DataFactory.literal("-0.1"));
```

---

## 6. Adding a new property to the volunteer profile

### Step 1: Add vocabulary IRIs

In `Vocabulary.ts`, add the new predicate(s) to the `VP` object.

### Step 2a: Simple IRI property

Add a getter to `VolunteerProfile`:

```ts
get languages(): Set<string> {
  return this.objects(VP.hasLanguage, NamedNodeAs.string, NamedNodeFrom.string);
}
```

Then add `"languages"` to the `ProfileProperty` union type in `volunteerProfileSkills.ts` and export `readLanguagesFromPod` / `writeLanguagesToPod` following the existing pattern.

### Step 2b: Structured blank node property

Add a read-only getter to `VolunteerProfile` using `TermAs.instance(YourNodeClass)`, then write manual N3 read/write functions in `volunteerProfileSkills.ts` following the locations pattern.

### Step 3: Create a hook

Follow the pattern in any `useVolunteerProfile*.ts` hook — use `useSolidAuth()` for the authenticated fetch, `usePodRoot()` for the Pod URL, and React Query for caching.

---

## 7. Summary of patterns

| Pattern | When to use | Example |
|---------|------------|---------|
| `singularNullable(pred, LiteralAs.string)` | 0-or-1 literal value | `agent.name`, `location.label` |
| `objects(pred, NamedNodeAs.string, NamedNodeFrom.string)` | 0-to-many IRI values (read + write) | `profile.skills`, `agent.pimStorage` |
| `objects(pred, TermAs.instance(Class), TermFrom.instance)` | 0-to-many nested objects | `profile.locationNodes`, `agent.telephones` |
| `DatasetWrapper.subjectsOf(pred, Class)` | Find root subjects in a dataset | `WebIdDataset.mainSubject` |
| Manual N3 `DataFactory` + `Store` | Write structured blank node graphs | Locations |
| `parseTurtle()` + `serializeToTurtle()` | Round-trip Turtle to/from N3 Store | All Pod read/write operations |
