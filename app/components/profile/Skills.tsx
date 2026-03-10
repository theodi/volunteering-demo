"use client";

import { XMarkIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { Card } from "./Card";
import { SectionTitle } from "./Card";

export type SkillTagProps = {
  label: string;
  onRemove?: () => void;
};

export function SkillTag({ label, onRemove }: SkillTagProps) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-gray-100 px-3 py-1 text-sm text-slate-900 font-medium">
      {label}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${label}`}
          className="rounded-full p-0.5 hover:bg-gray-200"
        >
          <XMarkIcon className="h-3.5 w-3.5 text-gray-500" />
        </button>
      )}
    </span>
  );
}

const defaultSkills = [
  "JavaScript",
  "Java (computer Programming)",
  "Javanese",
  "Instrumentation Testing & Calibration",
  "Aerospace Mission Support",
  "Environmental & Field Testing",
  "Working in Weather Conditions",
];

export function Skills() {
  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <SectionTitle>Skills</SectionTitle>
        <Link
          href="#"
          className="text-sm font-medium text-primary hover:underline"
        >
          + Add More
        </Link>
      </div>
      <div className="flex flex-wrap gap-2">
        {defaultSkills.map((skill) => (
          <SkillTag key={skill} label={skill} onRemove={() => {}} />
        ))}
      </div>
    </Card>
  );
}
