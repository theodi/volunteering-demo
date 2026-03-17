import { Card } from "./Card";
import { SectionTitle } from "./Card";
import { ProfileEntry } from "./ProfileEntry";
import { EmptyState } from "./EmptyState";
import { AcademicCapIcon } from "@heroicons/react/24/outline";

export type EducationItem = {
  schoolInitial: string;
  schoolName: string;
  employmentType: string;
  degree: string;
  location: string;
  date: string;
};

export function EducationSection({ items = [] }: { items?: EducationItem[] }) {
  return (
    <Card>
      <SectionTitle>Education</SectionTitle>
      <div className="space-y-5">
        {items.length > 0 ? (
          items.map((entry, i) => (
            <ProfileEntry
              key={i}
              initial={entry.schoolInitial}
              title={entry.schoolName}
              badge={entry.employmentType}
              rightLabel={entry.date}
              subtitlePrimary={entry.degree}
              subtitleSecondary={entry.location}
            />
          ))
        ) : (
          <EmptyState
            title="No education yet"
            description="Add your schools and qualifications."
            icon={<AcademicCapIcon className="h-5 w-5" />}
            className="border-none bg-transparent"
          />
        )}
      </div>
    </Card>
  );
}
