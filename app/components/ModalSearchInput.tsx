import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

export type ModalSearchInputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  ariaLabel: string;
  /** Optional wrapper class (e.g. "border-b border-slate-100 px-5 py-3" or "px-5 pt-3") */
  className?: string;
};

export function ModalSearchInput({
  value,
  onChange,
  placeholder,
  ariaLabel,
  className = "px-5 py-3",
}: ModalSearchInputProps) {
  return (
    <div className={className}>
      <div className="flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2">
        <MagnifyingGlassIcon className="h-5 w-5 shrink-0 text-gray-400" />
        <input
          type="search"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="min-w-0 flex-1 bg-transparent text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none"
          aria-label={ariaLabel}
        />
      </div>
    </div>
  );
}
