import type { ReactNode } from "react";

export function VolunteerInfoSection({
  showHeader = true,
  title,
  icon,
  action,
  children,
  className = "",
  subHeaderClassName = "",
}: {
  showHeader?: boolean;
  title?: string;
  icon?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  subHeaderClassName?: string;
}) {
  return (
    <section
      className={`min-w-0 w-full rounded-sm border border-slate-200 bg-white p-3 sm:p-5 space-y-5 ${className}`}
    >
      {showHeader && (
        <div className={`flex flex-wrap items-center sm:justify-between gap-2 -mx-5 px-5 pb-5 border-b border-slate-200 ${subHeaderClassName}`}>
          <h2 className="flex items-center gap-2.5 text-base sm:text-lg font-medium text-gray-800">
            <span className="flex h-6 w-6 items-center justify-center text-primary">
              {icon}
            </span>
            {title}
          </h2>
          {action != null ? action : null}
        </div>
      )}
      {children}
    </section>
  );
}
