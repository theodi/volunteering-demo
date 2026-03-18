"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSolidAuth } from "@ldo/solid-react";
import { usePodRoot } from "@/app/lib/hooks/usePodRoot";
import {
  readLocationsFromPod,
  writeLocationsToPod,
} from "@/app/lib/helpers/volunteerProfileSkills";
import type { SavedLocation } from "@/app/components/volunteer-info/PreferredLocations";

const SAVE_DEBOUNCE_MS = 800;

export type UseVolunteerProfileLocationsResult = {
  locations: SavedLocation[];
  isLoading: boolean;
  isSaving: boolean;
  error: Error | null;
  saveLocations: (locations: SavedLocation[]) => void;
  refetch: () => Promise<void>;
};

/**
 * Loads the user's preferred locations from {pod}/volunteer/profile.ttl
 * (hasLocation blank nodes with lat, lon, distance, label).
 * Reads are cached by React Query; saves are debounced.
 */
export function useVolunteerProfileLocations(): UseVolunteerProfileLocationsResult {
  const queryClient = useQueryClient();
  const { fetch: authFetch } = useSolidAuth();
  const { podRoot, webId } = usePodRoot();
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
    data: locations = [],
    isLoading,
    error: readError,
    refetch,
  } = useQuery({
    queryKey: ["volunteerLocations", webId],
    queryFn: () => readLocationsFromPod(fetchFn, podRoot!),
    enabled: !!webId && !!podRoot,
  });

  const saveLocations = useCallback(
    (next: SavedLocation[]) => {
      if (!webId || !podRoot) {
        setSaveError(new Error("You must be logged in to save locations"));
        return;
      }

      setSaveError(null);
      queryClient.setQueryData(["volunteerLocations", webId], next);
      setIsSaving(true);

      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(() => {
        saveTimeoutRef.current = null;
        writeLocationsToPod(fetchFn, podRoot, next)
          .catch((err) => {
            setSaveError(err instanceof Error ? err : new Error("Failed to save locations"));
          })
          .finally(() => setIsSaving(false));
      }, SAVE_DEBOUNCE_MS);
    },
    [webId, podRoot, fetchFn, queryClient],
  );

  return {
    locations,
    isLoading,
    isSaving,
    error: readError instanceof Error ? readError : saveError,
    saveLocations,
    refetch: async () => { await refetch(); },
  };
}
