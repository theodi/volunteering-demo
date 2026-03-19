"use client";

import { useState } from "react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CalendarIcon,
} from "@heroicons/react/24/solid";
import { AvailabilityScheduler } from "./AvailabilityScheduler";
import { HeroText } from "@/app/components/HeroText";
import { useVolunteerProfileAvailability } from "@/app/lib/hooks/useVolunteerProfileAvailability";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const dow = d.getDay();
  const diff = d.getDate() - dow + (dow === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatDateRange(weekStart: Date): string {
  const end = new Date(weekStart);
  end.setDate(end.getDate() + 6);
  const fmt = (d: Date) =>
    `${d.getDate().toString().padStart(2, "0")} ${d.toLocaleString("en-GB", { month: "short" })}`;
  return `${fmt(weekStart)} - ${fmt(end)}`;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function VolunteerAvailability() {
  const [weekStart, setWeekStart] = useState(() => getWeekStart(new Date()));
  const { selectedSlots, isLoading, isSaving, error, saveSlots } =
    useVolunteerProfileAvailability();

  const prevWeek = () =>
    setWeekStart((p) => {
      const d = new Date(p);
      d.setDate(d.getDate() - 7);
      return d;
    });

  const nextWeek = () =>
    setWeekStart((p) => {
      const d = new Date(p);
      d.setDate(d.getDate() + 7);
      return d;
    });

  return (
    <div className="w-full space-y-4 sm:space-y-[30px] font-app">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <HeroText
          title="Availability"
          description="Select the times when you&apos;re available to volunteer."
          titleClassName="text-xl! sm:text-2xl! font-semibold tracking-tight text-black!"
          descriptionClassName="mt-0! text-sm! sm:text-base! leading-relaxed text-slate-700!"
        />

        <div className="flex shrink-0 items-center gap-2.5 rounded-md border border-gray-300 px-2.5 py-2 text-sm text-gray-600">
          <button
            type="button"
            onClick={prevWeek}
            className="cursor-pointer rounded p-0.5 hover:bg-slate-100"
            aria-label="Previous week"
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </button>
          <CalendarIcon className="h-4 w-4 text-gray-500" />
          <span className="whitespace-nowrap font-medium">
            {formatDateRange(weekStart)}
          </span>
          <button
            type="button"
            onClick={nextWeek}
            className="cursor-pointer rounded p-0.5 hover:bg-slate-100"
            aria-label="Next week"
          >
            <ChevronRightIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Status indicators */}
      {isLoading && (
        <p className="text-sm text-slate-500">Loading availability…</p>
      )}
      {error && (
        <p className="text-sm text-red-500">{error.message}</p>
      )}

      {/* Scheduler grid */}
      <div className="relative">
        <AvailabilityScheduler
          weekStart={weekStart}
          selectedSlots={selectedSlots}
          onSlotsChange={saveSlots}
        />
        {isSaving && (
          <span className="absolute right-2 top-2 z-30 rounded bg-white/80 px-2 py-1 text-xs text-slate-500 shadow-sm">
            Saving…
          </span>
        )}
      </div>
    </div>
  );
}
