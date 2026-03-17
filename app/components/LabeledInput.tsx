export type LabeledInputProps = {
  id: string;
  label: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  "aria-label"?: string;
};

export function LabeledInput({
  id,
  label,
  placeholder,
  value,
  onChange,
  "aria-label": ariaLabel,
}: LabeledInputProps) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="block text-sm font-medium text-gray-500">
        {label}
      </label>
      <input
        id={id}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        aria-label={ariaLabel}
      />
    </div>
  );
}
