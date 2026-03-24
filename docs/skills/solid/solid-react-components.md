# Solid React Components Usage in volunteering-demo

This document explains how the two Solid-related React packages — **`@ldo/solid-react`** and **`solid-react-component`** — are used in this codebase for authentication, session management, and data access. It covers provider setup, hooks, pre-built UI components, and how they integrate with the rest of the app.

---

## 1. Overview

### 1.1 Two packages, two roles

| Package | Role | What it provides |
|---------|------|-----------------|
| **`@ldo/solid-react`** | Auth session & authenticated fetch | `BrowserSolidLdoProvider`, `useSolidAuth` hook |
| **`solid-react-component`** | Pre-built login/auth UI & navigation | `SolidLoginPage`, `SolidLoginNavigationProviderNext`, `AuthGuard` |

### 1.2 Dependencies

From `package.json`:

```json
{
  "@ldo/solid-react": "^1.0.0-alpha.36",
  "@ldo/connected-solid": "^1.0.0-alpha.36",
  "solid-react-component": "^0.2.7"
}
```

- **`@ldo/solid-react`** — Core Solid auth provider and hooks (built on LDO).
- **`@ldo/connected-solid`** — Required peer dependency (LDO's Solid connection layer).
- **`solid-react-component`** — Higher-level UI components for login flows (depends on `@ldo/solid-react`).

### 1.3 Next.js configuration

`solid-react-component` must be transpiled by Next.js because it ships untranspiled source:

```ts
// next.config.ts
const nextConfig: NextConfig = {
  transpilePackages: ["solid-react-component"],
  // ... LDO shape type aliases for turbopack/webpack
};
```

---

## 2. Provider Setup

### 2.1 Provider hierarchy

**File:** `app/layout.tsx`

```
<html>
  <body>
    <SolidProviders>                          ← @ldo/solid-react + React Query
      <AuthWithReturnUrl>                     ← solid-react-component auth flow
        <VolunteerOntologyProvider>            ← app-specific context
          {children}
        </VolunteerOntologyProvider>
      </AuthWithReturnUrl>
    </SolidProviders>
  </body>
</html>
```

### 2.2 SolidProviders

**File:** `app/providers.tsx`

```tsx
"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserSolidLdoProvider } from "@ldo/solid-react";
import { queryClient } from "@/app/lib/queryClient";

export function SolidProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserSolidLdoProvider>{children}</BrowserSolidLdoProvider>
    </QueryClientProvider>
  );
}
```

**What this does:**

- **`BrowserSolidLdoProvider`** — Initialises the LDO Solid session in the browser. Handles OIDC redirect callbacks, stores session state, and provides `useSolidAuth()` to all descendants.
- **`QueryClientProvider`** — Wraps React Query so all hooks can share a single query cache. Configured with `staleTime: Infinity` so Pod data is fetched once per login and only re-fetched on explicit `refetch()` calls.

**Important:** `BrowserSolidLdoProvider` must be rendered as a client component (`"use client"`) because it manages browser-side OIDC state.

---

## 3. Authentication Components (solid-react-component)

### 3.1 SolidLoginPage

**File:** `app/login/page.tsx`

```tsx
"use client";

import { useRouter } from "next/navigation";
import { SolidLoginPage } from "solid-react-component/login/next";

export default function LoginPage() {
  const router = useRouter();
  return (
    <SolidLoginPage
      onAlreadyLoggedIn={() => router.replace("/")}
      title="Sign in"
      subtitle="to continue to Vounteering Demo"
    />
  );
}
```

**What this does:**

- Renders a complete login form with a Solid OIDC provider input.
- Handles the OIDC redirect dance — the user enters their identity provider URL, gets redirected to authenticate, and comes back.
- `onAlreadyLoggedIn` — if the session is already active, skip the login page and redirect home.
- `title` / `subtitle` — customise the login page text.

**Import path:** `solid-react-component/login/next` provides Next.js–specific variants that work with Next.js routing.

### 3.2 SolidLoginNavigationProviderNext

**File:** `app/components/AuthWithReturnUrl.tsx`

```tsx
import {
  SolidLoginNavigationProviderNext,
  AuthGuard,
} from "solid-react-component/login/next";

<SolidLoginNavigationProviderNext
  config={{ loginPath: "/login", homePath: "/" }}
>
  <AuthGuard fallback={<LoadingScreen />}>
    {children}
  </AuthGuard>
</SolidLoginNavigationProviderNext>
```

**What this does:**

- **`SolidLoginNavigationProviderNext`** — Configures the login/home redirect paths for the solid-react-component system. When an unauthenticated user tries to access a protected page, they are redirected to `loginPath`. After successful login, they are sent to `homePath` (or back to the page they came from).
- **`config.loginPath`** — The Next.js route for the login page (`/login`).
- **`config.homePath`** — The default redirect after login (`/`).

### 3.3 AuthGuard

```tsx
<AuthGuard fallback={<LoadingScreen />}>
  {children}
</AuthGuard>
```

**What this does:**

- Wraps protected content. If the user is **not authenticated**, it shows the `fallback` (a loading screen) while redirecting to the login page.
- If the user **is authenticated**, it renders `{children}`.
- Works with `SolidLoginNavigationProviderNext` to know where to redirect.

### 3.4 Selective layout based on route

The `AuthWithReturnUrl` component conditionally wraps children in `AppLayout` based on the current path:

```tsx
function AuthLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <SolidLoginNavigationProviderNext config={{ loginPath: "/login", homePath: "/" }}>
      <AuthGuard fallback={<LoadingScreen />}>
        {pathname?.startsWith("/national-volunteer-services") ||
        pathname?.startsWith("/credentials/verify") ? (
          children          // ← full-page layout (no sidebar)
        ) : (
          <AppLayout>{children}</AppLayout>   // ← sidebar + nav layout
        )}
      </AuthGuard>
    </SolidLoginNavigationProviderNext>
  );
}
```

This pattern lets certain routes (NVS portal, credential verify pages) render without the standard sidebar while still requiring authentication.

---

## 4. The `useSolidAuth` Hook (@ldo/solid-react)

### 4.1 What it provides

```ts
const { session, fetch: authFetch } = useSolidAuth();
```

| Property | Type | Purpose |
|----------|------|---------|
| `session.isLoggedIn` | `boolean` | Whether the user has an active Solid session. |
| `session.webId` | `string \| undefined` | The user's WebID (e.g. `https://pod.example/profile/card#me`). |
| `fetch` | `typeof globalThis.fetch` | An **authenticated fetch** that automatically adds DPoP proof headers. Use this for all Pod requests. |

### 4.2 Usage pattern in hooks

Every data hook in this app follows the same pattern:

```ts
"use client";

import { useSolidAuth } from "@ldo/solid-react";
import { usePodRoot } from "@/app/lib/hooks/usePodRoot";

export function useSomeData() {
  const { fetch: authFetch } = useSolidAuth();
  const { podRoot, webId } = usePodRoot();

  // Always fall back to global fetch in case authFetch is not a function
  const fetchFn = typeof authFetch === "function" ? authFetch : fetch;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["someData", webId],
    queryFn: () => readDataFromPod(fetchFn, podRoot!),
    enabled: !!webId && !!podRoot,     // only fetch when logged in + pod known
  });

  // ... save/update callbacks
}
```

**Key points:**

1. **`authFetch`** — always use this instead of plain `fetch` for Pod requests. It adds authentication headers.
2. **Fallback guard** — `typeof authFetch === "function" ? authFetch : fetch` ensures the hook doesn't crash if the session hasn't initialised yet.
3. **`enabled: !!webId && !!podRoot`** — React Query only fires the request when both are available (user is logged in and Pod root is known).

### 4.3 Where it's used

| Hook | File | Uses from `useSolidAuth` |
|------|------|--------------------------|
| `useAgent` | `hooks/useAgent.ts` | `session` (webId, isLoggedIn) + `fetch` |
| `useVolunteerProfileSkills` | `hooks/useVolunteerProfileSkills.ts` | `session` + `fetch` |
| `useVolunteerProfileCauses` | `hooks/useVolunteerProfileCauses.ts` | `fetch` |
| `useVolunteerProfileEquipment` | `hooks/useVolunteerProfileEquipment.ts` | `fetch` |
| `useVolunteerProfileLocations` | `hooks/useVolunteerProfileLocations.ts` | `fetch` |
| `useVolunteerProfileAvailability` | `hooks/useVolunteerProfileAvailability.ts` | `fetch` |
| `useCredentials` | `hooks/useCredentials.ts` | `fetch` |

---

## 5. Derived Hooks

### 5.1 useAgent — the shared profile query

**File:** `app/lib/hooks/useAgent.ts`

```ts
export function useAgent(): UseAgentResult {
  const queryClient = useQueryClient();
  const { session, fetch: authFetch } = useSolidAuth();
  const webId = session.isLoggedIn && session.webId ? session.webId : null;

  const { data: agent, isLoading, error } = useQuery({
    queryKey: ["agent", webId],
    queryFn: () => fetchAndParseProfile(webId!, fetchFn),
    enabled: !!webId,
    gcTime: Number.POSITIVE_INFINITY,    // never garbage collect the agent
  });

  // Clear all cached data on logout
  useEffect(() => {
    if (!webId) queryClient.clear();
  }, [webId, queryClient]);

  return { webId, agent: agent ?? null, isLoading, error };
}
```

**What this does:**

1. Uses `useSolidAuth()` to get the logged-in WebID and authenticated fetch.
2. Fetches the WebID profile document, parses it with N3, and wraps it with rdfjs-wrapper into an `Agent` object.
3. Caches the result forever (`gcTime: POSITIVE_INFINITY`) — the profile is parsed once per login.
4. On logout (`webId` becomes null), clears the entire React Query cache.

**Consumers:** Both `usePodRoot` and `useUserProfile` derive from `useAgent` — they never fetch the profile independently.

### 5.2 usePodRoot — deriving the Pod storage URL

**File:** `app/lib/hooks/usePodRoot.ts`

```ts
export function usePodRoot(): PodRootResult {
  const { webId, agent, isLoading, error } = useAgent();

  const podRoot = useMemo(() => {
    if (!agent) return null;
    const urls = agent.storageUrls;       // pim:storage + solid:storage
    if (urls.size === 0) {
      return `${new URL(webId!).origin}/`; // fallback: WebID origin
    }
    return [...urls][0];
  }, [agent, webId]);

  return { webId, podRoot, isLoading, error };
}
```

**What this does:**

1. Gets the `Agent` from the shared query.
2. Reads `pim:storage` and `solid:storage` IRIs from the profile.
3. Falls back to the WebID's origin if no storage URL is declared.

**Consumers:** Every volunteer profile hook uses `usePodRoot()` to know where to read/write data.

### 5.3 useUserProfile — deriving display fields

**File:** `app/lib/hooks/useUserProfile.ts`

```ts
export function useUserProfile(): UseUserProfileResult {
  const { webId, agent, isLoading, error } = useAgent();

  const profile = useMemo(() => {
    if (!agent) return emptyProfile;
    return agentToProfile(agent, webId!);
  }, [agent, webId]);

  return { profile, isLoading, error };
}
```

Transforms the `Agent` wrapper into a flat `UserProfile` object with normalised fields (name, email, phone, photoUrl, socialLinks, etc.) for UI components.

---

## 6. Data Hook Pattern

All volunteer profile hooks follow the same architecture:

```
useSolidAuth() ──→ authenticated fetch
usePodRoot()   ──→ podRoot URL, webId
useQuery()     ──→ cached read from Pod
useCallback()  ──→ save function (debounced or immediate)
```

### 6.1 Debounced saves (skills, causes, equipment, availability, locations)

```ts
const SAVE_DEBOUNCE_MS = 600;

const saveSkills = useCallback((labels: string[]) => {
  // 1. Map labels to ontology IRIs
  const uris = labels.map(l => labelToSkillIri[l]).filter(Boolean);

  // 2. Optimistic cache update (instant UI feedback)
  queryClient.setQueryData(["volunteerSkills", webId], uris);

  // 3. Debounced Pod write (avoids rapid-fire saves while user edits)
  setIsSaving(true);
  if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
  saveTimeoutRef.current = setTimeout(() => {
    writeSkillsToPod(fetchFn, podRoot, uris)
      .catch(err => setSaveError(err))
      .finally(() => setIsSaving(false));
  }, SAVE_DEBOUNCE_MS);
}, [webId, podRoot, fetchFn, ontologySkills, queryClient]);
```

**Key characteristics:**
- **Optimistic update** — `queryClient.setQueryData()` updates the cache immediately so the UI reflects the change without waiting for the network.
- **Debounce** — Multiple rapid saves are collapsed into one Pod write.
- **Cleanup** — `useEffect` cleanup clears the timeout on unmount.

### 6.2 Immediate saves with rollback (credentials)

Credentials use a different pattern — no debounce, with error rollback:

```ts
const addCredential = useCallback(async (credential: PodCredential) => {
  // 1. Optimistic update
  queryClient.setQueryData<PodCredential[]>(
    [QUERY_KEY, webId],
    (prev = []) => [...prev, credential],
  );

  try {
    // 2. Immediate Pod write (no debounce — intentional user action)
    await writeCredentialToPod(fetchFn, podRoot, credential);
  } catch (err) {
    // 3. Roll back optimistic update on failure
    queryClient.setQueryData<PodCredential[]>(
      [QUERY_KEY, webId],
      (prev = []) => prev.filter(c => c.id !== credential.id),
    );
    throw err;
  }
}, [webId, podRoot, fetchFn, queryClient]);
```

---

## 7. React Query Configuration

**File:** `app/lib/queryClient.ts`

```ts
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Number.POSITIVE_INFINITY,
    },
  },
});
```

- **`staleTime: Infinity`** — Data is never considered stale. Pod data is fetched once when the user logs in, then served from cache. This prevents unnecessary refetches when components mount/unmount.
- **Explicit refetch** — Each hook exposes a `refetch()` function for when you need fresh data.
- **Cache clear on logout** — `useAgent` calls `queryClient.clear()` when the webId becomes null.

### 7.1 Query key conventions

| Query key | Hook | Data |
|-----------|------|------|
| `["agent", webId]` | `useAgent` | Parsed `Agent` from WebID profile |
| `["volunteerSkills", webId]` | `useVolunteerProfileSkills` | `string[]` of skill IRIs |
| `["volunteerCauses", webId]` | `useVolunteerProfileCauses` | `string[]` of cause IRIs |
| `["volunteerEquipment", webId]` | `useVolunteerProfileEquipment` | `string[]` of equipment IRIs |
| `["volunteerLocations", webId]` | `useVolunteerProfileLocations` | `SavedLocation[]` |
| `["volunteerAvailability", webId]` | `useVolunteerProfileAvailability` | `Set<string>` of slot keys |
| `["credentials", webId]` | `useCredentials` | `PodCredential[]` |

All keys include `webId` so the cache is per-user and invalidated on login/logout.

---

## 8. Complete Authentication Flow

```
┌─────────────────────────────────────────────────────────────────┐
│  User visits any page                                           │
│                                                                 │
│  RootLayout renders:                                            │
│    <SolidProviders>           ← BrowserSolidLdoProvider inits   │
│      <AuthWithReturnUrl>      ← SolidLoginNavigationProvider    │
│        <AuthGuard>            ← checks session.isLoggedIn       │
│          {children}                                             │
│        </AuthGuard>                                             │
│      </AuthWithReturnUrl>                                       │
│    </SolidProviders>                                            │
│                                                                 │
│  If NOT logged in:                                              │
│    AuthGuard shows <LoadingScreen />                            │
│    Redirects to /login                                          │
│                                                                 │
│  /login page:                                                   │
│    <SolidLoginPage />         ← renders OIDC login form         │
│    User enters identity provider → redirects to OIDC provider   │
│    OIDC provider authenticates → redirects back to app          │
│    BrowserSolidLdoProvider handles the callback                 │
│    session.isLoggedIn = true, session.webId = "..."             │
│    Redirected to homePath (/)                                   │
│                                                                 │
│  If logged in:                                                  │
│    AuthGuard renders {children}                                 │
│    Hooks call useSolidAuth() → get authenticated fetch          │
│    useAgent() fetches WebID profile → Agent                     │
│    usePodRoot() derives storage URL from Agent                  │
│    Data hooks fetch from Pod using podRoot + authFetch           │
│                                                                 │
│  Logout:                                                        │
│    User clicks "Logout" link (navigates to /login)              │
│    SolidLoginPage with onAlreadyLoggedIn triggers session reset │
│    useAgent detects webId=null → queryClient.clear()            │
└─────────────────────────────────────────────────────────────────┘
```

---

## 9. Adding a New Data Hook

Follow this template to add a new Pod-backed data hook:

```ts
"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSolidAuth } from "@ldo/solid-react";
import { usePodRoot } from "@/app/lib/hooks/usePodRoot";
import { readXFromPod, writeXToPod } from "@/app/lib/helpers/volunteerProfileSkills";

const SAVE_DEBOUNCE_MS = 600;

export function useVolunteerProfileX() {
  const queryClient = useQueryClient();
  const { fetch: authFetch } = useSolidAuth();
  const { podRoot, webId } = usePodRoot();
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<Error | null>(null);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchFn = typeof authFetch === "function" ? authFetch : fetch;

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, []);

  // Read from Pod (cached by React Query)
  const { data = [], isLoading, error: readError, refetch } = useQuery({
    queryKey: ["volunteerX", webId],
    queryFn: () => readXFromPod(fetchFn, podRoot!),
    enabled: !!webId && !!podRoot,
  });

  // Save to Pod (debounced, with optimistic cache update)
  const saveX = useCallback(
    (newData: string[]) => {
      if (!webId || !podRoot) return;

      queryClient.setQueryData(["volunteerX", webId], newData);
      setIsSaving(true);

      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(() => {
        saveTimeoutRef.current = null;
        writeXToPod(fetchFn, podRoot, newData)
          .catch(err => setSaveError(err instanceof Error ? err : new Error("Save failed")))
          .finally(() => setIsSaving(false));
      }, SAVE_DEBOUNCE_MS);
    },
    [webId, podRoot, fetchFn, queryClient],
  );

  return {
    data,
    isLoading,
    isSaving,
    error: readError instanceof Error ? readError : saveError,
    saveX,
    refetch: async () => { await refetch(); },
  };
}
```

**Checklist:**

1. ✅ Import `useSolidAuth` from `@ldo/solid-react` for authenticated fetch.
2. ✅ Import `usePodRoot` to get the Pod URL and webId.
3. ✅ Use React Query with `enabled: !!webId && !!podRoot`.
4. ✅ Include webId in the query key for per-user caching.
5. ✅ Optimistic cache update via `queryClient.setQueryData()`.
6. ✅ Debounce saves to avoid hammering the Pod.
7. ✅ Clean up timeout on unmount.
8. ✅ Fall back to global `fetch` if `authFetch` isn't ready.

---

## 10. Summary

| Concept | Package | API | Used where |
|---------|---------|-----|-----------|
| Solid session provider | `@ldo/solid-react` | `BrowserSolidLdoProvider` | `providers.tsx` (root) |
| Authenticated fetch + session | `@ldo/solid-react` | `useSolidAuth()` | Every data hook |
| Login page UI | `solid-react-component` | `SolidLoginPage` | `login/page.tsx` |
| Auth redirect config | `solid-react-component` | `SolidLoginNavigationProviderNext` | `AuthWithReturnUrl.tsx` |
| Auth guard | `solid-react-component` | `AuthGuard` | `AuthWithReturnUrl.tsx` |
| Pod root derivation | custom hook | `usePodRoot()` | Every data hook |
| WebID profile parsing | custom hook | `useAgent()` → `useUserProfile()` | Nav, profile page |
| Data caching | `@tanstack/react-query` | `useQuery`, `queryClient` | Every data hook |
