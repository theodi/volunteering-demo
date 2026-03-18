"use client";

import { useState } from "react";
import Link from "next/link";
import { VanIcon } from "@/app/components/svg";
import { VolunteerInfoSection } from "./VolunteerInfoSection";
import { EquipmentItem } from "./EquipmentItem";
import { EmptyState } from "@/app/components/profile/EmptyState";
import { AddEquipmentModal } from "./AddEquipmentModal";
import { AddCustomEquipmentModal } from "./AddCustomEquipmentModal";

export type EquipmentEntry = {
  id: string;
  title: string;
  description: string;
};

export function EquipmentInventory({
  items: controlledItems,
  onDelete,
  onAddMore,
}: {
  items?: EquipmentEntry[];
  onDelete?: (id: string) => void;
  onAddMore?: () => void;
}) {
  const [internalItems, setInternalItems] = useState<EquipmentEntry[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [customModalOpen, setCustomModalOpen] = useState(false);

  const isControlled = controlledItems != null;
  const items = isControlled ? controlledItems : internalItems;

  const handleDelete = (id: string) => {
    if (onDelete) onDelete(id);
    if (!isControlled) setInternalItems((prev) => prev.filter((e) => e.id !== id));
  };

  const handleAddMore = () => {
    if (onAddMore) onAddMore();
    else setModalOpen(true);
  };

  const handleSaveEquipment = (selected: EquipmentEntry[]) => {
    if (!isControlled) setInternalItems(selected);
    setModalOpen(false);
  };

  const handleAddCustomEquipment = (entry: EquipmentEntry) => {
    if (!isControlled) setInternalItems((prev) => [...prev, entry]);
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
              handleAddMore();
            }}
          >
            + Add More
          </Link>
        }
      >
        {items.length === 0 ? (
          <EmptyState
            title="No equipment added"
            description="Add equipment you can provide."
            icon={<VanIcon className="h-5 w-5" />}
            className="border-none bg-transparent"
          />
        ) : (
          <div className="space-y-0">
            {items.map((item) => (
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
        selectedEquipment={items}
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
