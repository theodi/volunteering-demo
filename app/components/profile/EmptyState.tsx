import type { ReactNode } from "react";

export type EmptyStateProps = {
  /** Short title, e.g. "No bio yet" */
  title?: string;
  /** Optional longer description or hint */
  description?: string;
  /** Optional icon (e.g. Heroicon component) */
  icon?: ReactNode;
  /** Compact layout for inline use (e.g. in a list) */
  compact?: boolean;
  className?: string;
};

export function EmptyState({
  title,
  description,
  icon,
  compact = false,
  className = "",
}: EmptyStateProps) {
  if (compact) {
    return (
      <span className={`text-sm text-gray-400 ${className}`}>
        {title ?? "Not set"}
      </span>
    );
  }

  return (
    <div
      className={`flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-200 bg-gray-50/50 py-8 text-center ${className}`}
      role="status"
      aria-label={title ?? "Empty"}
    >
      {icon != null && (
        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 text-gray-400">
          {icon}
        </div>
      )}
      {title != null && title !== "" && (
        <p className="text-sm font-medium text-gray-500">{title}</p>
      )}
      {description != null && description !== "" && (
        <p className="mt-1 max-w-xs text-xs text-gray-400">{description}</p>
      )}
    </div>
  );
}
