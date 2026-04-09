/**
 * StorageFilterBtn.tsx
 * A filter button component for the storage page that allows users to select a filter the inventory.
 */

import { SlidersHorizontal } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent as ReactKeyboardEvent } from "react";

type StorageFilterButtonProps = {
    options: string[];
    selectedFilter: string;
    onSelectFilter: (filter: string) => void;
};

export default function StorageFilterButton({ options, selectedFilter, onSelectFilter,}: StorageFilterButtonProps) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLElement>(null);
    const optionButtonRefs = useRef<Array<HTMLButtonElement | null>>([]);

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

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        const selectedIndex = options.findIndex((option) => option === selectedFilter);
        const focusIndex = selectedIndex >= 0 ? selectedIndex : 0;
        optionButtonRefs.current[focusIndex]?.focus();
    }, [isOpen, options, selectedFilter]);

    function handleMenuKeyDown(event: ReactKeyboardEvent<HTMLElement>) {
        const currentIndex = optionButtonRefs.current.findIndex(
            (button) => button === document.activeElement
        );

        if (event.key === "ArrowDown") {
            event.preventDefault();
            const nextIndex = currentIndex < options.length - 1 ? currentIndex + 1 : 0;
            optionButtonRefs.current[nextIndex]?.focus();
            return;
        }

        if (event.key === "ArrowUp") {
            event.preventDefault();
            const nextIndex = currentIndex > 0 ? currentIndex - 1 : options.length - 1;
            optionButtonRefs.current[nextIndex]?.focus();
            return;
        }

        if (event.key === "Home") {
            event.preventDefault();
            optionButtonRefs.current[0]?.focus();
            return;
        }

        if (event.key === "End") {
            event.preventDefault();
            optionButtonRefs.current[options.length - 1]?.focus();
        }
    }

    return (
        <section ref={containerRef} className="relative" aria-label="Filter produkter">
            <button
                type="button"
                className="grid h-12 w-12 place-items-center rounded-2xl"
                style={{ backgroundColor: "#5d6cb5", color: "#ffffff" }}
                aria-label="Filtrer produkter"
                aria-expanded={isOpen}
                aria-haspopup="menu"
                onClick={() => setIsOpen((prev) => !prev)}
            >
                <SlidersHorizontal size={22} />
            </button>

            {isOpen ? (
                <section
                    role="menu"
                    aria-label="Filtervalg"
                    className="absolute right-0 top-14 z-20 min-w-52 rounded-2xl border p-2 shadow-lg"
                    style={{ borderColor: "#d4d6db", backgroundColor: "#ffffff" }}
                    onKeyDown={handleMenuKeyDown}
                >
                    {options.map((option, index) => (
                        <button
                            key={option}
                            ref={(element) => {
                                optionButtonRefs.current[index] = element;
                            }}
                            type="button"
                            role="menuitemradio"
                            aria-checked={selectedFilter === option}
                            className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm"
                            style={{
                                color: selectedFilter === option ? "#23305f" : "#5f6470",
                                backgroundColor: selectedFilter === option ? "#eef1ff" : "transparent",
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
                </section>
            ) : null}
        </section>
    );
}
