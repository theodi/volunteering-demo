"use client";

import type { VolunteerEquipment } from "@/app/lib/volunteerOntology";
import { useVolunteerOntology } from "@/app/contexts/VolunteerOntologyContext";

export type UseVolunteerEquipmentResult = {
  categories: VolunteerEquipment["categories"];
  allEquipmentLabels: string[];
  isLoading: boolean;
  error: Error | null;
};

/**
 * Equipment categories and labels from the volunteer ontology.
 * Requires VolunteerOntologyProvider (data is loaded on the server).
 */
export function useVolunteerEquipment(): UseVolunteerEquipmentResult {
  const { equipment } = useVolunteerOntology();
  return {
    categories: equipment.categories,
    allEquipmentLabels: equipment.allEquipmentLabels,
    isLoading: false,
    error: null,
  };
}

