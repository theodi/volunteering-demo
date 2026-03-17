/**
 * Server-only: reads ontology/volunteer.ttl from disk and returns parsed causes and equipment.
 * Import only from Server Components or server code (e.g. volunteer-info page).
 */

import { readFileSync } from "fs";
import { join } from "path";
import {
  parseVolunteerTtl,
  parseVolunteerEquipmentTtl,
  type VolunteerCauses,
  type VolunteerEquipment,
} from "@/app/lib/volunteerOntology";

export type VolunteerOntologyData = {
  causes: VolunteerCauses;
  equipment: VolunteerEquipment;
};

export function loadVolunteerOntology(): VolunteerOntologyData {
  const path = join(process.cwd(), "ontology", "volunteer.ttl");
  const text = readFileSync(path, "utf-8");
  return {
    causes: parseVolunteerTtl(text),
    equipment: parseVolunteerEquipmentTtl(text),
  };
}
