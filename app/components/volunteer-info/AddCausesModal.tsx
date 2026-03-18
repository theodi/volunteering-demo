"use client";

import { HeartIcon, PlusIcon } from "@heroicons/react/24/outline";
import { OntologySelectModal } from "@/app/components/OntologySelectModal";
import { CheckIconCustom } from "@/app/components/svg/CheckIconCustom";
import { useVolunteerCauses } from "@/app/lib/hooks/useVolunteerCauses";

export type AddCausesModalProps = {
  isOpen: boolean;
  onClose: () => void;
  selectedCauses: string[];
  onSave: (selected: string[]) => void;
};

export function AddCausesModal({ isOpen, onClose, selectedCauses, onSave }: AddCausesModalProps) {
  const { allCauseLabels, isLoading, error } = useVolunteerCauses();

  return (
    <OntologySelectModal
      isOpen={isOpen}
      onClose={onClose}
      selected={selectedCauses}
      onSave={onSave}
      items={allCauseLabels}
      isLoading={isLoading}
      error={error}
      getKey={(c) => c}
      matchesSearch={(c, q) => c.toLowerCase().includes(q)}
      title="Add Causes"
      icon={<HeartIcon className="h-6 w-6" />}
      searchPlaceholder="Search Causes"
      entityName="causes"
      searchInputClassName="px-5 pt-3"
      gridContainerClassName="w-full flex flex-wrap gap-2"
      renderItem={(cause, isSelected, onToggle) => (

        <button
          key={cause}
          type="button"
          onClick={onToggle}
          className={`flex items-center justify-between gap-2 rounded-sm border px-3.5 py-2.5 text-left text-sm font-medium transition cursor-pointer ${
            isSelected
              ? "border-lavender bg-lavender text-primary"
              : "border-gray-200 bg-white text-slate-900 hover:border-slate-300 hover:bg-slate-50"
          }`}
        >
          <span className="min-w-0 truncate">{cause}</span>
          {isSelected ? (
            <span className="flex h-4 w-4 shrink-0 items-center justify-center text-primary">
              <CheckIconCustom className="w-full h-full" />
            </span>
          ) : (
            <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center text-gray-400">
              <PlusIcon className="w-full h-full" />
            </span>
          )}
        </button>
      )}
    />
  );
}
