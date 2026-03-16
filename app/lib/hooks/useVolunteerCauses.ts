"use client";

import { useEffect, useState } from "react";
import { getVolunteerCauses, type VolunteerCauses } from "@/app/lib/volunteerOntology";

export type UseVolunteerCausesResult = {
  categories: VolunteerCauses["categories"];
  allCauseLabels: string[];
  isLoading: boolean;
  error: Error | null;
};

/**
 * Loads cause categories and cause labels from the volunteer ontology (public/ontology/volunteer.ttl).
 */
export function useVolunteerCauses(): UseVolunteerCausesResult {
  const [data, setData] = useState<VolunteerCauses | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    getVolunteerCauses()
      .then(setData)
      .catch((err) => setError(err instanceof Error ? err : new Error(String(err))))
      .finally(() => setIsLoading(false));
  }, []);

  return {
    categories: data?.categories ?? {},
    allCauseLabels: data?.allCauseLabels ?? [],
    isLoading,
    error,
  };
}
