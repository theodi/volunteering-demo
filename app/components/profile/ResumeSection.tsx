import { Card } from "./Card";
import { SectionTitle } from "./Card";
import { ProfileEntry } from "./ProfileEntry";

const resumeData: Array<{
  companyInitial: string;
  companyName: string;
  logoUrl?: string;
  jobTitle: string;
  employmentType: string;
  location: string;
  period: string;
  description: string;
  descriptionFull: string;
}> = [
  {
    companyInitial: "G",
    companyName: "Google",
    logoUrl: "/google-logo.jpg",
    jobTitle: "Front-End Developer",
    employmentType: "Fulltime",
    location: "Istanbul, Turkey",
    period: "Oct, 2025 to Present",
    description:
      "Experienced instrumentation specialist with a strong background in aerospace missions and field testing. Contributed to advanced space research projects including Mars mission support...",
    descriptionFull:
      "Experienced instrumentation specialist with a strong background in aerospace missions and field testing. Contributed to advanced space research projects including Mars mission support and flight operations. Passionate about precision engineering, innovation and driving results in demanding environments.",
  },
  {
    companyInitial: "M",
    companyName: "Microsoft",
    jobTitle: "Front-End Developer",
    employmentType: "Fulltime",
    location: "Istanbul, Turkey",
    period: "Oct, 2025 to Present",
    description:
      "Experienced instrumentation specialist with a strong background in aerospace missions and field testing. Contributed to advanced space research projects including Mars mission support...",
    descriptionFull:
      "Experienced instrumentation specialist with a strong background in aerospace missions and field testing. Contributed to advanced space research projects including Mars mission support and flight operations. Passionate about precision engineering, innovation and driving results in demanding environments.",
  },
  {
    companyInitial: "A",
    companyName: "Amazon",
    jobTitle: "Front-End Developer",
    employmentType: "Fulltime",
    location: "Istanbul, Turkey",
    period: "Oct, 2025 to Present",
    description:
      "Experienced instrumentation specialist with a strong background in aerospace missions and field testing. Contributed to advanced space research projects including Mars mission support...",
    descriptionFull:
      "Experienced instrumentation specialist with a strong background in aerospace missions and field testing. Contributed to advanced space research projects including Mars mission support and flight operations. Passionate about precision engineering, innovation and driving results in demanding environments.",
  },
];

export function ResumeSection() {
  return (
    <Card>
      <SectionTitle>Resume</SectionTitle>
      <div className="space-y-5">
        {resumeData.map((entry, i) => (
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
        ))}
      </div>
    </Card>
  );
}
