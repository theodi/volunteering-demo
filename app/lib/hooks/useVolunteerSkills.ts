"use client";

import type { VolunteerSkills } from "@/app/lib/volunteerOntology";
import { useVolunteerOntology } from "@/app/contexts/VolunteerOntologyContext";

export type UseVolunteerSkillsResult = {
  categories: VolunteerSkills["categories"];
  allSkillLabels: string[];
  isLoading: boolean;
  error: Error | null;
};

/**
 * Skill categories and labels from the volunteer ontology.
 * Requires VolunteerOntologyProvider (data is loaded on the server).
 */
export function useVolunteerSkills(): UseVolunteerSkillsResult {
  const { skills } = useVolunteerOntology();
  return {
    categories: skills.categories,
    allSkillLabels: skills.allSkillLabels,
    isLoading: false,
    error: null,
  };
}
