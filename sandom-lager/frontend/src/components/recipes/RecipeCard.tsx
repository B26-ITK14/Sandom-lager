/*
    * RecipeCard.tsx
    * Displays a single recipe in a card format for the recipes grid.
    * - Toggle button (top-left) selects/deselects the recipe for the shopping list.
    * - Clicking the card body opens the recipe detail modal.
    * Author: Sebastian Thomsen
*/

import type { Recipe } from "../../types";

interface RecipeCardProps {
    recipe: Recipe;
    selected: boolean;
    onToggle: () => void;
    onOpenDetail: () => void;
    style?: React.CSSProperties;
}

export default function RecipeCard({ recipe, selected, onToggle, onOpenDetail, style }: RecipeCardProps) {

    return (
        <article
            className="relative rounded-2xl overflow-hidden flex flex-col justify-end h-44 shadow-md hover:shadow-lg transition-shadow"
            style={{
                backgroundColor: "var(--color-surface)",
                outline: selected ? "2px solid var(--color-primary)" : "none",
                ...style,
            }}
        >
            {/* Clickable background area – opens detail modal */}
            <button
                type="button"
                onClick={onOpenDetail}
                aria-label={`Vis detaljer for ${recipe.title}`}
                className="absolute inset-0 z-10 cursor-pointer"
                style={{ background: "none", border: "none" }}
                tabIndex={0}
            />

            {/* Image/placeholder background */}
            {recipe.image_url ? (
                <img
                    src={recipe.image_url}
                    alt={recipe.title}
                    className="absolute inset-0 w-full h-full object-cover"
                    aria-hidden="true"
                />
            ) : (
                <div className="absolute inset-0 opacity-40" style={{ backgroundColor: "var(--color-secondary-surface)" }} aria-hidden="true" />
            )}

            {/* Selection toggle – sits above the background button */}
            <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onToggle(); }}
                aria-pressed={selected}
                aria-label={selected ? "Fjern oppskrift fra valg" : "Velg oppskrift"}
                className="absolute top-2 left-2 z-20 w-6 h-6 rounded-full flex items-center justify-center transition-colors cursor-pointer"
                style={{
                    backgroundColor: selected ? "var(--color-primary)" : "rgba(255,255,255,0.25)",
                    border: selected ? "none" : "2px solid rgba(255,255,255,0.6)",
                }}
            >
                {selected && (
                    <svg className="w-3.5 h-3.5" fill="none" stroke="var(--color-on-primary)" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                )}
            </button>

            {/* Bottom content */}
            <footer className="relative z-10 p-3 bg-gradient-to-t from-black/70 to-transparent pt-8 pointer-events-none">
                <h2 className="text-white font-semibold text-sm leading-snug line-clamp-2">
                    {recipe.title}
                </h2>
                {recipe.allergens && recipe.allergens.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                        {recipe.allergens.slice(0, 3).map((allergen) => (
                            <span
                                key={allergen}
                                className="text-xs px-1.5 py-0.5 rounded-full"
                                style={{ backgroundColor: "rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.9)" }}
                            >
                                {allergen}
                            </span>
                        ))}
                        {recipe.allergens.length > 3 && (
                            <span
                                className="text-xs px-1.5 py-0.5 rounded-full"
                                style={{ backgroundColor: "rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.9)" }}
                            >
                                +{recipe.allergens.length - 3}
                            </span>
                        )}
                    </div>
                )}
            </footer>
        </article>
    );
}
