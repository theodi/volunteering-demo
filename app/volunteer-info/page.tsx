import { loadVolunteerOntology } from "@/app/lib/loadVolunteerOntology.server";
import { VolunteerOntologyProvider } from "@/app/contexts/VolunteerOntologyContext";
import { VolunteerInfo } from "@/app/components/volunteer-info/VolunteerInfo";

export default function VolunteerInfoPage() {
  const { causes, equipment } = loadVolunteerOntology();
  return (
    <VolunteerOntologyProvider causes={causes} equipment={equipment}>
      <VolunteerInfo />
    </VolunteerOntologyProvider>
  );
}
