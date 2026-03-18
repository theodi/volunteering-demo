"use client";

import { useState } from "react";
import Link from "next/link";
import { VanIcon } from "@/app/components/svg";
import { VolunteerInfoSection } from "./VolunteerInfoSection";
import { EquipmentItem } from "./EquipmentItem";
import { EmptyState } from "@/app/components/profile/EmptyState";
import { AddEquipmentModal } from "./AddEquipmentModal";
import { AddCustomEquipmentModal } from "./AddCustomEquipmentModal";
import { useVolunteerProfileEquipment } from "@/app/lib/hooks/useVolunteerProfileEquipment";

export type EquipmentEntry = {
  id: string;
  title: string;
  description: string;
};

export function EquipmentInventory() {
  const {
    equipmentEntries,
    isLoading,
    isSaving,
    error,
    saveEquipment,
  } = useVolunteerProfileEquipment();

  const [modalOpen, setModalOpen] = useState(false);
  const [customModalOpen, setCustomModalOpen] = useState(false);

  const handleDelete = (id: string) => {
    saveEquipment(equipmentEntries.filter((e) => e.id !== id));
  };

  const handleSaveEquipment = (selected: EquipmentEntry[]) => {
    saveEquipment(selected);
    setModalOpen(false);
  };

  const handleAddCustomEquipment = (entry: EquipmentEntry) => {
    saveEquipment([...equipmentEntries, entry]);
  };

  return (
    <>
      <VolunteerInfoSection
        title="Equipment Inventory"
        icon={<VanIcon className="h-6 w-6" />}
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
          <p className="flex items-center justify-center text-sm text-slate-500">Loading equipment…</p>
        )}
        {!error && !isLoading && equipmentEntries.length === 0 && (
          <EmptyState
            title="No equipment added"
            description="Add equipment you can provide."
            icon={<VanIcon className="h-5 w-5" />}
            className="border-none bg-transparent"
          />
        )}
        {!error && !isLoading && equipmentEntries.length > 0 && (
          <div className="space-y-0">
            {equipmentEntries.map((item) => (
              <EquipmentItem
                key={item.id}
                title={item.title}
                description={item.description}
                onDelete={() => handleDelete(item.id)}
              />
            ))}
          </div>
        )}
      </VolunteerInfoSection>

      <AddEquipmentModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        selectedEquipment={equipmentEntries}
        onSave={handleSaveEquipment}
        onRequestAddCustom={() => {
          setModalOpen(false);
          setCustomModalOpen(true);
        }}
      />

      <AddCustomEquipmentModal
        isOpen={customModalOpen}
        onClose={() => setCustomModalOpen(false)}
        onAdd={handleAddCustomEquipment}
      />
    </>
  );
}
