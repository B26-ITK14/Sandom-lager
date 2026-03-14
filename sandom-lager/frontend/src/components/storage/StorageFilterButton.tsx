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
                <div
                    role="menu"
                    aria-label="Filtervalg"
                    className="absolute right-0 top-14 z-20 min-w-52 rounded-2xl border p-2 shadow-lg"
                    style={{ borderColor: "#d4d6db", backgroundColor: "#ffffff" }}
                >
                    {options.map((option) => (
                        <button
                            key={option}
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
                </div>
            ) : null}
        </div>
    );
}
