"use client";

import { CausesOfInterest } from "./CausesOfInterest";
import { EquipmentInventory } from "./EquipmentInventory";
import { PreferredLocations } from "./PreferredLocations";
import HeroText from "../HeroText";

export function VolunteerInfo() {
  return (
    <div className="mx-auto w-full space-y-7 px-4 py-6 font-sans sm:px-6 lg:px-8">

      <HeroText
        title="Volunteer Information"
        description="Select your skills and the equipment/resources you can provide."
        titleClassName="text-xl !sm:text-2xl font-semibold !text-black leading-tight tracking-tight"
        descriptionClassName="!mt-0 !text-sm !leading-relaxed !text-slate-700"
      />

      <div className="w-full flex flex-col gap-5">
        <CausesOfInterest />
        <EquipmentInventory />
        <PreferredLocations />
      </div>
    </div>
  );
}
