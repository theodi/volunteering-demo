"use client";

import { useState, useEffect } from "react";
import {
  HeartIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import ModalWrapper from "../ModalWrapper";
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
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-6 w-6 items-center justify-center text-primary">
              <HeartIcon className="h-6 w-6" />
            </span>
            <h2 className="text-lg font-semibold text-gray-900">Add Causes</h2>
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close"
            className="rounded p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Search */}
        <div className="px-5 pt-3">
          <div className="flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2">
            <MagnifyingGlassIcon className="h-5 w-5 shrink-0 text-gray-400" />
            <input
              type="search"
              placeholder="Search Causes"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="min-w-0 flex-1 bg-transparent text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none"
              aria-label="Search causes"
            />
          </div>
        </div>

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
