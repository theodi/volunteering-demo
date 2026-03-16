"use client";

import { useState } from "react";
import { MapPinIcon, EllipsisVerticalIcon } from "@heroicons/react/24/outline";
import { DeploymentRadiusSlider } from "./DeploymentRadiusSlider";
import { ActionMenu } from "../Dropdown";

export type LocationCardProps = {
  label: string;
  radiusLabel: string;
  isActive?: boolean;
  radiusKm?: number;
  onRadiusChange?: (value: number) => void;
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
};

export function LocationCard({
  label,
  radiusLabel,
  isActive = false,
  radiusKm,
  onRadiusChange,
  onClick,
  onEdit,
  onDelete,
}: LocationCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const Icon = isActive ? MapPinIcon : MapPinIcon;

  const handleEdit = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setMenuOpen(false);
    onEdit?.();
  };

  const handleDelete = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setMenuOpen(false);
    onDelete?.();
  };

  return (
    <div
      className={`relative flex cursor-pointer flex-col rounded-lg border p-2.5 sm:p-5 transition ${isActive
          ? "border-lavender bg-light-lavender"
          : "border-slate-200 bg-white hover:border-slate-300"
        }`}
      onClick={onClick}
    >
      <div className={`flex items-center gap-3  ${isActive ? "pb-5 border-b border-lavender" : "pb-0 border-none"}`}>
        <span
          className={`shrink-0 w-[18px] h-[18px] sm:w-9 sm:h-9 flex items-center justify-center text-white rounded-sm ${isActive ? "bg-primary" : "bg-slate-400"}`}
        >
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className={`font-semibold text-sm ${isActive ? "text-gray-900" : "text-slate-600"} truncate`}>{label}</p>
          <p className="text-xs text-gray-600">{radiusLabel}</p>
        </div>
        <ActionMenu
          trigger={
            <button
              type="button"
              aria-label="Location options"
              className="shrink-0 rounded p-1 text-gray-500 hover:bg-gray-200 hover:text-gray-700 cursor-pointer"
            >
              <EllipsisVerticalIcon className="h-5 w-5" />
            </button>
          }
          items={[
            {
              id: "edit",
              label: "Edit",
              onClick: () => onEdit?.(),
            },
            {
              id: "delete",
              label: "Delete",
              destructive: true,
              onClick: () => onDelete?.(),
            },
          ]}
        />
      </div>

      {isActive && radiusKm != null && (
        <div className="pt-5">
          <DeploymentRadiusSlider
            valueKm={radiusKm}
            onChange={onRadiusChange}
          />
        </div>
      )}

    </div>
  );
}
