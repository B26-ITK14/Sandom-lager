/*
    * RecipeFormFields.tsx
    * Basic text fields for the add/edit recipe form:
    * title, category, servings and instructions.
    * Used by AddRecipeModal.tsx
*/

import { useRef, useEffect } from "react";
import { RECIPE_CATEGORIES } from "../../../types";

const inputStyle = {
    backgroundColor: "var(--color-surface)",
    color: "var(--color-text-primary)",
    border: "1px solid var(--color-border)",
};

interface RecipeFormFieldsProps {
    title: string;
    onTitleChange: (value: string) => void;
    category: string;
    onCategoryChange: (value: string) => void;
    servings: string;
    onServingsChange: (value: string) => void;
    instructions: string;
    onInstructionsChange: (value: string) => void;
    style?: React.CSSProperties;
}

export default function RecipeFormFields({
    title,
    onTitleChange,
    category,
    onCategoryChange,
    servings,
    onServingsChange,
    instructions,
    onInstructionsChange,
    style,
}: RecipeFormFieldsProps) {
    const titleRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        titleRef.current?.focus();
    }, []);

    return (
        <div className="flex flex-col gap-4" style={style}>
            {/* Title */}
            <div className="flex flex-col gap-1">
                <label htmlFor="recipe-title" className="text-sm font-medium" style={{ color: "var(--color-text-secondary)" }}>
                    Tittel <span aria-hidden="true">*</span>
                </label>
                <input
                    id="recipe-title"
                    ref={titleRef}
                    type="text"
                    value={title}
                    onChange={(e) => onTitleChange(e.target.value)}
                    required
                    placeholder="F.eks. Pasta Carbonara"
                    className="rounded-lg px-3 py-2 text-sm outline-none"
                    style={inputStyle}
                />
            </div>

            {/* Category */}
            <div className="flex flex-col gap-1">
                <label htmlFor="recipe-category" className="text-sm font-medium" style={{ color: "var(--color-text-secondary)" }}>
                    Kategori <span aria-hidden="true">*</span>
                </label>
                <select
                    id="recipe-category"
                    value={category}
                    onChange={(e) => onCategoryChange(e.target.value)}
                    className="rounded-lg px-3 py-2 text-sm outline-none cursor-pointer"
                    style={inputStyle}
                >
                    <option value="" disabled>Velg kategori</option>
                    {RECIPE_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                </select>
            </div>

            {/* Servings */}
            <div className="flex flex-col gap-1">
                <label htmlFor="recipe-servings" className="text-sm font-medium" style={{ color: "var(--color-text-secondary)" }}>
                    Antall porsjoner
                </label>
                <input
                    id="recipe-servings"
                    type="number"
                    min={1}
                    value={servings}
                    onChange={(e) => onServingsChange(e.target.value)}
                    className="rounded-lg px-3 py-2 text-sm outline-none w-28"
                    style={inputStyle}
                />
            </div>

            {/* Instructions */}
            <div className="flex flex-col gap-1">
                <label htmlFor="recipe-instructions" className="text-sm font-medium" style={{ color: "var(--color-text-secondary)" }}>
                    Fremgangsmåte
                </label>
                <textarea
                    id="recipe-instructions"
                    value={instructions}
                    onChange={(e) => onInstructionsChange(e.target.value)}
                    rows={4}
                    placeholder="Beskriv fremgangsmåten steg for steg..."
                    className="rounded-lg px-3 py-2 text-sm outline-none resize-y"
                    style={inputStyle}
                />
            </div>
        </div>
    );
}
