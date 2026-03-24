"use client";

import { useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSolidAuth } from "@ldo/solid-react";
import { usePodRoot } from "@/app/lib/hooks/usePodRoot";
import {
  readCredentialsFromPod,
  writeCredentialToPod,
  updateCredentialStatusInPod,
} from "@/app/lib/helpers/volunteerProfileSkills";
import type { PodCredential, CredentialStatus } from "@/app/lib/helpers/volunteerProfileSkills";

// Re-export for consumers
export type { PodCredential, CredentialStatus };

const QUERY_KEY = "credentials";

export type UseCredentialsResult = {
  credentials: PodCredential[];
  isLoading: boolean;
  error: Error | null;
  /** Writes a new credential to the Pod and updates the local cache. */
  addCredential: (credential: PodCredential) => Promise<void>;
  /** Updates the status of an existing credential in the Pod. */
  updateStatus: (credentialId: string, status: CredentialStatus) => Promise<void>;
  /** Force re-fetch credentials from the Pod. */
  refetch: () => Promise<void>;
};

/**
 * Reads credentials from {pod}/volunteer/profile.ttl and exposes
 * addCredential / updateStatus to persist changes.
 *
 * Reads are cached and de-duplicated via React Query. Writes go straight
 * to the Pod (no debounce — credential saves are intentional user actions)
 * and optimistically update the query cache so the UI reflects the change
 * immediately.
 */
export function useCredentials(): UseCredentialsResult {
  const queryClient = useQueryClient();
  const { fetch: authFetch } = useSolidAuth();
  const { podRoot, webId, isLoading: podLoading } = usePodRoot();

  const fetchFn = typeof authFetch === "function" ? authFetch : fetch;

  const {
    data: credentials = [],
    isLoading: queryLoading,
    error: readError,
    refetch,
  } = useQuery<PodCredential[]>({
    queryKey: [QUERY_KEY, webId],
    queryFn: () => readCredentialsFromPod(fetchFn, podRoot!),
    enabled: !!webId && !!podRoot,
  });

  // -------------------------------------------------------------------------
  // Add a new credential (optimistic cache update + Pod write)
  // -------------------------------------------------------------------------
  const addCredential = useCallback(
    async (credential: PodCredential) => {
      if (!webId || !podRoot) {
        throw new Error("You must be logged in to save credentials");
      }

      // Optimistic update — show the credential immediately
      queryClient.setQueryData<PodCredential[]>(
        [QUERY_KEY, webId],
        (prev = []) => [...prev, credential],
      );

      try {
        await writeCredentialToPod(fetchFn, podRoot, credential);
      } catch (err) {
        // Roll back the optimistic update on failure
        queryClient.setQueryData<PodCredential[]>(
          [QUERY_KEY, webId],
          (prev = []) => prev.filter((c) => c.id !== credential.id),
        );
        throw err;
      }
    },
    [webId, podRoot, fetchFn, queryClient],
  );

  // -------------------------------------------------------------------------
  // Update status (optimistic cache update + targeted Pod write)
  // -------------------------------------------------------------------------
  const updateStatus = useCallback(
    async (credentialId: string, newStatus: CredentialStatus) => {
      if (!webId || !podRoot) {
        throw new Error("You must be logged in to update credentials");
      }

      // Stash previous data for rollback
      const previous = queryClient.getQueryData<PodCredential[]>([QUERY_KEY, webId]);

      // Optimistic update
      queryClient.setQueryData<PodCredential[]>(
        [QUERY_KEY, webId],
        (prev = []) =>
          prev.map((c) => (c.id === credentialId ? { ...c, status: newStatus } : c)),
      );

      try {
        await updateCredentialStatusInPod(fetchFn, podRoot, credentialId, newStatus);
      } catch (err) {
        // Roll back
        if (previous) queryClient.setQueryData([QUERY_KEY, webId], previous);
        throw err;
      }
    },
    [webId, podRoot, fetchFn, queryClient],
  );

  return {
    credentials,
    isLoading: podLoading || queryLoading,
    error: readError instanceof Error ? readError : null,
    addCredential,
    updateStatus,
    refetch: async () => {
      await refetch();
    },
  };
}
