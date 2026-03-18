"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSolidAuth } from "@ldo/solid-react";
import { usePodRoot } from "@/app/lib/hooks/usePodRoot";
import { useVolunteerOntology } from "@/app/contexts/VolunteerOntologyContext";
import {
  readCausesFromPod,
  writeCausesToPod,
} from "@/app/lib/helpers/volunteerProfileSkills";

const SAVE_DEBOUNCE_MS = 600;

export type UseVolunteerProfileCausesResult = {
  causeLabels: string[];
  causeUris: string[];
  isLoading: boolean;
  isSaving: boolean;
  error: Error | null;
  saveCauses: (labels: string[]) => void;
  refetch: () => Promise<void>;
};

/**
 * Loads the user's causes from {pod}/volunteer/profile.ttl and exposes
 * saveCauses(labels) to persist via ontology predicate hasCause.
 * Reads are cached/deduped by React Query; saves are debounced locally.
 */
export function useVolunteerProfileCauses(): UseVolunteerProfileCausesResult {
  const queryClient = useQueryClient();
  const { fetch: authFetch } = useSolidAuth();
  const { podRoot, webId } = usePodRoot();
  const { causes: ontologyCauses } = useVolunteerOntology();
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<Error | null>(null);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchFn = typeof authFetch === "function" ? authFetch : fetch;

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, []);

  const {
    data: causeUris = [],
    isLoading,
    error: readError,
    refetch,
  } = useQuery({
    queryKey: ["volunteerCauses", webId],
    queryFn: () => readCausesFromPod(fetchFn, podRoot!),
    enabled: !!webId && !!podRoot,
  });

  const saveCauses = useCallback(
    (labels: string[]) => {
      if (!webId || !podRoot) {
        setSaveError(new Error("You must be logged in to save causes"));
        return;
      }
      const { labelToCauseIri } = ontologyCauses;
      const uris = labels
        .map((label) => labelToCauseIri[label.trim()])
        .filter((uri): uri is string => typeof uri === "string");

      setSaveError(null);
      queryClient.setQueryData(["volunteerCauses", webId], uris);
      setIsSaving(true);

      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(() => {
        saveTimeoutRef.current = null;
        writeCausesToPod(fetchFn, podRoot, uris)
          .catch((err) => {
            setSaveError(err instanceof Error ? err : new Error("Failed to save causes"));
          })
          .finally(() => setIsSaving(false));
      }, SAVE_DEBOUNCE_MS);
    },
    [webId, podRoot, fetchFn, ontologyCauses, queryClient],
  );

  const causeLabels = causeUris.map((uri) => {
    const label = ontologyCauses.causeIriToLabel[uri];
    if (label) return label;
    try {
      const fragment = new URL(uri).hash?.slice(1) || uri.split("/").pop();
      return fragment ?? uri;
    } catch {
      return uri;
    }
  });

  return {
    causeLabels,
    causeUris,
    isLoading,
    isSaving,
    error: readError instanceof Error ? readError : saveError,
    saveCauses,
    refetch: async () => { await refetch(); },
  };
}
