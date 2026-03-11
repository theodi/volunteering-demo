"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";

export interface DropdownOption {
  value: string;
  label: string;
}

export interface DropdownProps {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  /** Class for the trigger button */
  triggerClassName?: string;
  /** Class for the dropdown panel */
  panelClassName?: string;
}

export default function Dropdown({
  options,
  value,
  onChange,
  placeholder = "Select…",
  triggerClassName = "",
  panelClassName = "",
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((o) => o.value === value);
  const displayLabel = selectedOption?.label ?? placeholder;

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-labelledby="dropdown-label"
        id="dropdown-trigger"
        className={`inline-flex items-center justify-between gap-2 border border-gray-300 bg-white p-2.5 text-sm text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-custom focus:ring-offset-2 cursor-pointer ${triggerClassName}`.trim()}
      >
        <span>{displayLabel}</span>
        <ChevronDownIcon
          className={`h-4 w-4 shrink-0 text-gray-700 transition-transform duration-200 ease-out ${isOpen ? "rotate-180" : ""}`}
          aria-hidden
        />
      </button>

      {isOpen && (
        <ul
          role="listbox"
          aria-labelledby="dropdown-trigger"
          className={`absolute right-0 z-50 mt-1 min-w-full overflow-hidden border border-gray-300 bg-white py-1 shadow-lg ${panelClassName}`.trim()}
        >
          {options.map((option) => {
            const isSelected = option.value === value;
            return (
              <li
                key={option.value}
                role="option"
                aria-selected={isSelected}
                className={option.value !== options[0]?.value ? "border-t border-gray-300" : ""}
              >
                <button
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  className={`w-full px-3 py-2 text-left text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-blue-custom focus:ring-inset cursor-pointer ${
                    isSelected
                      ? "bg-earth-blue text-white"
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {option.label}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
