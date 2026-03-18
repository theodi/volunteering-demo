"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSolidAuth } from "@ldo/solid-react";
import { usePodRoot } from "@/app/lib/hooks/usePodRoot";
import { useVolunteerOntology } from "@/app/contexts/VolunteerOntologyContext";
import {
  readSkillsFromPod,
  writeSkillsToPod,
} from "@/app/lib/helpers/volunteerProfileSkills";

const SAVE_DEBOUNCE_MS = 600;

export type UseVolunteerProfileSkillsResult = {
  skillLabels: string[];
  skillUris: string[];
  isLoading: boolean;
  isSaving: boolean;
  error: Error | null;
  saveSkills: (labels: string[]) => void;
  refetch: () => Promise<void>;
};

/**
 * Loads the user's skills from {pod}/volunteer/profile.ttl and exposes
 * saveSkills(labels) to persist via ontology predicate hasSkill.
 * Reads are cached/deduped by React Query; saves are debounced locally.
 */
export function useVolunteerProfileSkills(): UseVolunteerProfileSkillsResult {
  const queryClient = useQueryClient();
  const { session, fetch: authFetch } = useSolidAuth();
  const { podRoot, webId } = usePodRoot();
  const { skills: ontologySkills } = useVolunteerOntology();
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
    data: skillUris = [],
    isLoading,
    error: readError,
    refetch,
  } = useQuery({
    queryKey: ["volunteerSkills", webId],
    queryFn: () => readSkillsFromPod(fetchFn, podRoot!),
    enabled: !!webId && !!podRoot,
  });

  const saveSkills = useCallback(
    (labels: string[]) => {
      if (!webId || !podRoot) {
        setSaveError(new Error("You must be logged in to save skills"));
        return;
      }
      const { labelToSkillIri } = ontologySkills;
      const uris = labels
        .map((label) => labelToSkillIri[label.trim()])
        .filter((uri): uri is string => typeof uri === "string");

      setSaveError(null);
      queryClient.setQueryData(["volunteerSkills", webId], uris);
      setIsSaving(true);

      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(() => {
        saveTimeoutRef.current = null;
        writeSkillsToPod(fetchFn, podRoot, uris)
          .catch((err) => {
            setSaveError(err instanceof Error ? err : new Error("Failed to save skills"));
          })
          .finally(() => setIsSaving(false));
      }, SAVE_DEBOUNCE_MS);
    },
    [webId, podRoot, fetchFn, ontologySkills, queryClient],
  );

  const skillLabels = skillUris.map((uri) => {
    const label = ontologySkills.skillIriToLabel[uri];
    if (label) return label;
    try {
      const fragment = new URL(uri).hash?.slice(1) || uri.split("/").pop();
      return fragment ?? uri;
    } catch {
      return uri;
    }
  });

  return {
    skillLabels,
    skillUris,
    isLoading,
    isSaving,
    error: readError instanceof Error ? readError : saveError,
    saveSkills,
    refetch: async () => { await refetch(); },
  };
}
