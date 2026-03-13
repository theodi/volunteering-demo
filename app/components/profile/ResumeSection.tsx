import { Card } from "./Card";
import { SectionTitle } from "./Card";
import { ProfileEntry } from "./ProfileEntry";
import { EmptyState } from "./EmptyState";
import { BriefcaseIcon } from "@heroicons/react/24/outline";

export type ResumeItem = {
  companyInitial: string;
  companyName: string;
  logoUrl?: string;
  jobTitle: string;
  employmentType: string;
  location: string;
  period: string;
  description?: string;
  descriptionFull?: string;
};

export function ResumeSection({ items = [] }: { items?: ResumeItem[] }) {
  return (
    <Card>
      <SectionTitle>Resume</SectionTitle>
      <div className="space-y-5">
        {items.length > 0 ? (
          items.map((entry, i) => (
            <ProfileEntry
              key={i}
              initial={entry.companyInitial}
              logoUrl={entry.logoUrl}
              title={entry.jobTitle}
              badge={entry.employmentType}
              rightLabel={entry.period}
              subtitlePrimary={entry.companyName}
              subtitleSecondary={entry.location}
              description={entry.description}
              descriptionFull={entry.descriptionFull}
            />
          ))
        ) : (
          <EmptyState
            title="No experience yet"
            description="Add your work history and roles."
            icon={<BriefcaseIcon className="h-5 w-5" />}
            className="border-none"
          />
        )}
      </div>
    </Card>
  );
}
