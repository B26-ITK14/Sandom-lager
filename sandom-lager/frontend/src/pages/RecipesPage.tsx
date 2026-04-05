/*
    * RecipesPage.tsx
*/

import { useMemo, useState } from "react";
import Layout from "../components/Layout";
import LoadingSpinner from "../components/LoadingSpinner";
import RecipeCard from "../components/recipes/RecipeCard";
import RecipeFilterBar from "../components/recipes/RecipeFilterBar";
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

            <RecipeFilterBar
                search={search}
                onSearchChange={setSearch}
                activeCategory={activeCategory}
                onCategoryChange={setActiveCategory}
                categories={categories}
                filterOpen={filterOpen}
                onFilterToggle={() => setFilterOpen((prev) => !prev)}
                canManageRecipes={canManageRecipes}
                onAddRecipe={() => setShowAddModal(true)}
            />

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