# RDF/JS Wrapper in Solid File Manager — Reference

This document describes how the **rdfjs-wrapper** library is used in the [Solid File Manager](https://github.com/solid/solid-file-manager) (`solid/solid-file-manager`) app. It is intended as a reference for using the same pattern in other Solid apps (e.g. volunteering-demo).

---

## 1. Overview

### 1.1 What is rdfjs-wrapper?

- **Package:** [`rdfjs-wrapper`](https://www.npmjs.com/package/rdfjs-wrapper) (npm) / [matthieubosquet/rdfjs-wrapper](https://github.com/matthieubosquet/rdfjs-wrapper) (GitHub).
- **Version used in Solid File Manager:** `^0.28.0` (from `package.json`).
- **Role:** RDF/JS-compliant graph wrapping library. It wraps RDF datasets and terms in small classes so you can read (and in places write) RDF via getters/setters and typed mappings instead of raw quads.

### 1.2 How Solid File Manager uses it

- **Reading RDF:** Fetch RDF (Turtle/JSON-LD) → parse into an RDF/JS `DatasetCore` (e.g. N3 `Store` or `toRdfJsDataset` from `@inrupt/solid-client`) → wrap with `DatasetWrapper` or `TermWrapper` subclasses → access data via typed getters.
- **Writing RDF:** For ACP, the app also uses the wrapper classes with N3’s `DataFactory` to build new graphs (e.g. `new AccessControlResource(namedNode(acrUrl), ds, DataFactory)` then set properties). Serialization is done with N3’s `Writer`, not the wrapper itself.
- **Vocabularies:** IRIs are centralized in `Vocabulary.ts` (ACP, DC, LDP, POSIX, RDF, RDFS, SOLID, VCARD, etc.) and passed into wrapper methods.

---

## 2. Dependencies (Solid File Manager)

From `package.json`:

```json
{
  "@inrupt/solid-client": "^1.23.1",
  "@inrupt/solid-client-authn-browser": "^3.1.1",
  "@ldo/solid-react": "^1.0.0-alpha.33",
  "n3": "^2.0.1",
  "rdfjs-wrapper": "^0.28.0"
}
```

- **@inrupt/solid-client:** Fetch Solid resources and get RDF datasets; `toRdfJsDataset()` converts to RDF/JS for the wrapper.
- **n3:** Parse Turtle (`Parser`), in-memory store (`Store`), write Turtle (`Writer`), and `DataFactory` for creating terms when wrapping.
- **rdfjs-wrapper:** Provides `TermWrapper`, `DatasetWrapper`, and mapping helpers (`ValueMapping`, `TermMapping`, `ObjectMapping`).

---

## 3. App structure (relevant to RDF wrapper)

| Path | Purpose |
|------|--------|
| `app/lib/class/` | Domain classes extending rdfjs-wrapper’s `TermWrapper` or `DatasetWrapper`. |
| `app/lib/class/Vocabulary.ts` | Centralized RDF vocabulary IRIs (ACP, DC, LDP, POSIX, RDF, RDFS, SOLID, VCARD, FOAF, PIM). |
| `app/lib/helpers/` | Fetch RDF, parse (N3 or solid-client), wrap, and use the class instances (e.g. `acpUtils`, `profileUtils`). |
| `app/lib/hooks/` | React hooks that call helpers and expose data (e.g. `useBrowseStorage`, `useSolidStorages`, `useUserProfile`). |

---

## 4. rdfjs-wrapper API used in Solid File Manager

### 4.1 Base classes

- **`TermWrapper`**  
  Wraps a single RDF term (subject) in a dataset. Subclasses add getters (and optionally setters) that read/write quads in the underlying dataset for that subject.

- **`DatasetWrapper`**  
  Wraps an entire RDF/JS `DatasetCore`. Subclasses expose “root” resources (e.g. the container, the ACR, the WebID profile subject) by locating subjects in the graph and wrapping them in `TermWrapper` subclasses.

Constructors in the file manager:

- **TermWrapper:** `(term: NamedNode | BlankNode, dataset: DatasetCore, dataFactory: DataFactory)`
- **DatasetWrapper:** `(dataset: DatasetCore, dataFactory: DataFactory)`

### 4.2 Mappings (for reading/writing)

Used in `this.objects(...)`, `this.singularNullable(...)`, `this.overwriteNullable(...)`, and when defining custom wrappers with `ObjectMapping.as(SomeClass)`.

- **ValueMapping** (plain values):
  - `ValueMapping.literalToString`
  - `ValueMapping.literalToDate`
  - `ValueMapping.literalToNumber`
  - `ValueMapping.iriToString`

- **TermMapping** (for writing back into the graph):
  - `TermMapping.stringToIri`

- **ObjectMapping** (wrap object values in another TermWrapper class):
  - `ObjectMapping.as(Resource)`, `ObjectMapping.as(AccessControl)`, `ObjectMapping.as(Matcher)`, etc.

### 4.3 Common TermWrapper methods (inferred from usage)

- **`singularNullable(predicate, valueMapping)`**  
  Returns the single value for `predicate` as a mapped value, or `undefined` if none/multiple.

- **`objects(predicate, valueMapping?, termMapping?)`**  
  Returns a `Set` of values for `predicate` (mapped with `valueMapping` if given).

- **`objects(predicate, ObjectMapping.as(WrapperClass), ObjectMapping.as(WrapperClass))`**  
  Returns a `Set` of wrapper instances (e.g. `Set<Resource>`, `Set<AccessControl>`).

- **`overwriteNullable(predicate, value, termMapping)`**  
  Replaces the object of `predicate` with the given value (e.g. set `acr.resource = resourceUrl`).

Setters on wrapper classes (e.g. `acr.resource = v`) are implemented using such methods plus mutation of the underlying dataset (e.g. via N3 `DataFactory` and store).

### 4.4 DatasetWrapper methods (inferred from usage)

- **`subjectsOf(predicate, WrapperClass)`**  
  Finds subjects that have `predicate` and wraps them in `WrapperClass`. Returns an iterable of wrapper instances.

- **`instancesOf(typeIri, WrapperClass)`**  
  Finds subjects that have `rdf:type` equal to `typeIri` and wraps them in `WrapperClass`.

These are used to get the “main” resource from a dataset (e.g. container, ACR, WebID profile agent).

---

## 5. Class hierarchy and usage

### 5.1 Resource / Container (file and folder metadata)

- **`Resource`** (`app/lib/class/Resource.ts`) extends `TermWrapper`.
  - Represents a Solid resource (file or container) as a subject in an RDF graph.
  - **Getters:** `id`, `title`, `label`, `name`, `modified`, `mtime`, `lastModified`, `size`, `type`, `mimeType`, `isContainer`, `fileType`.
  - Uses: `DC`, `POSIX`, `RDF`, `RDFS` from `Vocabulary.ts`; `ValueMapping.literalToString`, `literalToDate`, `literalToNumber`; `TermMapping.stringToIri`; `objects(RDF.type, ...)`.

- **`Container`** (`app/lib/class/Container.ts`) extends `Resource`.
  - Adds `contains`: `Set<Resource>` via `this.objects(LDP.contains, ObjectMapping.as(Resource), ObjectMapping.as(Resource))`.

- **`ContainerDataset`** (`app/lib/class/ContainerDataset.ts`) extends `DatasetWrapper`.
  - Wraps the container’s RDF response.
  - **Getter:** `container` — first subject that has `LDP.contains`, wrapped as `Container`.
  - Used in **useBrowseStorage:** fetch with `getSolidDataset` → `toRdfJsDataset` → `new ContainerDataset(dataset, DataFactory)` → `container.contains` to list files/folders as `Resource` instances.

### 5.2 WebID profile (Agent)

- **`Agent`** (`app/lib/class/Agent.ts`) extends `TermWrapper`.
  - Represents the WebID profile subject (person/agent).
  - **Getters:** `vcardFn`, `foafName`, `name`, `email`, `hasEmail`, `phone`, `hasTelephone`, `photoUrl`, `website`, `pimStorage`, `solidStorage`, `storageUrls`, `knows`, `organization`, `role`, `title`, etc.
  - Uses FOAF, VCARD, PIM, SOLID vocabularies; `ObjectMapping.as(HasValue)` for nested vcard structures.

- **`WebIdDataset`** (`app/lib/class/WebIdDataset.ts`) extends `DatasetWrapper`.
  - **Getter:** `mainSubject` — subject that has `SOLID.oidcIssuer`, wrapped as `Agent`.
  - Used in **profileUtils:** fetch WebID document → N3 `Parser` + `Store` → `new WebIdDataset(store, DataFactory)` → `mainSubject` (Agent) for name, email, storage URLs, etc.
  - **useUserProfile** and **useSolidStorages** use `fetchAndParseProfile(webId)` which returns this `Agent` (cached).

**vCard value predicate:** For email/telephone/url nodes, the W3C vCard ontology uses the predicate **`vcard:value`** (IRI `http://www.w3.org/2006/vcard/ns#value`) to point at the actual value (e.g. `mailto:...`, `tel:...`). Solid-file-manager’s Vocabulary uses `hasValue` with IRI `...#hasValue`, which is not the standard predicate; with that IRI no triple matches, so `HasValue.value` falls back to the node’s IRI. In this project we use `VCARD.value` (correct IRI) so email and phone resolve correctly. See `app/lib/class/Vocabulary.ts` and `Agent.ts` HasValue.

### 5.3 Access Control (ACP)

- **`Typed`** (`app/lib/class/Typed.ts`) extends `TermWrapper`.
  - **Getter:** `type` — `Set` of `rdf:type` values (IRIs as strings).

- **`Matcher`** extends `Typed`: `agent` (`Set<string>` WebIDs).
- **`Policy`** extends `Typed`: `allow` (modes), `anyOf` (`Set<Matcher>`).
- **`AccessControl`** extends `Typed`: `apply` (`Set<Policy>`).
- **`AccessControlResource`** extends `Typed`: `accessControl` (`Set<AccessControl>`), `resource` (string, get/set).

- **`AcrDataset`** (`app/lib/class/AcrDataset.ts`) extends `DatasetWrapper`.
  - **Getter:** `acr` — first `AccessControlResource` found via `instancesOf(ACP.AccessControlResource, ...)` or `subjectsOf(ACP.resource, ...)` (and similar ACP predicates).

**acpUtils.ts** (simplified flow):

- **Read ACR:** `fetch(acrUrl)` → Turtle text → N3 `Parser` + `Store` → `new AcrDataset(dataset, DataFactory)` → `acrDataset.acr` → walk `acr.accessControl` → `policy.apply` → `policy.anyOf` → `matcher.agent` to list agents and modes.
- **Create/update ACR:** Build new ACR graph with N3 `Store` and `DataFactory`; instantiate `AccessControlResource`, `AccessControl`, `Policy`, `Matcher` with `(term, ds, DataFactory)` and set properties (e.g. `acr.resource = resourceUrl`, `matcher.agent.add(webId)`). Serialize with N3 `Writer` and PUT to `.acr` URL.

So: **rdfjs-wrapper is used to read and to structure in-memory ACR graphs; N3 is used for parsing and writing Turtle.**

---

## 6. Data flow examples

### 6.1 Browsing a container (useBrowseStorage)

1. `getSolidDataset(containerUrl, { fetch })` → Inrupt Solid dataset.
2. `toRdfJsDataset(...)` → RDF/JS `DatasetCore`.
3. `new ContainerDataset(dataset, DataFactory)` → `ContainerDataset` (DatasetWrapper).
4. `containerDataset.container` → `Container` (TermWrapper) with `contains` = `Set<Resource>`.
5. For each `Resource`: use `.id`, `.name`, `.fileType`, `.lastModified`, `.size`, `.mimeType` (and optional HEAD for content-type) to build file list.

### 6.2 Reading WebID profile (profileUtils → useUserProfile / useSolidStorages)

1. `fetch(webId, { Accept: 'text/turtle, ...' })` → Turtle or JSON-LD.
2. N3 `Parser` + `Store` → RDF/JS dataset.
3. `new WebIdDataset(store, DataFactory)` → `WebIdDataset`.
4. `webIdDataset.mainSubject` → `Agent` (TermWrapper).
5. Use `agent.name`, `agent.email`, `agent.storageUrls`, `agent.photoUrl`, etc. for profile and storage discovery.

### 6.3 Reading and updating ACR (acpUtils)

- **getResourceAccessList:** Fetch `.acr` → parse Turtle → `new AcrDataset(dataset, DataFactory)` → `acrDataset.acr` → iterate `acr.accessControl` → `policy.apply` → `policy.anyOf` → `matcher.agent` to build list of WebIDs and modes.
- **shareResourceWithAcp:** `fetchAcr` → same wrap → read existing agents; then create/update graph with wrapper classes + N3, serialize with N3 `Writer`, PUT to `.acr`.
- **removeAccessFromResource:** Fetch ACR → wrap → mutate (e.g. `matcher.agent.delete(webIdToRemove)`) then serialize dataset and PUT.

---

## 7. Vocabulary pattern

All RDF predicates/types used by the wrappers are in **`app/lib/class/Vocabulary.ts`** as const objects, e.g.:

- `ACP.*`, `DC.*`, `LDP.*`, `POSIX.*`, `RDF.*`, `RDFS.*`, `SOLID.*`, `VCARD.*`, `FOAF.*`, `PIM.*`

This keeps IRIs in one place and makes the wrapper code readable (e.g. `DC.title`, `LDP.contains`).

---

## 8. Takeaways for reuse

1. **Install:** `rdfjs-wrapper` and `n3` (and optionally `@inrupt/solid-client` for `getSolidDataset` + `toRdfJsDataset`).
2. **Define a vocabulary** (or reuse) for your predicates and types.
3. **Extend `TermWrapper`** for each “shape” of subject (e.g. Resource, Agent, Policy). Use `singularNullable`, `objects`, and `ObjectMapping.as(OtherWrapper)` for getters (and overwrite methods for setters if you need to write).
4. **Extend `DatasetWrapper`** when you have a full document (e.g. container response, ACR, WebID profile) and expose one or more “root” subjects via `subjectsOf` / `instancesOf` wrapped in your TermWrapper classes.
5. **Fetch + parse:** Either `getSolidDataset` → `toRdfJsDataset` or `fetch` + N3 `Parser` + `Store`, then construct your `DatasetWrapper` or `TermWrapper` with `(dataset, DataFactory)` or `(term, dataset, DataFactory)`.
6. **Writing:** When building new RDF (e.g. ACR), use the same wrapper classes with N3’s `DataFactory` and a new `Store`, then serialize with N3 `Writer` and PUT.

---

## 9. Links

- [Solid File Manager (GitHub)](https://github.com/solid/solid-file-manager)
- [Solid File Manager app tree](https://github.com/solid/solid-file-manager/tree/main/app)
- [rdfjs-wrapper (npm)](https://www.npmjs.com/package/rdfjs-wrapper)
- [rdfjs-wrapper (GitHub)](https://github.com/matthieubosquet/rdfjs-wrapper)
- [RDF/JS Data model](http://rdf.js.org/data-model-spec/)
- [N3.js](https://github.com/rdfjs/N3.js)

---

*Reference derived from the Solid File Manager codebase (main branch).*
