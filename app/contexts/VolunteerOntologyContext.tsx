"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { VolunteerCauses, VolunteerEquipment } from "@/app/lib/volunteerOntology";

export type VolunteerOntologyContextValue = {
  causes: VolunteerCauses;
  equipment: VolunteerEquipment;
};

const VolunteerOntologyContext = createContext<VolunteerOntologyContextValue | null>(null);

export function VolunteerOntologyProvider({
  causes,
  equipment,
  children,
}: {
  causes: VolunteerCauses;
  equipment: VolunteerEquipment;
  children: ReactNode;
}) {
  return (
    <VolunteerOntologyContext.Provider value={{ causes, equipment }}>
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
