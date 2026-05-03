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
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className="flex items-center gap-2 py-2 px-4 rounded-md font-medium transition-all hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            style={{
                background: "var(--color-primary)",
                color: "var(--color-on-primary)",
            }}
            title={selectedCount === 0 ? "Velg oppskrifter først" : "Generer handleliste fra valgte oppskrifter"}
        >
            <Zap size={20} />
            <span>{isGenerating ? "Genererer..." : `Generer (${selectedCount})`}</span>
        </button>
    );
}
