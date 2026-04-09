/**
 * StorageFilterBtn.tsx
 * A filter button component for the storage page that allows users to select a filter the inventory.
 */

import { SlidersHorizontal } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type StorageFilterButtonProps = {
    options: string[];
    selectedFilter: string;
    onSelectFilter: (filter: string) => void;
};

export default function StorageFilterButton({ options, selectedFilter, onSelectFilter,}: StorageFilterButtonProps) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        const handleOutsideClick = (event: MouseEvent) => {
            if (!containerRef.current?.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleOutsideClick);
        document.addEventListener("keydown", handleEscape);

        return () => {
            document.removeEventListener("mousedown", handleOutsideClick);
            document.removeEventListener("keydown", handleEscape);
        };
    }, [isOpen]);

    return (
        <div ref={containerRef} className="relative">
            <button
                type="button"
                className="flex items-center justify-center h-11 w-11 shrink-0 rounded-full cursor-pointer"
                style={{
                    background: "linear-gradient(135deg, var(--color-primary-gradient-from), var(--color-primary-gradient-to))",
                    color: "var(--color-on-primary)",
                }}
                aria-label="Filtrer produkter"
                aria-expanded={isOpen}
                aria-haspopup="menu"
                onClick={() => setIsOpen((prev) => !prev)}
            >
                <SlidersHorizontal size={18} />
            </button>

            {isOpen ? (
                <div
                    role="menu"
                    aria-label="Filtervalg"
                    className="absolute right-0 top-14 z-20 min-w-52 rounded-2xl border p-2 shadow-lg"
                    style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)" }}
                >
                    {options.map((option) => (
                        <button
                            key={option}
                            type="button"
                            role="menuitemradio"
                            aria-checked={selectedFilter === option}
                            className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm cursor-pointer"
                            style={{
                                color: selectedFilter === option
                                    ? "var(--color-header-text-primary)"
                                    : "var(--color-text-secondary)",
                                backgroundColor: selectedFilter === option
                                    ? "var(--color-secondary-surface)"
                                    : "transparent",
                            }}
                            onClick={() => {
                                onSelectFilter(option);
                                setIsOpen(false);
                            }}
                        >
                            <span>{option}</span>
                            {selectedFilter === option ? <span aria-hidden="true">✓</span> : null}
                        </button>
                    ))}
                </div>
            ) : null}
        </div>
    );
}
