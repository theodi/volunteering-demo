import { Card } from "./Card";
import { SectionTitle } from "./Card";
import { ProfileEntry } from "./ProfileEntry";

export type EducationItem = {
  schoolInitial: string;
  schoolName: string;
  employmentType: string;
  degree: string;
  location: string;
  date: string;
};

const educationData: EducationItem[] = [
  {
    schoolInitial: "M",
    schoolName: "Middle Earth Technic University",
    employmentType: "Fulltime",
    degree: "Master degree in Computer science and Mathermaties",
    location: "Istanbul, Turkey",
    date: "January 2025",
  },
  {
    schoolInitial: "B",
    schoolName: "Bogazici Techic University",
    employmentType: "Fulltime",
    degree: "Master degree in Computer science and Mathermaties",
    location: "Istanbul, Turkey",
    date: "January 2018",
  },
  {
    schoolInitial: "B",
    schoolName: "Bogazici Techic University",
    employmentType: "Fulltime",
    degree: "Master degree in Computer science and Mathermaties",
    location: "Istanbul, Turkey",
    date: "January 2013",
  },
];

export function EducationSection({ items }: { items?: EducationItem[] }) {
  const data = items ?? educationData;
  return (
    <Card>
      <SectionTitle>Education</SectionTitle>
      <div className="space-y-5">
        {data.map((entry, i) => (
          <ProfileEntry
            key={i}
            initial={entry.schoolInitial}
            title={entry.schoolName}
            badge={entry.employmentType}
            rightLabel={entry.date}
            subtitlePrimary={entry.degree}
            subtitleSecondary={entry.location}
          />
        ))}
      </div>
    </Card>
  );
}
