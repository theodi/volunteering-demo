"use client";

import { XMarkIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { Card } from "./Card";
import { SectionTitle } from "./Card";
import { EmptyState } from "./EmptyState";
import { TagIcon } from "@heroicons/react/24/outline";

export type SkillTagProps = {
  label: string;
  onRemove?: () => void;
};

export function SkillTag({ label, onRemove }: SkillTagProps) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-gray-100 px-3 py-1 text-sm font-medium text-slate-900">
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

export function Skills({ skills = [] }: { skills?: string[] }) {
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
        {skills.length > 0 ? (
          skills.map((skill) => (
            <SkillTag key={skill} label={skill} onRemove={() => { }} />
          ))
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <EmptyState
              title="No skills yet"
              description="Add skills that describe your experience."
              icon={<TagIcon className="h-5 w-5" />}
              className="border-none bg-transparent"
            />
          </div>
        )}
      </div>
    </Card>
  );
}
