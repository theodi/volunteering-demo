"use client";

import { PlusIcon } from "@heroicons/react/24/outline";
import { OntologySelectModal } from "@/app/components/OntologySelectModal";
import { CheckIconCustom } from "@/app/components/svg/CheckIconCustom";
import { useVolunteerSkills } from "@/app/lib/hooks/useVolunteerSkills";

export type AddSkillsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  selectedSkills: string[];
  onSave: (selected: string[]) => void;
};

export function AddSkillsModal({ isOpen, onClose, selectedSkills, onSave }: AddSkillsModalProps) {
  const { allSkillLabels, isLoading, error } = useVolunteerSkills();

  return (
    <OntologySelectModal
      isOpen={isOpen}
      onClose={onClose}
      selected={selectedSkills}
      onSave={onSave}
      items={allSkillLabels}
      isLoading={isLoading}
      error={error}
      getKey={(s) => s}
      matchesSearch={(s, q) => s.toLowerCase().includes(q)}
      title="Add Skills"
      searchPlaceholder="Skill (ex: JavaScript)"
      entityName="skills"
      modalClassName="!max-w-xl w-full rounded-xl border-none"
      sectionClassName="flex w-full flex-col min-h-[50vh] max-h-[60vh]"
      beforeList={
        <h4 className="text-sm md:text-base font-medium text-slate-900 mb-4">
          Suggested based on your profile
        </h4>
      }
      renderItem={(skill, isSelected, onToggle) => (
        <button
          key={skill}
          type="button"
          onClick={onToggle}
          className={`inline-flex items-center gap-2 rounded-md border px-2.5 py-2 text-left text-slate-900 text-sm font-medium transition cursor-pointer mr-2 mb-2 ${
            isSelected
              ? "border-primary/30 bg-primary-light"
              : "border-slate-300 bg-white hover:border-slate-300 hover:bg-slate-50"
          }`}
        >
          <span className="min-w-0">{skill}</span>
          {isSelected ? (
            <span className="flex h-4 w-4 shrink-0 items-center justify-center text-primary">
              <CheckIconCustom className="h-full w-full" />
            </span>
          ) : (
            <span className="flex h-4 w-4 shrink-0 items-center justify-center text-gray-400">
              <PlusIcon className="h-full w-full text-slate-900" />
            </span>
          )}
        </button>
      )}
    />
  );
}
