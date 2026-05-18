/*
    * RecipeFilterBar.tsx
    * Search bar, category filter, and add-recipe button for the recipes page.
    * The add-recipe button is only visible for admin/manager users.
    * Author: Sebastian Thomsen
*/

import SearchInput from "../SearchInput";

interface RecipeFilterBarProps {
    search: string;
    onSearchChange: (value: string) => void;
    activeCategory: string | null;
    onCategoryChange: (category: string | null) => void;
    categories: string[];
    canManageRecipes: boolean;
    onAddRecipe: () => void;
}

export default function RecipeFilterBar({
    search,
    onSearchChange,
    activeCategory,
    onCategoryChange,
    categories,
    canManageRecipes,
    onAddRecipe,
}: RecipeFilterBarProps) {
    return (
        <>
            <search className="flex items-center gap-2 mb-3">
                <SearchInput
                    id="recipe-search"
                    value={search}
                    onChange={onSearchChange}
                    placeholder="Søk etter oppskrifter"
                />

                {canManageRecipes && (
                    <button
                        type="button"
                        onClick={onAddRecipe}
                        aria-label="Legg til oppskrift"
                        className="flex items-center justify-center w-11 h-11 rounded-full shrink-0 transition-colors cursor-pointer"
                        style={{
                            backgroundColor: "var(--color-primary)",
                            color: "var(--color-on-primary)",
                            border: "none",
                        }}
                    >
                        <svg fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" className="w-[18px] h-[18px]" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                        </svg>
                    </button>
                )}
            </search>

            {categories.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4" role="group" aria-label="Kategorier">
                    <button
                        type="button"
                        onClick={() => onCategoryChange(null)}
                        className="px-3 py-1 rounded-full text-sm font-medium transition-colors cursor-pointer"
                        style={{
                            backgroundColor: activeCategory === null ? "var(--color-primary)" : "var(--color-surface)",
                            color: activeCategory === null ? "var(--color-on-primary)" : "var(--color-text-primary)",
                            border: "1px solid var(--color-border)",
                        }}
                    >
                        Alle
                    </button>
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            type="button"
                            onClick={() => onCategoryChange(cat === activeCategory ? null : cat)}
                            className="px-3 py-1 rounded-full text-sm font-medium transition-colors cursor-pointer"
                            style={{
                                backgroundColor: activeCategory === cat ? "var(--color-primary)" : "var(--color-surface)",
                                color: activeCategory === cat ? "var(--color-on-primary)" : "var(--color-text-primary)",
                                border: "1px solid var(--color-border)",
                            }}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            )}
        </>
    );
}
