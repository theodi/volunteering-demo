"use client";

import { useMemo } from "react";
import { PlusIcon } from "@heroicons/react/24/outline";
import { OntologySelectModal } from "@/app/components/OntologySelectModal";
import { Button } from "@/app/components/Button";
import { CheckIconCustom } from "@/app/components/svg/CheckIconCustom";
import { EquipmentIcon } from "@/app/components/svg/EquipmentIcon";
import { VanIcon } from "@/app/components/svg/VanIcon";
import type { EquipmentEntry } from "./EquipmentInventory";
import { useVolunteerEquipment } from "@/app/lib/hooks/useVolunteerEquipment";

export type AddEquipmentModalProps = {
  isOpen: boolean;
  onClose: () => void;
  selectedEquipment: EquipmentEntry[];
  onSave: (selected: EquipmentEntry[]) => void;
  onRequestAddCustom?: () => void;
};

export function AddEquipmentModal({
  isOpen,
  onClose,
  selectedEquipment,
  onSave,
  onRequestAddCustom,
}: AddEquipmentModalProps) {
  const { categories, allEquipmentLabels, isLoading, error } = useVolunteerEquipment();

  const allOptions = useMemo(() => {
    const getCategoryForLabel = (label: string): string | undefined => {
      for (const [cat, labels] of Object.entries(categories)) {
        if (labels.includes(label)) return cat;
      }
      return undefined;
    };
    const ontologyOptions: EquipmentEntry[] = allEquipmentLabels.map((label) => ({
      id: label,
      title: label,
      description: getCategoryForLabel(label) ?? "Equipment",
    }));
    const optionIds = new Set(ontologyOptions.map((e) => e.id));
    const customOnly = selectedEquipment.filter((e) => !optionIds.has(e.id));
    return [...ontologyOptions, ...customOnly];
  }, [categories, allEquipmentLabels, selectedEquipment]);

  return (
    <OntologySelectModal
      isOpen={isOpen}
      onClose={onClose}
      selected={selectedEquipment}
      onSave={onSave}
      items={allOptions}
      isLoading={isLoading}
      error={error}
      getKey={(e) => e.id}
      matchesSearch={(e, q) =>
        e.title.toLowerCase().includes(q) || e.description.toLowerCase().includes(q)
      }
      title="Equipment Inventory"
      icon={<VanIcon className="h-6 w-6" />}
      searchPlaceholder="Search Equipment Inventory"
      entityName="equipment"
      searchInputClassName="border-b border-slate-100 px-5 py-3"
      renderItem={(item, isSelected, onToggle) => (
        <button
          key={item.id}
          type="button"
          onClick={onToggle}
          className={`flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 mb-2 text-left transition cursor-pointer ${
            isSelected
              ? "border-primary bg-white"
              : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
          }`}
        >
          <span
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md ${
              isSelected ? "bg-mystic-white text-primary" : "bg-gray-200 text-gray-400"
            }`}
          >
            <EquipmentIcon className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-medium text-sm text-gray-900">{item.title}</p>
            <p className="text-sm text-gray-500">{item.description}</p>
          </div>
          {isSelected ? (
            <span className="flex h-4 w-4 shrink-0 items-center justify-center text-primary">
              <CheckIconCustom className="w-full h-full" />
            </span>
          ) : (
            <span className="flex h-4 w-4 shrink-0 items-center justify-center text-gray-400">
              <PlusIcon className="w-full h-full" />
            </span>
          )}
        </button>
      )}
      footer={(_selected, saveAndClose) => (
        <div className="px-5 py-3">
          <Button
            size="sm"
            onClick={() => {
              saveAndClose();
              onRequestAddCustom?.();
            }}
            className="w-full! gap-1.5 border! border-primary/20! bg-transparent text-primary! shadow-none! font-medium! hover:bg-primary hover:text-white! p-3!"
          >
            <PlusIcon className="h-4 w-4" />
            Add Custom Equipment
          </Button>
        </div>
      )}
    />
  );
}
