"use client";

export interface StepProgressStep {
  id: number;
  label: string;
  active: boolean;
}

interface StepProgressProps {
  steps: readonly StepProgressStep[];
}

export default function StepProgress({ steps }: StepProgressProps) {
  return (
    <div className="flex items-center gap-2.5">
      {steps.map((step, index) => (
        <div key={step.id} className="flex flex-1 items-center">
          <div className="flex items-center gap-1">
            <div
              className={`flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                step.active
                  ? "bg-blue-custom text-white font-bold"
                  : "bg-transparent border border-slate-400 text-slate-400"
              }`}
            >
              {step.id}
            </div>
            <span
              className={`text-xs font-medium sm:text-sm ${
                step.active ? "text-blue-custom" : "text-slate-400"
              }`}
            >
              {step.label}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div
              className="mx-1 h-0.5 min-w-[8px] flex-1 bg-gray-200 sm:mx-2"
              aria-hidden
            />
          )}
        </div>
      ))}
    </div>
  );
}
