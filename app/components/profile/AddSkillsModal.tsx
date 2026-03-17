"use client";

import { useState, useEffect } from "react";
import { PlusIcon } from "@heroicons/react/24/outline";
import ModalWrapper from "../ModalWrapper";
import { ModalHeader } from "../ModalHeader";
import { ModalSearchInput } from "../ModalSearchInput";
import { CheckIconCustom } from "../svg/CheckIconCustom";
import { useVolunteerSkills } from "@/app/lib/hooks/useVolunteerSkills";

export type AddSkillsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  selectedSkills: string[];
  onSave: (selected: string[]) => void;
};

export function AddSkillsModal({
  isOpen,
  onClose,
  selectedSkills,
  onSave,
}: AddSkillsModalProps) {
  const { allSkillLabels, isLoading, error } = useVolunteerSkills();
  const [selected, setSelected] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (isOpen) {
      setSelected([...selectedSkills]);
      setSearchQuery("");
    }
  }, [isOpen, selectedSkills]);

  const filteredSkills = searchQuery.trim()
    ? allSkillLabels.filter((label) =>
        label.toLowerCase().includes(searchQuery.trim().toLowerCase())
      )
    : allSkillLabels;

  const handleToggle = (skill: string) => {
    setSelected((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const handleClose = () => {
    onSave(selected);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <ModalWrapper isOpen={isOpen} onClose={handleClose} className="max-w-xl! w-full rounded-xl border-none">
      <section className="flex w-full flex-col min-h-[50vh] max-h-[60vh]">
        <ModalHeader title="Add Skills" onClose={handleClose} />

        <ModalSearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Skill (ex: JavaScript)"
          ariaLabel="Search skills"
        />

        {/* Suggested based on your profile */}
        <div className="overflow-y-auto px-5 py-4 space-y-5">
          <h4 className="text-sm md:text-base font-medium text-slate-900">
            Suggested based on your profile
          </h4>
          {error != null && (
            <p className="text-sm text-red-600">Could not load skills. Please try again.</p>
          )}
          {isLoading && (
            <p className="text-sm text-gray-500">Loading skills…</p>
          )}
          {!isLoading && !error && filteredSkills.length === 0 && (
            <p className="text-sm text-gray-500">
              {searchQuery.trim() ? "No skills match your search." : "No skills available."}
            </p>
          )}
          {!isLoading && !error && filteredSkills.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {filteredSkills.map((skill) => {
                const isSelected = selected.includes(skill);
                return (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => handleToggle(skill)}
                    className={`inline-flex items-center gap-2 rounded-md border px-2.5 py-2 text-left text-slate-900 text-sm font-medium transition cursor-pointer ${
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
                );
              })}
            </div>
          )}
        </div>
      </section>
    </ModalWrapper>
  );
}
