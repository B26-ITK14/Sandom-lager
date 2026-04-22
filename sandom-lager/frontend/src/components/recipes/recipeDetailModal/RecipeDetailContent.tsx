/*
    * RecipeDetailContent.tsx
    * Scrollable body of the recipe detail modal.
    * Shows recipe image, ingredient list, allergens and instructions.
    * Used by RecipeDetailModal.tsx
    * Author: Sebastian Thomsen
*/

import LoadingSpinner from "../../LoadingSpinner";
import type { Recipe, RecipeIngredient } from "../../../types";

interface RecipeDetailContentProps {
    recipe: Recipe;
    ingredients: RecipeIngredient[];
    loading: boolean;
    error: string | null;
    style?: React.CSSProperties;
}

export default function RecipeDetailContent({ recipe, ingredients, loading, error, style }: RecipeDetailContentProps) {
    return (
        <div className="overflow-y-auto flex-1 px-5 py-4 flex flex-col gap-5" style={style}>

            {recipe.image_url && (
                <img
                    src={recipe.image_url}
                    alt={recipe.title}
                    className="w-full h-48 object-cover rounded-xl"
                    style={{ border: "1px solid var(--color-border)" }}
                />
            )}

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

                    {/* Allergens */}
                    {recipe.allergens && recipe.allergens.length > 0 && (
                        <section>
                            <h3 className="text-sm font-semibold mb-2" style={{ color: "var(--color-text-primary)" }}>
                                Allergener
                            </h3>
                            <div className="flex flex-wrap gap-1.5">
                                {recipe.allergens.map((allergen) => (
                                    <span
                                        key={allergen}
                                        className="text-xs px-2.5 py-1 rounded-full font-medium"
                                        style={{ backgroundColor: "var(--color-secondary-surface)", color: "var(--color-text-secondary)" }}
                                    >
                                        {allergen}
                                    </span>
                                ))}
                            </div>
                        </section>
                    )}

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
    );
}
