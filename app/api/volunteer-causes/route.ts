import { readFileSync } from "fs";
import { join } from "path";
import { parseVolunteerTtl } from "@/app/lib/volunteerOntology";

/**
 * GET /api/volunteer-causes
 * Reads ontology/volunteer.ttl from the project root and returns parsed cause categories and labels.
 */
export async function GET() {
  const path = join(process.cwd(), "ontology", "volunteer.ttl");
  const text = readFileSync(path, "utf-8");
  const data = parseVolunteerTtl(text);
  return Response.json(data);
}
