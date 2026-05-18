import { Zap } from "lucide-react";

interface Props {
    onClick: () => void;
    disabled?: boolean;
    selectedCount: number;
    isGenerating: boolean;
}

export default function GenerateShoppingListButton({
    onClick,
    disabled = false,
    selectedCount,
    isGenerating,
}: Props) {
    const label = isGenerating
        ? "Genererer handleliste..."
        : `Generer handleliste${selectedCount > 0 ? ` (${selectedCount})` : ""}`;

    const isDisabled = disabled || selectedCount === 0;

    if (isDisabled) {
        // Render compact circular icon-only button when disabled
        return (
            <button
                type="button"
                onClick={onClick}
                disabled
                aria-label={selectedCount === 0 ? "Velg oppskrifter først" : `Generer handleliste (${selectedCount})`}
                className="flex items-center justify-center w-11 h-11 rounded-full shrink-0 transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                style={{
                    backgroundColor: "var(--color-surface)",
                    color: "var(--color-text-primary)",
                    border: "1px solid var(--color-border)",
                }}
                title={selectedCount === 0 ? "Velg oppskrifter først" : "Generer handleliste fra valgte oppskrifter"}
            >
                <Zap size={20} />
            </button>
        );
    }

    // Render full text+icon button when enabled (matches AddItemButton style)
    return (
        <button
            type="button"
            onClick={onClick}
            className="flex items-center gap-2 py-2 px-4 rounded-md font-medium transition-all hover:shadow-md cursor-pointer"
            style={{
                background: "var(--color-primary)",
                color: "var(--color-on-primary)",
            }}
            title={selectedCount === 0 ? "Velg oppskrifter først" : "Generer handleliste fra valgte oppskrifter"}
            aria-label={`Generer handleliste (${selectedCount})`}
        >
            <Zap size={20} aria-hidden="true" />
            <span>{label}</span>
        </button>
    );
}