/*
    * AllergenPicker.tsx
    * Renders a grid of allergen checkboxes for the add/edit recipe form.
    * Used by AddRecipeModal.tsx
*/

import type { Allergen } from "../../../types";

interface AllergenPickerProps {
    allAllergens: Allergen[];
    selectedAllergenIds: number[];
    onChange: (ids: number[]) => void;
    style?: React.CSSProperties;
}

export default function AllergenPicker({ allAllergens, selectedAllergenIds, onChange, style }: AllergenPickerProps) {
    if (allAllergens.length === 0) return null;

    return (
        <div className="flex flex-col gap-2" style={style}>
            <span className="text-sm font-medium" style={{ color: "var(--color-text-secondary)" }}>
                Allergener
            </span>
            <div className="grid grid-cols-3 gap-1.5">
                {allAllergens.map((allergen) => (
                    <label key={allergen.id} className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                            type="checkbox"
                            checked={selectedAllergenIds.includes(allergen.id)}
                            onChange={(e) => {
                                onChange(
                                    e.target.checked
                                        ? [...selectedAllergenIds, allergen.id]
                                        : selectedAllergenIds.filter((id) => id !== allergen.id)
                                );
                            }}
                            className="w-4 h-4 rounded cursor-pointer"
                            style={{ accentColor: "var(--color-primary)" }}
                        />
                        <span className="text-sm" style={{ color: "var(--color-text-primary)" }}>
                            {allergen.name}
                        </span>
                    </label>
                ))}
            </div>
        </div>
    );
}
