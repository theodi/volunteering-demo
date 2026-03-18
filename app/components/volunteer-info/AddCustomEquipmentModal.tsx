"use client";

import { useState } from "react";
import { ModalWrapper } from "@/app/components/ModalWrapper";
import { ModalHeader } from "@/app/components/ModalHeader";
import { LabeledInput } from "@/app/components/LabeledInput";
import { Dropdown } from "@/app/components/Dropdown";
import { Button } from "@/app/components/Button";
import type { EquipmentEntry } from "./EquipmentInventory";
import { useVolunteerEquipment } from "@/app/lib/hooks/useVolunteerEquipment";

export type AddCustomEquipmentModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (entry: EquipmentEntry) => void;
};

function generateId() {
  return `custom-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function AddCustomEquipmentModal({
  isOpen,
  onClose,
  onAdd,
}: AddCustomEquipmentModalProps) {
  const { categories } = useVolunteerEquipment();
  const categoryLabels = Object.keys(categories);
  const categoryOptions = categoryLabels.map((label) => ({ value: label, label }));
  const initialCategory = categoryLabels[0] ?? "";

  const [name, setName] = useState("");
  const [category, setCategory] = useState(initialCategory);
  const [description, setDescription] = useState("");

  const resetForm = () => {
    setName("");
    setCategory(initialCategory);
    setDescription("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) return;
    const categoryLabel = category || "Equipment";
    const desc = description.trim() || categoryLabel;
    onAdd({
      id: generateId(),
      title: trimmedName,
      description: desc,
    });
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <ModalWrapper isOpen={isOpen} onClose={handleClose} className="max-w-xl! w-full border-none! rounded-sm!">
      <section className="w-full flex flex-col min-h-[45vh] max-h-[45vh]">
        <ModalHeader title="Add Custom Equipment" onClose={handleClose} />

        <form onSubmit={handleSubmit} className="flex flex-1 flex-col gap-4 px-5 py-5">
          {/* Equipment Name */}
          <LabeledInput
            id="custom-equipment-name"
            label="Equipment Name"
            value={name}
            onChange={setName}
            placeholder="Access to Van or People Carrier"
            aria-label="Equipment name"
          />

          {/* Category */}
          <div className="w-full">
            <label id="custom-equipment-category-label" className="mb-1.5 block text-sm font-medium text-gray-700">
              Category
            </label>
            <Dropdown
              options={categoryOptions}
              value={category}
              onChange={setCategory}
              placeholder="Category"
              fullWidth
              triggerClassName="rounded-md border-slate-300 px-3 py-2.5 text-gray-900 focus:ring-primary focus:ring-1 focus:ring-offset-0"
              panelClassName="left-0 right-0 min-w-full rounded-md border-slate-300"
            />
          </div>

          {/* Description */}
          <LabeledInput
            id="custom-equipment-description"
            label="Description"
            value={description}
            onChange={setDescription}
            placeholder="Personal Protective Equipment (Gloves, Mask, Goggles)"
            aria-label="Description"
          />

          <div className="mt-auto pt-2">
            <Button
              type="submit"
              fullWidth
              disabled={!name.trim()}
              className="w-full! rounded-md border-none bg-primary px-4 py-3 text-sm font-semibold text-white shadow-none hover:bg-primary/90 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add to My Equipment
            </Button>
          </div>
        </form>
      </section>
    </ModalWrapper>
  );
}
