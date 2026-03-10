import Image from "next/image";
import { ExpandableText } from "./ExpandableText";

export type ProfileEntryProps = {
  /** Letter shown when no logoUrl (e.g. company or school initial). */
  initial: string;
  /** Optional logo image URL (square, rounded corners). */
  logoUrl?: string;
  /** Main heading (e.g. job title or school name). */
  title: string;
  /** Badge label (e.g. "Fulltime") – light gray style. */
  badge: string;
  /** Right-aligned label (e.g. period or date). */
  rightLabel: string;
  /** First part of subtitle line (e.g. company name or degree). */
  subtitlePrimary?: string;
  /** Second part after separator (e.g. location). Shows as "subtitlePrimary | subtitleSecondary". */
  subtitleSecondary?: string;
  /** Optional description with "more" link (truncated). */
  description?: string;
  /** Full description shown when "more" is clicked. When provided, description is expandable. */
  descriptionFull?: string;
};

export function ProfileEntry({
  initial,
  logoUrl,
  title,
  badge,
  rightLabel,
  subtitlePrimary,
  subtitleSecondary,
  description,
  descriptionFull,
}: ProfileEntryProps) {
  const hasSubtitle = subtitlePrimary != null && subtitlePrimary !== "";

  return (
    <div className="flex w-full items-start gap-3 border-b border-gray-100 pb-5 last:border-0 last:pb-0">
      {/* Logo or initial */}
      <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gray-100 text-sm font-semibold text-tranquil-black">
        {logoUrl != null ? (
          <Image
            src={logoUrl}
            alt=""
            width={40}
            height={40}
            className="h-full w-full object-contain"
          />
        ) : (
          initial
        )}
      </div>

      <div className="min-w-0 flex-1">
        {/* Row 1: Title, badge, date */}
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold text-gray-900">{title}</h3>
            <span className="rounded-sm border border-gray-200 bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
              {badge}
            </span>
          </div>
          <p className="text-sm text-gray-600">{rightLabel}</p>
        </div>

        {/* Row 2: Company | Location (or Degree | Location) */}
        {hasSubtitle && (
          <p className="mt-1 flex items-center gap-1 text-sm text-gray-600 font-medium">
            {subtitlePrimary}
            {subtitleSecondary != null && subtitleSecondary !== "" && (
              <div className="flex items-center gap-1">
                <span className="mx-1.5 text-gray-300">|</span>
                <p className="text-gray-600 font-normal">{subtitleSecondary}</p>
              </div>
            )}
          </p>
        )}

        {/* Description + more/less */}
        {description != null && (
          <div className="mt-3">
            {descriptionFull != null ? (
              <ExpandableText
                truncated={description}
                full={descriptionFull}
                className="text-sm leading-relaxed text-hydrocarbon"
                controlClassName="font-medium text-[#121212] underline hover:no-underline cursor-pointer"
              />
            ) : (
              <p className="text-sm leading-relaxed text-hydrocarbon">
                {description}{" "}
                <span className="font-medium text-[#121212] underline">
                  more
                </span>
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
