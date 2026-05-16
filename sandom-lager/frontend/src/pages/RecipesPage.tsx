/*
    * RecipesPage.tsx
    * Main page for browsing, creating, and managing recipes. Displays a list of recipes with filtering options and allows users with appropriate roles to add, edit, or delete recipes.
    * Includes a search bar and category filter for easy navigation through recipes. Clicking on a recipe opens a detail modal with more information and management options.
    * Authors: Sebastian Thomsen
*/

import { useMemo, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import Layout from "../components/Layout";
import LoadingSpinner from "../components/LoadingSpinner";
import RecipeCard from "../components/recipes/RecipeCard";
import RecipeFilterBar from "../components/recipes/RecipeFilterBar";
import AddRecipeModal from "../components/recipes/addRecipeModal/AddRecipeModal";
import RecipeDetailModal from "../components/recipes/recipeDetailModal/RecipeDetailModal";
import { useRecipes, useUserRole, usePageMeta } from "../hooks";
import { useSelectedRecipes } from "../context/SelectedRecipesContext";
import { deleteRecipe } from "../api/recipes";
import { AUTH0_AUDIENCE } from "../config/auth";
import type { Recipe, RecipeIngredient } from "../types";

export default function RecipesPage() {
    usePageMeta({
        title: "Recipes - Sandom Lager",
        description: "Browse, create, and manage your recipes with ingredient tracking and categories",
        keywords: "recipes, cooking, ingredients, recipe management, meal planning",
        ogTitle: "Recipes - Sandom Lager",
        ogDescription: "Manage and organize your recipes",
    });
    const { getAccessTokenSilently } = useAuth0();
    const { recipes, loading, error, refresh } = useRecipes();
    const { selectedIds, toggleSelected } = useSelectedRecipes();
    const { role } = useUserRole();
    const [search, setSearch] = useState("");
    const [activeCategory, setActiveCategory] = useState<string | null>(null);
    const [filterOpen, setFilterOpen] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [detailRecipe, setDetailRecipe] = useState<Recipe | null>(null);
    const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
    const [editIngredients, setEditIngredients] = useState<RecipeIngredient[]>([]);

    const canManageRecipes = role === "admin" || role === "manager";

    function handleRecipeCreated() {
        setShowAddModal(false);
        refresh();
    }

    function handleRecipeSaved() {
        setEditingRecipe(null);
        setEditIngredients([]);
        refresh();
    }

    function handleEditRecipe(ingredients: RecipeIngredient[]) {
        setEditIngredients(ingredients);
        setEditingRecipe(detailRecipe);
        setDetailRecipe(null);
    }

    async function handleDeleteRecipe() {
        if (!detailRecipe) return;
        const token = await getAccessTokenSilently({ authorizationParams: { audience: AUTH0_AUDIENCE } });
        await deleteRecipe(detailRecipe.id, token);
        setDetailRecipe(null);
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

            {/* Edit recipe modal */}
            {editingRecipe && (
                <AddRecipeModal
                    onClose={() => { setEditingRecipe(null); setEditIngredients([]); }}
                    onCreated={handleRecipeSaved}
                    initialRecipe={editingRecipe}
                    initialIngredients={editIngredients}
                />
            )}

            {/* Recipe detail modal */}
            {detailRecipe && (
                <RecipeDetailModal
                    recipe={detailRecipe}
                    onClose={() => setDetailRecipe(null)}
                    canManage={canManageRecipes}
                    onEdit={handleEditRecipe}
                    onDelete={handleDeleteRecipe}
                />
            )}
        </Layout>
    );
}