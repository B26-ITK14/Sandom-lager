/*
    * RecipeCard.tsx
    * Displays a single recipe in a card format for the recipes grid.
*/

import type { Recipe } from "../../types";

interface RecipeCardProps {
    recipe: Recipe;
    selected: boolean;
    onToggle: () => void;
}

// TODO: Add image support and click handling to navigate to recipe details page
// TODO: Add allergy information based on recipe data

export default function RecipeCard({ recipe, selected, onToggle }: RecipeCardProps) {

    return (
        <article
            className="relative rounded-2xl overflow-hidden flex flex-col justify-end h-44 shadow-md hover:shadow-lg transition-shadow"
            style={{
                backgroundColor: "var(--color-surface)",
                outline: selected ? "2px solid var(--color-primary)" : "none",
            }}
        >
            {/* Placeholder background */}
            <div className="absolute inset-0 opacity-40" style={{ backgroundColor: "var(--color-secondary-surface)" }} aria-hidden="true" />

            {/* Selection checkbox */}
            <button
                type="button"
                onClick={onToggle}
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
            <footer className="relative z-10 p-3 bg-gradient-to-t from-black/70 to-transparent pt-8">
                <h2 className="text-white font-semibold text-sm leading-snug line-clamp-2">
                    {recipe.title}
                </h2>
            </footer>
        </article>
    );
}
