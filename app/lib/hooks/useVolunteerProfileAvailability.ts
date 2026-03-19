"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSolidAuth } from "@ldo/solid-react";
import { usePodRoot } from "@/app/lib/hooks/usePodRoot";
import {
  readTimesFromPod,
  writeTimesToPod,
} from "@/app/lib/helpers/volunteerProfileSkills";

const SAVE_DEBOUNCE_MS = 600;

export type UseVolunteerProfileAvailabilityResult = {
  selectedSlots: Set<string>;
  isLoading: boolean;
  isSaving: boolean;
  error: Error | null;
  saveSlots: (slots: Set<string>) => void;
};

/**
 * Loads the user's preferred availability from {pod}/volunteer/profile.ttl
 * (vp:preferredTime nodes with vp:day + vp:time).
 * Returns scheduler-compatible slot keys (Set<"dayIdx-hour">).
 * Reads are cached by React Query; saves are debounced.
 */
export function useVolunteerProfileAvailability(): UseVolunteerProfileAvailabilityResult {
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
    data: selectedSlots,
    isLoading,
    error: readError,
  } = useQuery({
    queryKey: ["volunteerAvailability", webId],
    queryFn: () => readTimesFromPod(fetchFn, podRoot!),
    enabled: !!webId && !!podRoot,
  });

  const saveSlots = useCallback(
    (next: Set<string>) => {
      if (!webId || !podRoot) {
        setSaveError(new Error("You must be logged in to save availability"));
        return;
      }

      setSaveError(null);
      queryClient.setQueryData(["volunteerAvailability", webId], next);
      setIsSaving(true);

      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(() => {
        saveTimeoutRef.current = null;
        writeTimesToPod(fetchFn, podRoot, next)
          .catch((err) => {
            setSaveError(err instanceof Error ? err : new Error("Failed to save availability"));
          })
          .finally(() => setIsSaving(false));
      }, SAVE_DEBOUNCE_MS);
    },
    [webId, podRoot, fetchFn, queryClient],
  );

  return {
    selectedSlots: selectedSlots ?? new Set(),
    isLoading,
    isSaving,
    error: readError instanceof Error ? readError : saveError,
    saveSlots,
  };
}
