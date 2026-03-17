import type { ReactNode } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

export type ModalHeaderProps = {
  title: string;
  onClose: () => void;
  /** Optional icon shown to the left of the title (e.g. HeartIcon, VanIcon) */
  icon?: ReactNode;
};

export function ModalHeader({ title, onClose, icon }: ModalHeaderProps) {
  return (
    <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
      <div className="flex items-center gap-2.5">
        {icon != null && (
          <span className="flex h-6 w-6 items-center justify-center text-primary">
            {icon}
          </span>
        )}
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      </div>
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="rounded p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700 cursor-pointer"
      >
        <XMarkIcon className="h-5 w-5" />
      </button>
    </div>
  );
}
