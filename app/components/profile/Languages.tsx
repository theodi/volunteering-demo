import Link from "next/link";
import { Card } from "./Card";
import { SectionTitle } from "./Card";
import { EmptyState } from "./EmptyState";
import { LanguageIcon } from "@heroicons/react/24/outline";

export type LanguageEntryProps = {
  language: string;
  level: string;
};

export function LanguageEntry({ language, level }: LanguageEntryProps) {
  return (
    <div className="flex justify-between py-2 last:border-0">
      <span className="text-sm font-medium text-gray-900">{language}</span>
      <span className="text-sm text-gray-700">{level}</span>
    </div>
  );
}

export type LanguageItem = {
  language: string;
  level: string;
};

export function Languages({ items = [] }: { items?: LanguageItem[] }) {
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
        {items.length > 0 ? (
          items.map((entry) => (
            <LanguageEntry key={entry.language} {...entry} />
          ))
        ) : (
          <EmptyState
            title="No languages yet"
            description="Add languages you speak and your level."
            icon={<LanguageIcon className="h-5 w-5" />}
            className="border-none bg-transparent"
          />
        )}
      </div>
    </Card>
  );
}
