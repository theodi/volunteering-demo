"use client";

import { useState } from "react";
import { HeartIcon, XMarkIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { VolunteerInfoSection } from "./VolunteerInfoSection";
import { EmptyState } from "@/app/components/profile/EmptyState";
import { AddCausesModal } from "./AddCausesModal";
import { useVolunteerProfileCauses } from "@/app/lib/hooks/useVolunteerProfileCauses";

export function CausesOfInterest() {
  const [modalOpen, setModalOpen] = useState(false);
  const {
    causeLabels,
    isLoading,
    isSaving,
    error,
    saveCauses,
  } = useVolunteerProfileCauses();

  const handleSave = (selected: string[]) => {
    saveCauses(selected);
    setModalOpen(false);
  };

  const handleRemove = (cause: string) => {
    saveCauses(causeLabels.filter((c) => c !== cause));
  };

  return (
    <>
      <VolunteerInfoSection
        title="Causes of Interest"
        icon={<HeartIcon className="h-5 w-5" />}
        action={
          <Link
            href="#"
            className="text-sm font-semibold text-primary underline"
            onClick={(e) => {
              e.preventDefault();
              if (!isSaving) setModalOpen(true);
            }}
            aria-disabled={isSaving || isLoading}
          >
            {isSaving ? "Saving…" : "+ Add More"}
          </Link>
        }
      >
        {error != null && (
          <p className="w-full h-full flex items-center justify-center text-sm text-red-600" role="alert">
            {error.message}
          </p>
        )}
        {isLoading && (
          <p className="flex items-center justify-center text-sm text-slate-500">Loading causes…</p>
        )}
        {!error && !isLoading && causeLabels.length === 0 && (
          <EmptyState
            title="No causes selected"
            description="Add causes you're interested in."
            icon={<HeartIcon className="h-5 w-5" />}
            className="border-none bg-transparent"
          />
        )}
        {!error && !isLoading && causeLabels.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {causeLabels.map((cause) => (
              <span
                key={cause}
                className="inline-flex items-center gap-2 rounded-sm bg-gray-100 px-3 py-2.5 text-sm font-medium text-slate-900"
              >
                {cause}
                <button
                  type="button"
                  onClick={() => handleRemove(cause)}
                  aria-label={`Remove ${cause}`}
                  className="rounded-full p-0.5 hover:bg-gray-200 cursor-pointer"
                >
                  <XMarkIcon className="h-3.5 w-3.5 text-gray-400" />
                </button>
              </span>
            ))}
          </div>
        )}
      </VolunteerInfoSection>

      <AddCausesModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        selectedCauses={causeLabels}
        onSave={handleSave}
      />
    </>
  );
}
