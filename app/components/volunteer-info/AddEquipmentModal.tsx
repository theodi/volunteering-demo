"use client";

import { useState, useEffect } from "react";
import { PlusIcon } from "@heroicons/react/24/outline";
import ModalWrapper from "../ModalWrapper";
import { ModalHeader } from "../ModalHeader";
import { ModalSearchInput } from "../ModalSearchInput";
import Button from "../Button";
import { CheckIconCustom } from "../svg/CheckIconCustom";
import { EquipmentIcon } from "../svg/EquipmentIcon";
import { VanIcon } from "../svg/VanIcon";
import type { EquipmentEntry } from "./EquipmentInventory";
import { useVolunteerEquipment } from "@/app/lib/hooks/useVolunteerEquipment";

export type AddEquipmentModalProps = {
  isOpen: boolean;
  onClose: () => void;
  selectedEquipment: EquipmentEntry[];
  onSave: (selected: EquipmentEntry[]) => void;
  /** Called when user clicks "Add Custom Equipment" – parent should close this modal and open AddCustomEquipmentModal */
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
  const [selected, setSelected] = useState<EquipmentEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (isOpen) {
      setSelected([...selectedEquipment]);
      setSearchQuery("");
    }
  }, [isOpen, selectedEquipment]);

  // Build options from ontology plus any custom equipment from current selection
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
  const allOptions: EquipmentEntry[] = [...ontologyOptions, ...customOnly];

  const filteredOptions = searchQuery.trim()
    ? allOptions.filter(
        (item) =>
          item.title.toLowerCase().includes(searchQuery.trim().toLowerCase()) ||
          item.description.toLowerCase().includes(searchQuery.trim().toLowerCase())
      )
    : allOptions;

  const handleToggle = (item: EquipmentEntry) => {
    setSelected((prev) =>
      prev.some((e) => e.id === item.id)
        ? prev.filter((e) => e.id !== item.id)
        : [...prev, item]
    );
  };

  const handleClose = () => {
    onSave(selected);
    onClose();
  };

  const isSelected = (item: EquipmentEntry) => selected.some((e) => e.id === item.id);

  if (!isOpen) return null;

  return (
    <ModalWrapper isOpen={isOpen} onClose={handleClose} className="max-w-xl! w-full border-none! rounded-sm!">
      <section className="w-full flex flex-col min-h-[55vh] max-h-[55vh]">
        <ModalHeader title="Equipment Inventory" onClose={handleClose} icon={<VanIcon className="h-6 w-6" />} />

        <ModalSearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search Equipment Inventory"
          ariaLabel="Search equipment inventory"
          className="border-b border-slate-100 px-5 py-3"
        />

        {/* Equipment list - scrollable */}
        <div className="overflow-y-auto px-5 py-4">
          {error != null && (
            <p className="text-sm text-red-600">
              Could not load equipment from ontology. Please try again.
            </p>
          )}
          {isLoading && (
            <p className="text-sm text-gray-500">Loading equipment…</p>
          )}
          {!isLoading && !error && filteredOptions.length === 0 ? (
            <p className="text-sm text-gray-500">
              {searchQuery.trim() ? "No equipment match your search." : "No equipment available."}
            </p>
          ) : null}

          {!isLoading && !error && filteredOptions.length > 0 && (
            <ul className="space-y-2">
              {filteredOptions.map((item) => {
                const isItemSelected = isSelected(item);
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => handleToggle(item)}
                      className={`flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition cursor-pointer ${
                        isItemSelected
                          ? "border-primary bg-white"
                          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      <span
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md ${
                          isItemSelected ? "bg-mystic-white text-primary" : "bg-gray-200 text-gray-400"
                        }`}
                      >
                        <EquipmentIcon className="h-5 w-5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm text-gray-900">{item.title}</p>
                        <p className="text-sm text-gray-500">{item.description}</p>
                      </div>
                      {isItemSelected ? (
                        <span className="flex h-4 w-4 shrink-0 items-center justify-center text-primary">
                          <CheckIconCustom className="w-full h-full" />
                        </span>
                      ) : (
                        <span className="flex h-4 w-4 shrink-0 items-center justify-center text-gray-400">
                          <PlusIcon className="w-full h-full" />
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Add Custom Equipment */}
        <div className="px-5 py-3">
          <Button
            size="sm"
            onClick={() => {
              onSave(selected);
              onClose();
              onRequestAddCustom?.();
            }}
            className="w-full! gap-1.5 border! border-primary/20! bg-transparent text-primary! shadow-none! font-medium!  hover:bg-primary hover:text-white! p-3!"
          >
            <PlusIcon className="h-4 w-4" />
            Add Custom Equipment
          </Button>
        </div>
      </section>
    </ModalWrapper>
  );
}
