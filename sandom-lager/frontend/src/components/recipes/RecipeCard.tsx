/*
    * RecipeCard.tsx
    * Displays a single recipe in a card format for the recipes grid.
*/

import type { Recipe } from "../../types";

interface RecipeCardProps {
    recipe: Recipe;
}

// TODO: Add image support and click handling to navigate to recipe details page

export default function RecipeCard({ recipe }: RecipeCardProps) {

    return (
        <article
            className="relative rounded-2xl overflow-hidden flex flex-col justify-end h-44 cursor-pointer shadow-md hover:shadow-lg transition-shadow"
            style={{ backgroundColor: "var(--color-surface)" }}
        >
            {/* Placeholder background */}
            <div className="absolute inset-0 opacity-40" style={{ backgroundColor: "var(--color-secondary-surface)" }} aria-hidden="true" />

            {/* Bottom content */}
            <footer className="relative z-10 p-3 bg-gradient-to-t from-black/70 to-transparent pt-8">
                <h2 className="text-white font-semibold text-sm leading-snug line-clamp-2">
                    {recipe.title}
                </h2>
            </footer>
        </article>
    );
}
