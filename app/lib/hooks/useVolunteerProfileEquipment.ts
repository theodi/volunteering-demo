"use client";

import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSolidAuth } from "@ldo/solid-react";
import { usePodRoot } from "@/app/lib/hooks/usePodRoot";
import { useVolunteerOntology } from "@/app/contexts/VolunteerOntologyContext";
import {
  readEquipmentFromPod,
  writeEquipmentToPod,
} from "@/app/lib/helpers/volunteerProfileSkills";
import type { EquipmentEntry } from "@/app/components/volunteer-info/EquipmentInventory";

const SAVE_DEBOUNCE_MS = 600;

const CUSTOM_URI_PREFIX = "urn:volunteer:custom-equipment:";

function isCustomEquipmentUri(uri: string): boolean {
  return uri.startsWith(CUSTOM_URI_PREFIX);
}

function mintCustomEquipmentUri(title: string): string {
  return `${CUSTOM_URI_PREFIX}${encodeURIComponent(title)}`;
}

function parseCustomEquipmentTitle(uri: string): string {
  return decodeURIComponent(uri.slice(CUSTOM_URI_PREFIX.length));
}

export type UseVolunteerProfileEquipmentResult = {
  equipmentUris: string[];
  equipmentEntries: EquipmentEntry[];
  isLoading: boolean;
  isSaving: boolean;
  error: Error | null;
  saveEquipment: (entries: EquipmentEntry[]) => void;
  refetch: () => Promise<void>;
};

function getCategoryForLabel(categories: Record<string, string[]>, label: string): string | null {
  for (const [cat, labels] of Object.entries(categories)) {
    if (labels.includes(label)) return cat;
  }
  return null;
}

/**
 * Loads the user's equipment from {pod}/volunteer/profile.ttl and exposes
 * saveEquipment(entries) to persist via hasEquipment.
 *
 * Both ontology and custom equipment are stored as IRIs under hasEquipment:
 * - Ontology items use their concept IRI (e.g. vp:SomeEquipment)
 * - Custom items use a minted URN (urn:volunteer:custom-equipment:{encoded title})
 */
export function useVolunteerProfileEquipment(): UseVolunteerProfileEquipmentResult {
  const queryClient = useQueryClient();
  const { fetch: authFetch } = useSolidAuth();
  const { podRoot, webId } = usePodRoot();
  const { equipment: ontologyEquipment } = useVolunteerOntology();
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
    data: equipmentUris = [],
    isLoading,
    error: readError,
    refetch,
  } = useQuery({
    queryKey: ["volunteerEquipment", webId],
    queryFn: () => readEquipmentFromPod(fetchFn, podRoot!),
    enabled: !!webId && !!podRoot,
  });

  const equipmentEntries = useMemo<EquipmentEntry[]>(() => {
    return equipmentUris.map((uri) => {
      const ontologyLabel = ontologyEquipment.equipmentIriToLabel[uri];
      if (ontologyLabel) {
        const category = getCategoryForLabel(ontologyEquipment.categories, ontologyLabel) ?? "Equipment";
        return { id: ontologyLabel, title: ontologyLabel, description: category };
      }
      if (isCustomEquipmentUri(uri)) {
        const title = parseCustomEquipmentTitle(uri);
        return { id: uri, title, description: "Custom Equipment" };
      }
      return { id: uri, title: uri, description: "Equipment" };
    });
  }, [equipmentUris, ontologyEquipment.categories, ontologyEquipment.equipmentIriToLabel]);

  const saveEquipment = useCallback(
    (entries: EquipmentEntry[]) => {
      if (!webId || !podRoot) {
        setSaveError(new Error("You must be logged in to save equipment"));
        return;
      }

      const { labelToEquipmentIri } = ontologyEquipment;
      const uris = entries.map((e) => {
        const ontologyUri = labelToEquipmentIri[e.title.trim()];
        if (ontologyUri) return ontologyUri;
        if (isCustomEquipmentUri(e.id)) return e.id;
        return mintCustomEquipmentUri(e.title.trim());
      });

      setSaveError(null);
      queryClient.setQueryData(["volunteerEquipment", webId], uris);
      setIsSaving(true);

      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(() => {
        saveTimeoutRef.current = null;
        writeEquipmentToPod(fetchFn, podRoot, uris)
          .catch((err) => {
            setSaveError(err instanceof Error ? err : new Error("Failed to save equipment"));
          })
          .finally(() => setIsSaving(false));
      }, SAVE_DEBOUNCE_MS);
    },
    [webId, podRoot, fetchFn, ontologyEquipment, queryClient],
  );

  return {
    equipmentUris,
    equipmentEntries,
    isLoading,
    isSaving,
    error: readError instanceof Error ? readError : saveError,
    saveEquipment,
    refetch: async () => { await refetch(); },
  };
}
