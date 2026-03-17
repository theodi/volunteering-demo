"use client";

import type { VolunteerCauses } from "@/app/lib/volunteerOntology";
import { useVolunteerOntology } from "@/app/contexts/VolunteerOntologyContext";

export type UseVolunteerCausesResult = {
  categories: VolunteerCauses["categories"];
  allCauseLabels: string[];
  isLoading: boolean;
  error: Error | null;
};

/**
 * Cause categories and labels from the volunteer ontology.
 * Requires VolunteerOntologyProvider (data is loaded on the server).
 */
export function useVolunteerCauses(): UseVolunteerCausesResult {
  const { causes } = useVolunteerOntology();
  return {
    categories: causes.categories,
    allCauseLabels: causes.allCauseLabels,
    isLoading: false,
    error: null,
  };
}
