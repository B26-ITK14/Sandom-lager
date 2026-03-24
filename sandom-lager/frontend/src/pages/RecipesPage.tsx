/*
    * RecipesPage.tsx
*/

import { useMemo, useState } from "react";
import Layout from "../components/Layout";
import LoadingSpinner from "../components/LoadingSpinner";
import RecipeCard from "../components/recipes/RecipeCard";
import AddRecipeModal from "../components/recipes/AddRecipeModal";
import RecipeDetailModal from "../components/recipes/RecipeDetailModal";
import { useRecipes, useUserRole } from "../hooks";
import { useSelectedRecipes } from "../context/SelectedRecipesContext";
import type { Recipe } from "../types";

export default function RecipesPage() {
    const { recipes, loading, error, refresh } = useRecipes();
    const { selectedIds, toggleSelected } = useSelectedRecipes();
    const { role } = useUserRole();
    const [search, setSearch] = useState("");
    const [activeCategory, setActiveCategory] = useState<string | null>(null);
    const [filterOpen, setFilterOpen] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [detailRecipe, setDetailRecipe] = useState<Recipe | null>(null);

    const canManageRecipes = role === "admin" || role === "manager";

    function handleRecipeCreated() {
        setShowAddModal(false);
        refresh();
    }

    const categories = useMemo(() => {
        const unique = Array.from(new Set(recipes.map((r) => r.category)));
        return unique.sort();
    }, [recipes]);

    const filtered = recipes.filter((r) => {
        const matchesSearch = r.title.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = activeCategory === null || r.category === activeCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <Layout>

            {/* Search bar + filter button */}
            <search className="flex gap-2 mb-3">
                <label htmlFor="recipe-search" className="flex-1 relative">
                    <svg
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                    </svg>
                    <input
                        id="recipe-search"
                        type="search"
                        placeholder="Søk etter oppskrifter"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 rounded-full text-sm outline-none"
                        style={{
                            backgroundColor: "var(--color-surface)",
                            color: "var(--color-text-primary)",
                            border: "1px solid var(--color-border)",
                        }}
                    />
                </label>

                <button
                    type="button"
                    onClick={() => setFilterOpen((prev) => !prev)}
                    aria-expanded={filterOpen}
                    aria-label="Filtrer oppskrifter"
                    className="flex items-center justify-center w-10 h-10 rounded-full shrink-0 transition-colors cursor-pointer"
                    style={{
                        backgroundColor: filterOpen || activeCategory !== null
                            ? "var(--color-primary)"
                            : "var(--color-surface)",
                        color: filterOpen || activeCategory !== null
                            ? "var(--color-on-primary)"
                            : "var(--color-text-primary)",
                        border: "1px solid var(--color-border)",
                    }}
                >
                    <svg fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" className="w-4 h-4" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M7 12h10M11 18h2" />
                    </svg>
                </button>

                {canManageRecipes && (
                    <button
                        type="button"
                        onClick={() => setShowAddModal(true)}
                        aria-label="Legg til oppskrift"
                        className="flex items-center justify-center w-10 h-10 rounded-full shrink-0 transition-colors cursor-pointer"
                        style={{
                            backgroundColor: "var(--color-primary)",
                            color: "var(--color-on-primary)",
                            border: "none",
                        }}
                    >
                        <svg fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" className="w-4 h-4" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                        </svg>
                    </button>
                )}
            </search>

            {/* Category filter chips */}
            {filterOpen && categories.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4" role="group" aria-label="Kategorier">
                    <button
                        type="button"
                        onClick={() => setActiveCategory(null)}
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
                            onClick={() => setActiveCategory(cat === activeCategory ? null : cat)}
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

            {/* State handling */}
            {loading && (
                <div className="flex justify-center mt-12">
                    <LoadingSpinner />
                </div>
            )}

            {error && (
                <p className="text-center text-red-500 mt-12">{error}</p>
            )}

            {!loading && !error && filtered.length === 0 && (
                <p
                    className="text-center text-sm mt-12"
                    style={{ color: "var(--color-text-secondary)" }}
                >
                    {search ? "Ingen oppskrifter matcher søket ditt." : "Ingen oppskrifter funnet."}
                </p>
            )}

            {/* Recipe grid */}
            {!loading && !error && filtered.length > 0 && (
                <section aria-label="Oppskriftsliste">
                    <ol className="grid grid-cols-2 gap-3 list-none p-0">
                        {filtered.map((recipe) => (
                            <li key={recipe.id}>
                                <RecipeCard
                                    recipe={recipe}
                                    selected={selectedIds.has(recipe.id)}
                                    onToggle={() => toggleSelected(recipe.id)}
                                    onOpenDetail={() => setDetailRecipe(recipe)}
                                />
                            </li>
                        ))}
                    </ol>
                </section>
            )}
            {/* Add recipe modal */}
            {showAddModal && (
                <AddRecipeModal
                    onClose={() => setShowAddModal(false)}
                    onCreated={handleRecipeCreated}
                />
            )}

            {/* Recipe detail modal */}
            {detailRecipe && (
                <RecipeDetailModal
                    recipe={detailRecipe}
                    onClose={() => setDetailRecipe(null)}
                />
            )}
        </Layout>
    );
}