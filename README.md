# Volunteering Demo

A **Solid-based** volunteer profile manager built with [Next.js](https://nextjs.org). Volunteers authenticate with their Solid identity, and all their volunteering data — skills, causes, equipment, availability, locations, and credentials — is stored in their own [Solid Pod](https://solidproject.org/), giving them full ownership and control.

> **Built by [The ODI](https://theodi.org/)** as a demonstrator for the [Volunteering Data](https://standard.volunteeringdata.io/) standard.

---

## Features

| Feature | Description |
|---------|-------------|
| **Profile** | Reads the user's WebID profile (name, email, photo, social links, etc.) and displays it on the home page. |
| **Skills & Causes** | Select skills and causes of interest from the [volunteer ontology](ontology/volunteer.ttl). Stored as RDF in the Pod. |
| **Equipment** | Declare equipment/resources you can provide — ontology items or custom entries. |
| **Preferred Locations** | Pick locations on an interactive map with configurable radius. Stored as structured RDF blank nodes. |
| **Availability** | Weekly scheduler grid (morning / afternoon / evening × 7 days). Persisted as composed time IRIs. |
| **Credentials** | View, collect, and verify credentials (e.g. UK DBS Check). Stored in the Pod alongside profile data. Mock issuer verification page included. |
| **Solid Auth** | Full OIDC login flow via `@ldo/solid-react` and `solid-react-component`. All Pod requests use an authenticated fetch with DPoP headers. |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | [Next.js 16](https://nextjs.org) (App Router) |
| Language | TypeScript 5 |
| Styling | [Tailwind CSS 4](https://tailwindcss.com) |
| Solid Auth | [`@ldo/solid-react`](https://github.com/o-development/ldo) + [`solid-react-component`](https://www.npmjs.com/package/solid-react-component) |
| RDF Parsing | [`n3`](https://github.com/rdfjs/N3.js) (Parser, Store, Writer, DataFactory) |
| RDF Wrapper | [`rdfjs-wrapper`](https://github.com/matthieubosquet/rdfjs-wrapper) (TermWrapper, DatasetWrapper) |
| Data Caching | [`@tanstack/react-query`](https://tanstack.com/query) |
| Maps | [Leaflet](https://leafletjs.com) + [React Leaflet](https://react-leaflet.js.org) |
| Icons | [Heroicons](https://heroicons.com) |

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 20
- **pnpm** (recommended) — or npm / yarn
- A **Solid Pod** and identity provider (e.g. [Community Solid Server](https://communitysolidserver.github.io/CommunitySolidServer/), [solidcommunity.net](https://solidcommunity.net/), or any Solid-OIDC provider)

### Install

```bash
pnpm install
```

### Run (development)

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). You'll be redirected to the login page to authenticate with your Solid identity provider.

### Build (production)

```bash
pnpm build
pnpm start
```

### Lint

```bash
pnpm lint
```

---

## Project Structure

```
├── app/
│   ├── layout.tsx                  # Root layout — providers, auth guard, ontology context
│   ├── providers.tsx               # BrowserSolidLdoProvider + React Query
│   ├── page.tsx                    # Home — profile page
│   ├── login/page.tsx              # Solid OIDC login page
│   ├── volunteer-info/page.tsx     # Skills, causes, equipment, locations
│   ├── availability/page.tsx       # Weekly availability scheduler
│   ├── credentials/
│   │   ├── page.tsx                # Credential list (Pod-backed)
│   │   └── verify/[id]/page.tsx    # Mock issuer verification / claim / unclaim
│   ├── components/                 # UI components (profile, credentials, map, nav, etc.)
│   ├── contexts/                   # React contexts (sidebar, volunteer ontology)
│   └── lib/
│       ├── class/                  # rdfjs-wrapper classes (Agent, VolunteerProfile, Vocabulary)
│       ├── helpers/                # Pure-async Pod read/write helpers
│       └── hooks/                  # React hooks (useAgent, usePodRoot, useCredentials, etc.)
├── ontology/
│   └── volunteer.ttl               # Volunteer ontology (SKOS concept schemes)
├── docs/
│   └── skills/solid/               # Developer docs (RDF wrapper, Solid React, data modelling, etc.)
├── public/                         # Static assets (fonts, ontology, icons)
├── next.config.ts                  # Next.js config (transpile solid-react-component, LDO aliases)
├── package.json
└── tsconfig.json
```

---

## Data Architecture

All volunteer-specific data is stored in a single Turtle document in the user's Pod:

```
{podRoot}/volunteer/profile.ttl
```

Subject: `<{podRoot}/volunteer/profile.ttl#me>`

### What's stored

| Data | RDF predicate | Shape |
|------|--------------|-------|
| Skills | `vp:hasSkill` | Named node IRIs (ontology concepts) |
| Causes | `vp:preferredCause` | Named node IRIs |
| Equipment | `vp:hasRequirement` | Named node IRIs (ontology or custom URNs) |
| Preferred times | `vp:preferredTime` | Composed IRIs (e.g. `volunteering:MondayMorning`) |
| Locations | `vp:preferredLocation` | Blank nodes → `vp:Point` (geo:lat, geo:long) + `vp:rad` + `rdfs:label` |
| Credentials | `vp:hasCredential` | Blank nodes → `vp:Credential` with type, issuer, status, title, issuedAt |

The user's **WebID profile** (name, email, photo, storage URLs) is read from their existing profile document — it is not duplicated.

### Namespaces

| Prefix | IRI |
|--------|-----|
| `vp:` | `https://id.volunteeringdata.io/volunteer-profile/` |
| `volunteering:` | `https://ns.volunteeringdata.io/` |
| `geo:` | `http://www.w3.org/2003/01/geo/wgs84_pos#` |
| `rdfs:` | `http://www.w3.org/2000/01/rdf-schema#` |

---

## Key Patterns

### Authenticated fetch

Every Pod request uses the authenticated fetch from `@ldo/solid-react`:

```ts
const { fetch: authFetch } = useSolidAuth();
```

### Pod root discovery

The Pod storage URL is derived from the WebID profile (`pim:storage` / `solid:storage`):

```ts
const { podRoot, webId } = usePodRoot();
```

### Read / write with rdfjs-wrapper + N3

1. **GET** the Turtle document → parse with N3 `Parser` → `Store`
2. Wrap with `VolunteerProfile` (rdfjs-wrapper `TermWrapper`) → read via getters
3. Mutate the live `Set` (simple IRIs) or build blank nodes with `DataFactory` (structured data)
4. Serialize with N3 `Writer` → **PUT** back

### React Query caching

All data is cached per-user with `staleTime: Infinity`. Saves optimistically update the cache, then write to the Pod (debounced for rapid edits, immediate for intentional actions like credentials).


---

## Ontology

The volunteer ontology ([`ontology/volunteer.ttl`](ontology/volunteer.ttl)) defines SKOS concept schemes for:

- **Skills** — e.g. First Aid, Driving, IT Support
- **Causes** — e.g. Environment, Education, Health
- **Equipment / Requirements** — e.g. DBS Check, First Aid Kit, Van

It is parsed at build time on the server and provided to the app via React context.

---

