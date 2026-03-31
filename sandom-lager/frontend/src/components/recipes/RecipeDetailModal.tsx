/*
    * RecipeDetailModal.tsx
    * Modal that shows full recipe details: title, category, servings,
    * ingredient list, and instructions/description.
    * Opened when user clicks the recipe card image area.
*/

import LoadingSpinner from "../LoadingSpinner";
import { useRecipeIngredients } from "../../hooks";
import type { Recipe } from "../../types";

interface RecipeDetailModalProps {
    recipe: Recipe;
    onClose: () => void;
}

export default function RecipeDetailModal({ recipe, onClose }: RecipeDetailModalProps) {
    const { ingredients, loading, error } = useRecipeIngredients(recipe.id);

    return (
        /* Backdrop */
        <div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
            style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
            <div
                className="w-full max-w-lg rounded-2xl shadow-xl overflow-hidden flex flex-col h-[80vh]"
                style={{ backgroundColor: "var(--color-background)", border: "1px solid var(--color-border)" }}
                role="dialog"
                aria-modal="true"
                aria-labelledby="recipe-detail-title"
            >
                {/* Header */}
                <div className="flex items-start justify-between px-5 py-4" style={{ borderBottom: "1px solid var(--color-border)" }}>
                    <div>
                        <h2 id="recipe-detail-title" className="text-lg font-semibold leading-tight" style={{ color: "var(--color-text-primary)" }}>
                            {recipe.title}
                        </h2>
                        <div className="flex items-center gap-3 mt-1">
                            <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: "var(--color-secondary-surface)", color: "var(--color-text-secondary)" }}>
                                {recipe.category}
                            </span>
                            <span className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
                                {recipe.servings} porsjoner
                            </span>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Lukk"
                        className="w-8 h-8 flex items-center justify-center rounded-full shrink-0 ml-4 mt-0.5 cursor-pointer"
                        style={{ color: "var(--color-text-secondary)" }}
                    >
                        <svg fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Scrollable content */}
                <div className="overflow-y-auto flex-1 px-5 py-4 flex flex-col gap-5">

                    {loading && (
                        <div className="flex justify-center py-8">
                            <LoadingSpinner />
                        </div>
                    )}

                    {!loading && (
                        <>
                            {/* Ingredients */}
                            <section>
                                <h3 className="text-sm font-semibold mb-2" style={{ color: "var(--color-text-primary)" }}>
                                    Ingredienser
                                </h3>

                                {error && (
                                    <p className="text-sm text-red-500">{error}</p>
                                )}

                                {!error && ingredients.length === 0 && (
                                    <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                                        Ingen ingredienser registrert.
                                    </p>
                                )}

                                {!error && ingredients.length > 0 && (
                                    <ul className="flex flex-col gap-1.5" aria-label="Ingrediensliste">
                                        {ingredients.map((ing) => (
                                            <li
                                                key={ing.id}
                                                className="flex items-center justify-between text-sm py-1.5 px-3 rounded-lg"
                                                style={{ backgroundColor: "var(--color-surface)" }}
                                            >
                                                <span style={{ color: "var(--color-text-primary)" }}>{ing.ingredient_name}</span>
                                                <span className="font-medium" style={{ color: "var(--color-text-secondary)" }}>
                                                    {ing.quantity} {ing.unit}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </section>

                            {/* Instructions */}
                            {recipe.instructions && (
                                <section>
                                    <h3 className="text-sm font-semibold mb-2" style={{ color: "var(--color-text-primary)" }}>
                                        Fremgangsmåte
                                    </h3>
                                    <p
                                        className="text-sm leading-relaxed whitespace-pre-wrap"
                                        style={{ color: "var(--color-text-secondary)" }}
                                    >
                                        {recipe.instructions}
                                    </p>
                                </section>
                            )}

                            {!recipe.instructions && (
                                <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                                    Ingen fremgangsmåte registrert.
                                </p>
                            )}
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="px-5 py-3" style={{ borderTop: "1px solid var(--color-border)" }}>
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-full py-2.5 rounded-xl text-sm font-medium cursor-pointer"
                        style={{
                            backgroundColor: "var(--color-secondary-surface)",
                            color: "var(--color-text-primary)",
                            border: "1px solid var(--color-border)",
                        }}
                    >
                        Lukk
                    </button>
                </div>
            </div>
        </div>
    );
}
