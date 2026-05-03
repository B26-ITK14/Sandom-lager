import { Plus, Zap, List, ListCollapse } from "lucide-react";
import ShoppingListPrintExport from "./ShoppingListPrintExport";
import DeleteShoppingListButton from "./DeleteShoppingListButton";
import type { ShoppingListItem } from "../../types";

interface Props {
    items: ShoppingListItem[];
    onAddItemClick: () => void;
    onGenerateClick: () => void;
    selectedCount: number;
    isGenerating: boolean;
    isCompact: boolean;
    onCompactChange: (compact: boolean) => void;
    onDeleted: () => void;
}

export default function ShoppingListHeader({
    items,
    onAddItemClick,
    onGenerateClick,
    selectedCount,
    isGenerating,
    isCompact,
    onCompactChange,
    onDeleted,
}: Props) {
    return (
        <>

            <section
                className="mb-4 rounded-2xl p-3"
                style={{
                    backgroundColor: "var(--color-surface)",
                    border: "1px solid var(--color-border)",
                }}
            >
                {/* Primary actions bar */}
                <div className="flex items-center gap-2 flex-wrap">
                    {/* Add item button - circular */}
                    <button
                        type="button"
                        onClick={onAddItemClick}
                        aria-label="Legg til vare"
                        className="flex items-center justify-center w-11 h-11 rounded-full shrink-0 transition-colors cursor-pointer"
                        style={{
                            backgroundColor: "var(--color-success, #4caf50)",
                            color: "white",
                            border: "none",
                        }}
                        title="Legg til en ny vare"
                    >
                        <Plus size={20} />
                    </button>

                    {/* Generate button - circular */}
                    <button
                        type="button"
                        onClick={onGenerateClick}
                        disabled={selectedCount === 0 || isGenerating}
                        aria-label="Generer handleliste"
                        className="flex items-center justify-center w-11 h-11 rounded-full shrink-0 transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                        style={{
                            backgroundColor: selectedCount === 0 || isGenerating ? "var(--color-surface)" : "var(--color-primary)",
                            color: selectedCount === 0 || isGenerating ? "var(--color-text-primary)" : "var(--color-on-primary)",
                            border: "1px solid var(--color-border)",
                        }}
                        title={selectedCount === 0 ? "Velg oppskrifter først" : "Generer handleliste fra valgte oppskrifter"}
                    >
                        <Zap size={20} />
                    </button>

                    {/* Compact toggle - circular */}
                    <button
                        type="button"
                        onClick={() => onCompactChange(!isCompact)}
                        aria-label="Bytt visning"
                        className="flex items-center justify-center w-11 h-11 rounded-full shrink-0 transition-colors cursor-pointer"
                        style={{
                            backgroundColor: isCompact ? "var(--color-primary)" : "var(--color-surface)",
                            color: isCompact ? "var(--color-on-primary)" : "var(--color-text-primary)",
                            border: "1px solid var(--color-border)",
                        }}
                        title={isCompact ? "Bytt til detaljert visning" : "Bytt til kompakt visning"}
                    >
                        {isCompact ? <List size={20} /> : <ListCollapse size={20} />}
                    </button>

                    {/* Divider */}
                    <div className="h-8 w-px" style={{ background: "var(--color-border)" }} />

                    {/* Secondary actions */}
                    <div className="flex items-center gap-2">
                        <ShoppingListPrintExport items={items} />
                        <DeleteShoppingListButton onDeleted={onDeleted} />
                    </div>
                </div>

                {/* Generate count info */}
                {selectedCount > 0 && (
                    <p className="mt-3 text-sm" style={{ color: "var(--color-text-secondary)" }}>
                        {isGenerating ? "Genererer handleliste..." : `${selectedCount} oppskrift${selectedCount !== 1 ? "er" : ""} valgt`}
                    </p>
                )}
            </section>
        </>
    );
}
