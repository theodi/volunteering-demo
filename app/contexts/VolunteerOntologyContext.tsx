"use client";

import { createContext, useContext, type ReactNode } from "react";
import type {
  VolunteerCauses,
  VolunteerEquipment,
  VolunteerSkills,
} from "@/app/lib/volunteerOntology";

export type VolunteerOntologyContextValue = {
  causes: VolunteerCauses;
  equipment: VolunteerEquipment;
  skills: VolunteerSkills;
};

const VolunteerOntologyContext = createContext<VolunteerOntologyContextValue | null>(null);

export function VolunteerOntologyProvider({
  causes,
  equipment,
  skills,
  children,
}: {
  causes: VolunteerCauses;
  equipment: VolunteerEquipment;
  skills: VolunteerSkills;
  children: ReactNode;
}) {
  return (
    <VolunteerOntologyContext.Provider value={{ causes, equipment, skills }}>
      {children}
    </VolunteerOntologyContext.Provider>
  );
}

export function useVolunteerOntology(): VolunteerOntologyContextValue {
  const value = useContext(VolunteerOntologyContext);
  if (value == null) {
    throw new Error("useVolunteerOntology must be used within VolunteerOntologyProvider");
  }
  return value;
}
