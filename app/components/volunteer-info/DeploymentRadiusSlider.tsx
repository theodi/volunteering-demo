"use client";

import type React from "react";

export type DeploymentRadiusSliderProps = {
  valueKm: number;
  min?: number;
  max?: number;
  onChange?: (value: number) => void;
};

export function DeploymentRadiusSlider({
  valueKm,
  min = 1,
  max = 100,
  onChange,
}: DeploymentRadiusSliderProps) {
  const clamped =
    max > min ? Math.min(Math.max(valueKm, min), max) : valueKm;
  const fillPct =
    max > min ? ((clamped - min) / (max - min)) * 100 : 0;

  const trackStyle: React.CSSProperties = {
    background: `linear-gradient(to right,
      var(--primary) 0%,
      var(--primary) ${fillPct}%,
      var(--color-sparkling-silver) ${fillPct}%,
      var(--color-sparkling-silver) 100%)`,
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-tranquil-black">
          Deployment Radius
        </span>
        <span className="text-sm font-medium text-primary">{clamped} km</span>
      </div>
      <div className="flex flex-col gap-1">
        <input
          type="range"
          min={min}
          max={max}
          value={clamped}
          onChange={(e) => onChange?.(Number(e.target.value))}
          className="deployment-radius-slider-input h-2 w-full appearance-none rounded-full outline-none"
          style={trackStyle}
          aria-label="Deployment radius in km"
        />
        <div className="flex justify-between">
          <span className="text-xs text-hydrocarbon">{min} km</span>
          <span className="text-xs text-hydrocarbon">{max} km</span>
        </div>
      </div>
    </div>
  );
}
