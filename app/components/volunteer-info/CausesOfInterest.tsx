"use client";

import { useState } from "react";
import { HeartIcon, XMarkIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { VolunteerInfoSection } from "./VolunteerInfoSection";
import { useVolunteerCauses } from "@/app/lib/hooks/useVolunteerCauses";
import { EmptyState } from "../profile/EmptyState";
import { AddCausesModal } from "./AddCausesModal";

export function CausesOfInterest({
  causes: controlledCauses,
  onRemove,
  onAddMore,
}: {
  causes?: string[];
  onRemove?: (cause: string) => void;
  onAddMore?: () => void;
}) {
  const [internalCauses, setInternalCauses] = useState<string[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const { error } = useVolunteerCauses();

  const isControlled = controlledCauses != null;
  const selectedCauses = isControlled ? controlledCauses : internalCauses;

  const handleRemove = (cause: string) => {
    if (onRemove) onRemove(cause);
    if (!isControlled) setInternalCauses((prev) => prev.filter((c) => c !== cause));
  };

  const handleAddMore = () => {
    if (onAddMore) onAddMore();
    else setModalOpen(true);
  };

  const handleSaveCauses = (selected: string[]) => {
    if (!isControlled) setInternalCauses(selected);
    setModalOpen(false);
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
              handleAddMore();
            }}
          >
            + Add More
          </Link>
        }
      >
        {error != null && (
          <p className="w-full h-full flex items-center justify-center text-sm text-red-600">
            Could not load causes from ontology. Please try again.
          </p>
        )}
        {!error && selectedCauses.length === 0 && (
          <EmptyState
            title="No causes selected"
            description="Add causes you're interested in."
            icon={<HeartIcon className="h-5 w-5" />}
            className="border-none bg-transparent"
          />
        )}
        {!error && selectedCauses.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {selectedCauses.map((cause) => (
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
        selectedCauses={selectedCauses}
        onSave={handleSaveCauses}
      />
    </>
  );
}
