"use client";

import { useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { Card } from "./Card";
import { SectionTitle } from "./Card";
import { EmptyState } from "./EmptyState";
import { TagIcon } from "@heroicons/react/24/outline";
import { AddSkillsModal } from "./AddSkillsModal";

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
          className="rounded-full p-0.5 hover:bg-gray-200 cursor-pointer"
        >
          <XMarkIcon className="h-3.5 w-3.5 text-gray-500" />
        </button>
      )}
    </span>
  );
}

export type SkillsProps = {
  /** When provided, skills are loaded from and saved to the user's Pod (extended profile). */
  skills?: string[];
  /** Called when user saves in the modal or removes a tag; receives new full list of labels (debounced in hook). */
  onSave?: (labels: string[]) => void;
  isLoading?: boolean;
  /** True while a save is pending or in flight (e.g. debounced write). */
  isSaving?: boolean;
  saveError?: Error | null;
};

export function Skills({
  skills: controlledSkills,
  onSave,
  isLoading = false,
  isSaving = false,
  saveError = null,
}: SkillsProps) {
  const [internalSkills, setInternalSkills] = useState<string[]>([]);
  const [modalOpen, setModalOpen] = useState(false);

  const skills = controlledSkills ?? internalSkills;
  const saving = onSave ? isSaving : false;

  const handleSaveSkills = (selected: string[]) => {
    if (onSave) {
      onSave(selected);
      setModalOpen(false);
    } else {
      setInternalSkills(selected);
      setModalOpen(false);
    }
  };

  const handleRemove = (skill: string) => {
    const next = skills.filter((s) => s !== skill);
    if (onSave) {
      onSave(next);
    } else {
      setInternalSkills(next);
    }
  };

  return (
    <>
      <Card>
        <div className="mb-4 flex items-center justify-between">
          <SectionTitle>Skills</SectionTitle>
          {saveError && (
            <p className="text-sm text-amber-700" role="alert">
              {saveError.message}
            </p>
          )}
          <Link
            href="#"
            className="text-sm font-medium text-primary hover:underline"
            onClick={(e) => {
              e.preventDefault();
              if (!saving) setModalOpen(true);
            }}
            aria-disabled={saving || isLoading}
          >
            {saving ? "Saving…" : "+ Add More"}
          </Link>
        </div>
        <div className="flex flex-wrap gap-2 max-h-[30vh] overflow-y-auto">
          {isLoading ? (
            <p className="flex items-center justify-center text-sm text-slate-500">Loading skills…</p>
          ) : skills.length > 0 ? (
            skills.map((skill) => (
              <SkillTag
                key={skill}
                label={skill}
                onRemove={() => handleRemove(skill)}
              />
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

      <AddSkillsModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        selectedSkills={skills}
        onSave={handleSaveSkills}
      />
    </>
  );
}
