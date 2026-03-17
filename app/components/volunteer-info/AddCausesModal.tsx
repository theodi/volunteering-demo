"use client";

import { useState, useEffect } from "react";
import { HeartIcon, PlusIcon } from "@heroicons/react/24/outline";
import ModalWrapper from "../ModalWrapper";
import { ModalHeader } from "../ModalHeader";
import { ModalSearchInput } from "../ModalSearchInput";
import { CheckIconCustom } from "../svg/CheckIconCustom";
import { useVolunteerCauses } from "@/app/lib/hooks/useVolunteerCauses";

export type AddCausesModalProps = {
  isOpen: boolean;
  onClose: () => void;
  selectedCauses: string[];
  onSave: (selected: string[]) => void;
};

export function AddCausesModal({
  isOpen,
  onClose,
  selectedCauses,
  onSave,
}: AddCausesModalProps) {
  const { allCauseLabels, isLoading, error } = useVolunteerCauses();
  const [selected, setSelected] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (isOpen) {
      setSelected([...selectedCauses]);
      setSearchQuery("");
    }
  }, [isOpen, selectedCauses]);

  const filteredCauses = searchQuery.trim()
    ? allCauseLabels.filter((label) =>
        label.toLowerCase().includes(searchQuery.trim().toLowerCase())
      )
    : allCauseLabels;

  const handleToggle = (cause: string) => {
    setSelected((prev) =>
      prev.includes(cause) ? prev.filter((c) => c !== cause) : [...prev, cause]
    );
  };

  const handleClose = () => {
    onSave(selected);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <ModalWrapper isOpen={isOpen} onClose={handleClose} className="max-w-xl! w-full border-none! rounded-sm!">
      <section className="w-full flex flex-col min-h-[55vh] max-h-[55vh]">
        <ModalHeader title="Add Causes" onClose={handleClose} icon={<HeartIcon className="h-6 w-6" />} />

        <ModalSearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search Causes"
          ariaLabel="Search causes"
          className="px-5 pt-3"
        />

        {/* Causes grid - scrollable */}
        <div className="overflow-y-auto px-5 py-4">
          {error != null && (
            <p className="text-sm text-red-600">Could not load causes. Please try again.</p>
          )}
          {isLoading && (
            <p className="text-sm text-gray-500">Loading causes…</p>
          )}
          {!isLoading && !error && filteredCauses.length === 0 && (
            <p className="text-sm text-gray-500">
              {searchQuery.trim() ? "No causes match your search." : "No causes available."}
            </p>
          )}
          {!isLoading && !error && filteredCauses.length > 0 && (
            <div className="grid grid-cols-2 gap-2">
              {filteredCauses.map((cause) => {
                const isSelected = selected.includes(cause);
                return (
                  <button
                    key={cause}
                    type="button"
                    onClick={() => handleToggle(cause)}
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
                );
              })}
            </div>
          )}
        </div>
      </section>
    </ModalWrapper>
  );
}
