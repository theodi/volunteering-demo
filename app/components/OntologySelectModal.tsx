"use client";

import { useState, useEffect, useCallback, type ReactNode } from "react";
import { ModalWrapper } from "./ModalWrapper";
import { ModalHeader } from "./ModalHeader";
import { ModalSearchInput } from "./ModalSearchInput";

export type OntologySelectModalProps<T> = {
  isOpen: boolean;
  onClose: () => void;
  selected: T[];
  onSave: (selected: T[]) => void;

  items: T[];
  isLoading: boolean;
  error: Error | null;

  /** Unique key per item (used for selection tracking). */
  getKey: (item: T) => string;
  /** Return true if the item matches the search query. */
  matchesSearch: (item: T, query: string) => boolean;

  title: string;
  icon?: ReactNode;
  searchPlaceholder: string;
  /** Lowercase plural for messages, e.g. "skills", "causes". */
  entityName: string;

  /** Render a single selectable item. */
  renderItem: (item: T, isSelected: boolean, onToggle: () => void) => ReactNode;

  modalClassName?: string;
  sectionClassName?: string;
  searchInputClassName?: string;
  gridContainerClassName?: string;
  /** Rendered above the item list (e.g. a heading). */
  beforeList?: ReactNode;
  /** Rendered below the scrollable list (e.g. an "Add custom" button). Receives current selection and a save-and-close handler. */
  footer?: (selected: T[], saveAndClose: () => void) => ReactNode;
};

export function OntologySelectModal<T>({
  isOpen,
  onClose,
  selected: selectedProp,
  onSave,
  items,
  isLoading,
  error,
  getKey,
  matchesSearch,
  title,
  icon,
  searchPlaceholder,
  entityName,
  renderItem,
  modalClassName = "!max-w-xl w-full !border-none !rounded-sm",
  sectionClassName = "w-full flex flex-col min-h-[55vh] max-h-[55vh]",
  searchInputClassName,
  gridContainerClassName,
  beforeList,
  footer,
}: OntologySelectModalProps<T>) {
  const [selected, setSelected] = useState<T[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (isOpen) {
      setSelected([...selectedProp]);
      setSearchQuery("");
    }
  }, [isOpen, selectedProp]);

  const isSelected = useCallback(
    (item: T) => selected.some((s) => getKey(s) === getKey(item)),
    [selected, getKey],
  );

  const toggle = useCallback(
    (item: T) => {
      setSelected((prev) =>
        prev.some((s) => getKey(s) === getKey(item))
          ? prev.filter((s) => getKey(s) !== getKey(item))
          : [...prev, item],
      );
    },
    [getKey],
  );

  const saveAndClose = useCallback(() => {
    onSave(selected);
    onClose();
  }, [onSave, onClose, selected]);

  if (!isOpen) return null;

  const query = searchQuery.trim().toLowerCase();
  const filtered = query ? items.filter((item) => matchesSearch(item, query)) : items;

  return (
    <ModalWrapper isOpen={isOpen} onClose={saveAndClose} className={modalClassName}>
      <section className={sectionClassName}>
        <ModalHeader title={title} onClose={saveAndClose} icon={icon} />

        <ModalSearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder={searchPlaceholder}
          ariaLabel={`Search ${entityName}`}
          className={searchInputClassName}
        />

        <div className={`overflow-y-auto px-5 py-4 ${gridContainerClassName}`}>
          {beforeList}
          {error != null && (
            <p className="text-sm text-red-600">Could not load {entityName}. Please try again.</p>
          )}
          {isLoading && (
            <p className="text-sm text-gray-500">Loading {entityName}…</p>
          )}
          {!isLoading && !error && filtered.length === 0 && (
            <p className="text-sm text-gray-500">
              {query ? `No ${entityName} match your search.` : `No ${entityName} available.`}
            </p>
          )}
          {!isLoading && !error && filtered.length > 0 &&
            filtered.map((item) => renderItem(item, isSelected(item), () => toggle(item)))}
        </div>

        {footer?.(selected, saveAndClose)}
      </section>
    </ModalWrapper>
  );
}
