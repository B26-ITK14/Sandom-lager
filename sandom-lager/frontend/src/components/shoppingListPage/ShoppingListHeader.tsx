/*
    * ShoppingListHeader.tsx
    * The header component for the shopping list page. It contains buttons for adding items, generating the shopping list from selected recipes, toggling between compact and detailed views, and exporting or deleting the shopping list.
    * The header also displays the number of selected recipes when generating the shopping list.
    * Author: Emil Berglund
*/

import { Plus } from "lucide-react";
import GenerateShoppingListButton from "./GenerateShoppingListButton";
import CompactToggleButton from "./CompactToggleButton";
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

                    {/* Generate button */}
                    <GenerateShoppingListButton
                        onClick={onGenerateClick}
                        disabled={selectedCount === 0 || isGenerating}
                        selectedCount={selectedCount}
                        isGenerating={isGenerating}
                    />

                    {/* Compact toggle */}
                    <CompactToggleButton isCompact={isCompact} onChange={onCompactChange} />

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
