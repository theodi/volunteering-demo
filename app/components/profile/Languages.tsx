import Link from "next/link";
import { Card } from "./Card";
import { SectionTitle } from "./Card";

export type LanguageEntryProps = {
  language: string;
  level: string;
};

export function LanguageEntry({ language, level }: LanguageEntryProps) {
  return (
    <div className="flex justify-between py-2 last:border-0">
      <span className="text-sm font-medium text-gray-900">{language}</span>
      <span className="text-sm  text-gray-700">{level}</span>
    </div>
  );
}

const languagesData = [
  { language: "English", level: "Fluent" },
  { language: "Modern Greek", level: "Intermediate" },
  { language: "German", level: "Intermediate" },
  { language: "Hindi", level: "Basic" },
];

export function Languages() {
  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <SectionTitle>Languages</SectionTitle>
        <Link
          href="#"
          className="text-sm font-medium text-primary hover:underline"
        >
          + Add More
        </Link>
      </div>
      <div>
        {languagesData.map((entry) => (
          <LanguageEntry key={entry.language} {...entry} />
        ))}
      </div>
    </Card>
  );
}
