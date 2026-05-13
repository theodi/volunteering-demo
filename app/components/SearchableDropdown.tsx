"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { ChevronDownIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";

export interface SearchableDropdownOption {
    value: string;
    label: string;
    /** Optional secondary line (e.g. description) */
    description?: string;
    /** Optional leading icon */
    icon?: React.ReactNode;
}

export interface SearchableDropdownProps {
    options: SearchableDropdownOption[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    searchPlaceholder?: string;
    /** Label shown above the dropdown */
    label?: string;
    /** Disable interaction */
    disabled?: boolean;
    /** Class for the outer wrapper */
    className?: string;
}

export function SearchableDropdown({
    options,
    value,
    onChange,
    placeholder = "Select…",
    searchPlaceholder = "Search…",
    label,
    disabled = false,
    className = "",
}: SearchableDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");
    const containerRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    const selectedOption = options.find((o) => o.value === value);
    const displayLabel = selectedOption?.label ?? placeholder;

    // Filter options by search term
    const filteredOptions = useMemo(() => {
        if (!search) return options;
        const lower = search.toLowerCase();
        return options.filter(
            (o) =>
                o.label.toLowerCase().includes(lower) ||
                o.value.toLowerCase().includes(lower) ||
                o.description?.toLowerCase().includes(lower),
        );
    }, [options, search]);

    // Close on outside click
    useEffect(() => {
        if (!isOpen) return;
        const handleClick = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
                setSearch("");
            }
        };
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, [isOpen]);

    // Focus search input when opened
    useEffect(() => {
        if (isOpen) {
            requestAnimationFrame(() => searchInputRef.current?.focus());
        }
    }, [isOpen]);

    const handleSelect = (optionValue: string) => {
        onChange(optionValue);
        setIsOpen(false);
        setSearch("");
    };

    return (
        <div className={`relative ${className}`} ref={containerRef}>
            {label && (
                <span className="mb-1.5 block text-sm font-medium text-gray-700">{label}</span>
            )}

            {/* Trigger */}
            <button
                type="button"
                disabled={disabled}
                onClick={() => !disabled && setIsOpen((prev) => !prev)}
                className={`flex w-full items-center justify-between gap-2 rounded-md border border-gray-300 bg-white px-3 py-2.5 text-left text-sm shadow-sm transition focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary ${disabled ? "cursor-not-allowed opacity-50" : "hover:border-gray-400"}`}
            >
                <span className="flex items-center gap-2 truncate">
                    {selectedOption?.icon && (
                        <span className="shrink-0">{selectedOption.icon}</span>
                    )}
                    <span className={selectedOption ? "text-gray-900" : "text-gray-400"}>
                        {displayLabel}
                    </span>
                </span>
                <ChevronDownIcon
                    className={`h-4 w-4 shrink-0 text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                    aria-hidden
                />
            </button>

            {/* Panel */}
            {isOpen && (
                <div className="absolute left-0 z-50 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg">
                    {/* Search input */}
                    {options.length > 5 && (
                        <div className="border-b border-gray-100 px-3 py-2">
                            <div className="flex items-center gap-2 rounded-md border border-gray-200 bg-gray-50 px-2.5 py-1.5">
                                <MagnifyingGlassIcon className="h-4 w-4 shrink-0 text-gray-400" />
                                <input
                                    ref={searchInputRef}
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder={searchPlaceholder}
                                    className="min-w-0 flex-1 bg-transparent text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none"
                                />
                            </div>
                        </div>
                    )}

                    {/* Options list */}
                    <ul
                        role="listbox"
                        className="max-h-56 overflow-y-auto py-1"
                    >
                        {filteredOptions.length === 0 ? (
                            <li className="px-3 py-3 text-center text-sm text-gray-400">
                                No results found
                            </li>
                        ) : (
                            filteredOptions.map((option) => {
                                const isSelected = option.value === value;
                                return (
                                    <li key={option.value} role="option" aria-selected={isSelected}>
                                        <button
                                            type="button"
                                            onClick={() => handleSelect(option.value)}
                                            className={`flex w-full items-start gap-2.5 px-3 py-2 text-left text-sm transition focus:outline-none ${
                                                isSelected
                                                    ? "bg-light-lavender text-primary"
                                                    : "text-gray-700 hover:bg-gray-50"
                                            }`}
                                        >
                                            {option.icon && (
                                                <span className="mt-0.5 shrink-0">{option.icon}</span>
                                            )}
                                            <span className="flex flex-col">
                                                <span className="font-medium">{option.label}</span>
                                                {option.description && (
                                                    <span className="text-xs text-gray-500">{option.description}</span>
                                                )}
                                            </span>
                                        </button>
                                    </li>
                                );
                            })
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
}
