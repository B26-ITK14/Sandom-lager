/*
    * IngredientRows.tsx
    * Renders the list of ingredient input rows for the add/edit recipe form.
    * Each row has a name (with datalist autocomplete), a unit selector and a quantity input.
    * Includes an "add row" button and a remove button per row.
    * Used by AddRecipeModal.tsx
*/

import { INGREDIENT_UNITS } from "../../../types";
import type { Ingredient, IngredientUnit } from "../../../types";

const inputStyle = {
    backgroundColor: "var(--color-surface)",
    color: "var(--color-text-primary)",
    border: "1px solid var(--color-border)",
};

export interface IngredientRow {
    existingId: number | null;
    name: string;
    unit: IngredientUnit;
    quantity: string;
}

interface IngredientRowsProps {
    rows: IngredientRow[];
    existingIngredients: Ingredient[];
    onNameChange: (index: number, name: string) => void;
    onRowChange: (index: number, patch: Partial<IngredientRow>) => void;
    onAddRow: () => void;
    onRemoveRow: (index: number) => void;
    style?: React.CSSProperties;
}

export default function IngredientRows({
    rows,
    existingIngredients,
    onNameChange,
    onRowChange,
    onAddRow,
    onRemoveRow,
    style,
}: IngredientRowsProps) {
    return (
        <div className="flex flex-col gap-2" style={style}>
            <span className="text-sm font-medium" style={{ color: "var(--color-text-secondary)" }}>
                Ingredienser
            </span>

            {rows.map((row, index) => {
                const isExisting = row.existingId !== null;
                return (
                    <div key={index} className="flex gap-2 items-start">
                        {/* Ingredient name with datalist autocomplete */}
                        <div className="flex flex-col gap-1 flex-1">
                            <input
                                type="text"
                                list="ingredient-suggestions"
                                value={row.name}
                                onChange={(e) => onNameChange(index, e.target.value)}
                                placeholder="Navn"
                                aria-label={`Ingrediens ${index + 1} navn`}
                                className="rounded-lg px-3 py-2 text-sm outline-none w-full"
                                style={inputStyle}
                            />
                        </div>

                        {/* Unit – read-only if existing ingredient */}
                        <select
                            value={row.unit}
                            onChange={(e) => onRowChange(index, { unit: e.target.value as IngredientUnit })}
                            disabled={isExisting}
                            aria-label={`Ingrediens ${index + 1} enhet`}
                            className="rounded-lg px-2 py-2 text-sm outline-none"
                            style={{
                                ...inputStyle,
                                opacity: isExisting ? 0.6 : 1,
                                width: "5.5rem",
                            }}
                        >
                            {INGREDIENT_UNITS.map((u) => (
                                <option key={u} value={u}>{u}</option>
                            ))}
                        </select>

                        {/* Quantity */}
                        <input
                            type="number"
                            min={0}
                            step="any"
                            value={row.quantity}
                            onChange={(e) => onRowChange(index, { quantity: e.target.value })}
                            placeholder="Mengde"
                            aria-label={`Ingrediens ${index + 1} mengde`}
                            className="rounded-lg px-3 py-2 text-sm outline-none"
                            style={{ ...inputStyle, width: "6rem" }}
                        />

                        {/* Remove row */}
                        {rows.length > 1 && (
                            <button
                                type="button"
                                onClick={() => onRemoveRow(index)}
                                aria-label="Fjern ingrediens"
                                className="mt-1 w-8 h-8 flex items-center justify-center rounded-full shrink-0 cursor-pointer"
                                style={{ color: "var(--color-text-secondary)" }}
                            >
                                <svg fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" className="w-4 h-4" aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}
                    </div>
                );
            })}

            {/* Datalist for autocomplete */}
            <datalist id="ingredient-suggestions">
                {existingIngredients.map((ing) => (
                    <option key={ing.id} value={ing.name} />
                ))}
            </datalist>

            <button
                type="button"
                onClick={onAddRow}
                className="flex items-center gap-1 text-sm font-medium mt-1 self-start cursor-pointer"
                style={{ color: "var(--color-primary)" }}
            >
                <svg fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" className="w-4 h-4" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Legg til ingrediens
            </button>
        </div>
    );
}
