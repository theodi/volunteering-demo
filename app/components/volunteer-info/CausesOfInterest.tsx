"use client";

import { HeartIcon, XMarkIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { VolunteerInfoSection } from "./VolunteerInfoSection";
import { useVolunteerCauses } from "@/app/lib/hooks/useVolunteerCauses";
import { EmptyState } from "../profile/EmptyState";

export function CausesOfInterest({
  causes: selectedCauses,
  onRemove,
  onAddMore,
}: {
  causes?: string[];
  onRemove?: (cause: string) => void;
  onAddMore?: () => void;
}) {
  const { allCauseLabels, isLoading, error } = useVolunteerCauses();

  const displayCauses =
    selectedCauses != null && selectedCauses.length > 0
      ? selectedCauses
      : allCauseLabels;

  return (
    <VolunteerInfoSection
      title="Causes of Interest"
      icon={<HeartIcon className="h-5 w-5" />}
      action={
        <Link
          href="#"
          className="text-sm font-semibold text-primary underline"
          onClick={(e) => {
            e.preventDefault();
            onAddMore?.();
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
      {isLoading && (
        <div className="w-full h-full flex items-center justify-center flex-wrap gap-2 py-2">
          <span className="text-sm text-hydrocarbon">Loading causes…</span>
        </div>
      )}
      {!isLoading && !error && displayCauses.length === 0 && (
        <EmptyState
          title="No causes selected"
          description="Add causes you're interested in from the ontology."
          icon={<HeartIcon className="h-5 w-5" />}
          className="border-none"
        />
      )}
      {!isLoading && !error && displayCauses.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {displayCauses.map((cause) => (
            <span
              key={cause}
              className="inline-flex items-center gap-2 rounded-sm bg-gray-100 px-3 py-2.5 text-sm font-medium text-slate-900"
            >
              {cause}
              <button
                type="button"
                onClick={() => onRemove?.(cause)}
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
  );
}
