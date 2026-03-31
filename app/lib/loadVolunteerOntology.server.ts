/**
 * Server-only: reads ontology/volunteer.ttl from disk and returns parsed causes and equipment.
 * Import only from Server Components or server code (e.g. volunteer-info page).
 */

import { readFileSync } from "fs";
import { join } from "path";
import { unstable_noStore as noStore } from "next/cache";
import {
  parseVolunteerTtl,
  parseVolunteerEquipmentTtl,
  parseVolunteerSkillsTtl,
  type VolunteerCauses,
  type VolunteerEquipment,
  type VolunteerSkills,
} from "@/app/lib/volunteerOntology";

export type VolunteerOntologyData = {
  causes: VolunteerCauses;
  equipment: VolunteerEquipment;
  skills: VolunteerSkills;
};

export function loadVolunteerOntology(): VolunteerOntologyData {
  // Ensure ontology updates are reflected immediately in server-rendered UI.
  noStore();
  const path = join(process.cwd(), "ontology", "volunteer.ttl");
  const text = readFileSync(path, "utf-8");
  return {
    causes: parseVolunteerTtl(text),
    equipment: parseVolunteerEquipmentTtl(text),
    skills: parseVolunteerSkillsTtl(text),
  };
}
