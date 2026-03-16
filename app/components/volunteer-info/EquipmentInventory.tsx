"use client";

import { useState } from "react";
import Link from "next/link";
import { VanIcon } from "@/app/components/svg";
import { VolunteerInfoSection } from "./VolunteerInfoSection";
import { EquipmentItem } from "./EquipmentItem";

export type EquipmentEntry = {
  id: string;
  title: string;
  description: string;
};

const DEFAULT_EQUIPMENT: EquipmentEntry[] = [
  {
    id: "1",
    title: "PPE Kit",
    description: "Personal Protective Equipment (Gloves, Mask, Goggles)",
  },
  {
    id: "2",
    title: "Waterproofs and Warm Layers",
    description: "Personal Protective Equipment (Gloves, Mask, Goggles)",
  },
  {
    id: "3",
    title: "4x4 Vehicle",
    description: "Personal Protective Equipment (Gloves, Mask, Goggles)",
  },
  {
    id: "4",
    title: "Phone and Power Bank",
    description: "Personal Protective Equipment (Gloves, Mask, Goggles)",
  },
];

export function EquipmentInventory({
  items = DEFAULT_EQUIPMENT,
  onDelete,
  onAddMore,
}: {
  items?: EquipmentEntry[];
  onDelete?: (id: string) => void;
  onAddMore?: () => void;
}) {
  const [localItems, setLocalItems] = useState<EquipmentEntry[]>(items);

  const handleDelete = (id: string) => {
    setLocalItems((prev) => prev.filter((e) => e.id !== id));
    onDelete?.(id);
  };

  return (
    <VolunteerInfoSection
      title="Equipment Inventory"
      icon={<VanIcon className="h-6 w-6" />}
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
      <div className="space-y-0">
        {localItems.map((item) => (
          <EquipmentItem
            key={item.id}
            title={item.title}
            description={item.description}
            onDelete={() => handleDelete(item.id)}
          />
        ))}
      </div>
    </VolunteerInfoSection>
  );
}
