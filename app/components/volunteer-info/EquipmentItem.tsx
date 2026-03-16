"use client";

import { TrashIcon } from "@heroicons/react/24/outline";
import { EquipmentIcon } from "@/app/components/svg";

export type EquipmentItemProps = {
  title: string;
  description: string;
  onDelete?: () => void;
};

export function EquipmentItem({
  title,
  description,
  onDelete,
}: EquipmentItemProps) {
  return (
    <main className="w-full flex items-center gap-2.5 border-b border-slate-100 py-3 sm:py-5 last:border-0 last:pb-0 first:pt-0">
      <span className="flex h-5 w-5 sm:h-10 sm:w-10 shrink-0 items-center justify-center p-1.5 sm:p-2.5 bg-lavender rounded-md text-primary">
        <EquipmentIcon className="h-5 w-5 shrink-0" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-medium text-sm sm:text-base text-gray-800">{title}</p>
        <p className="text-xs sm:text-sm text-gray-600">{description}</p>
      </div>
      <button
        type="button"
        aria-label={`Delete ${title}`}
        onClick={() => onDelete?.()}
        className="shrink-0 rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 cursor-pointer"
      >
        <TrashIcon className="h-5 w-5" />
      </button>
    </main>
  );
}
