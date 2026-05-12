/*
 * Dashboard.tsx
 * Hovedside etter innlogging. Viser statistikk, planlegging og aktive oppskrifter.
 * Author: Khalid Osman
 */

import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { useRecipes } from "../hooks/recipes/useRecipes";
import { useInventory } from "../hooks/storage/useInventory";
import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useMemo, useState } from "react";
import { fetchShoppingList } from "../api/storage";
import { fetchRecipeIngredients } from "../api/recipes";
import { AUTH0_AUDIENCE } from "../config/auth";
import type { RecipeIngredient, ShoppingListItem } from "../types";
import { ROUTES } from "../router/routes";
import { BookOpen, ShoppingCart, Package, AlertTriangle, Users } from "lucide-react";
import { usePageMeta } from "../hooks";
import { useSelectedRecipes } from "../context/SelectedRecipesContext";

export default function Dashboard() {
    usePageMeta({
        title: "Dashboard - Sandom Lager",
        description: "View your inventory statistics, active recipes, and shopping list at a glance",
        keywords: "dashboard, inventory overview, recipes, shopping list",
        ogTitle: "Dashboard - Sandom Lager",
        ogDescription: "Manage your inventory and recipes",
    });
    const navigate = useNavigate();
    const { recipes, loading: recipesLoading } = useRecipes();
    const { selectedIds, numberOfPeople, numberOfPeopleInput, setNumberOfPeople, setNumberOfPeopleInput } = useSelectedRecipes();
    const { inventory, isLoading: inventoryLoading } = useInventory();
    const { getAccessTokenSilently, isAuthenticated } = useAuth0();
    const [shoppingList, setShoppingList] = useState<ShoppingListItem[]>([]);
    const [shoppingLoading, setShoppingLoading] = useState(true);
    const [recipeIngredients, setRecipeIngredients] = useState<Map<number, RecipeIngredient[]>>(new Map());

    useEffect(() => {
        if (!isAuthenticated) return;
        async function loadShoppingList() {
            try {
                const token = await getAccessTokenSilently({
                    authorizationParams: { audience: AUTH0_AUDIENCE },
                });
                const data = await fetchShoppingList(token);
                setShoppingList(data);
            } catch {
                setShoppingList([]);
            } finally {
                setShoppingLoading(false);
            }
        }
        loadShoppingList();
    }, [isAuthenticated, getAccessTokenSilently]);

    useEffect(() => {
        if (!isAuthenticated || selectedIds.size === 0) {
            setRecipeIngredients(new Map());
            return;
        }
        let cancelled = false;
        async function loadIngredients() {
            try {
                const token = await getAccessTokenSilently({
                    authorizationParams: { audience: AUTH0_AUDIENCE },
                });
                const entries = await Promise.all(
                    Array.from(selectedIds).map(async (id) => {
                        const ingredients = await fetchRecipeIngredients(id, token);
                        return [id, ingredients] as [number, RecipeIngredient[]];
                    })
                );
                if (!cancelled) setRecipeIngredients(new Map(entries));
            } catch {
                if (!cancelled) setRecipeIngredients(new Map());
            }
        }
        loadIngredients();
        return () => { cancelled = true; };
    }, [isAuthenticated, getAccessTokenSilently, selectedIds]);

    const totalInventoryItems = inventory.length;
    const activeRecipes = selectedIds.size;
    const shoppingListCount = shoppingList.length;

    const statCards = [
        {
            label: "Aktive Oppskrifter",
            value: recipesLoading ? "..." : activeRecipes,
            icon: BookOpen,
            color: "#15803D",
            bg: "#DCFCE7",
            route: ROUTES.RECIPES.path,
        },
        {
            label: "Varer på Lager",
            value: inventoryLoading ? "..." : totalInventoryItems,
            icon: Package,
            color: "#1D4ED8",
            bg: "#DBEAFE",
            route: ROUTES.STORAGE.path,
        },
        {
            label: "Handleliste",
            value: shoppingLoading ? "..." : shoppingListCount,
            icon: ShoppingCart,
            color: "#A16207",
            bg: "#FEF9C3",
            route: ROUTES.SHOPPING_LIST.path,
        },
        {
            label: "Mangler på Lager",
            value: inventoryLoading ? "..." : inventory.filter(i => i.quantity === 0).length,
            icon: AlertTriangle,
            color: "#B91C1C",
            bg: "#FEE2E2",
            route: ROUTES.STORAGE.path,
        },
    ];

    const featuredRecipes = recipes.filter(r => selectedIds.has(r.id));

    const scaledIngredients = useMemo(() => {
        const map = new Map<string, { name: string; quantity: number; unit: string }>();
        for (const recipe of featuredRecipes) {
            const ingredients = recipeIngredients.get(recipe.id) ?? [];
            const scale = numberOfPeople / (recipe.servings || 8);
            for (const ing of ingredients) {
                const key = `${ing.ingredient_name}__${ing.unit}`;
                const existing = map.get(key);
                const scaled = ing.quantity * scale;
                if (existing) {
                    existing.quantity += scaled;
                } else {
                    map.set(key, { name: ing.ingredient_name, quantity: scaled, unit: ing.unit });
                }
            }
        }
        return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
    }, [featuredRecipes, recipeIngredients, numberOfPeople]);

    return (
        <Layout>
            <main>
                {/* Stat-kort */}
                <section className="flex flex-wrap gap-3 mb-6">
                    {statCards.map(({ label, value, icon: Icon, color, bg, route }) => (
                        <button
                            key={label}
                            onClick={() => navigate(route)}
                            className="flex-1 min-w-[140px] rounded-2xl p-4 transition-all duration-150 hover:shadow-md active:scale-95 cursor-pointer"
                            style={{ 
                                backgroundColor: bg,
                                border: `1px solid ${bg}`,
                            }}
                            aria-label={`Gå til ${label}`}
                        >
                            <div className="flex items-center gap-2 mb-1">
                                <Icon size={16} style={{ color }} />
                                <p className="text-xs font-medium text-left" style={{ color }}>
                                    {label}
                                </p>
                            </div>
                            <p className="text-2xl font-bold text-left" style={{ color }}>
                                {value}
                            </p>
                        </button>
                    ))}
                </section>

                {/* Kalkuler ingredienser */}
                {featuredRecipes.length > 0 && (
                    <section
                        className="rounded-2xl p-5 mt-6"
                        style={{
                            backgroundColor: "var(--color-surface)",
                            border: "1px solid var(--color-border)",
                        }}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h2
                                className="text-base font-semibold"
                                style={{ color: "var(--color-text-primary)" }}
                            >
                                Ingredienser
                            </h2>
                            <div className="flex items-center gap-2">
                                <Users size={14} style={{ color: "var(--color-text-secondary)" }} />
                                <label
                                    htmlFor="number-of-people"
                                    className="text-xs"
                                    style={{ color: "var(--color-text-secondary)" }}
                                >
                                    Antall personer:
                                </label>
                                <input
                                    id="number-of-people"
                                    type="number"
                                    min="1"
                                    step="1"
                                    value={numberOfPeopleInput}
                                    onChange={(e) => {
                                        setNumberOfPeopleInput(e.target.value);
                                        const val = parseInt(e.target.value, 10);
                                        if (!isNaN(val) && val >= 1) setNumberOfPeople(val);
                                    }}
                                    onBlur={() => {
                                        if (numberOfPeopleInput === "" || parseInt(numberOfPeopleInput, 10) < 1) {
                                            setNumberOfPeopleInput(String(numberOfPeople));
                                        }
                                    }}
                                    className="w-16 rounded-md px-2 py-1 text-sm font-semibold text-center"
                                    style={{
                                        border: "1px solid var(--color-border)",
                                        backgroundColor: "var(--color-background)",
                                        color: "var(--color-text-primary)",
                                    }}
                                />
                            </div>
                        </div>

                        {scaledIngredients.length === 0 ? (
                            <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                                Ingen ingredienser funnet for valgte oppskrifter.
                            </p>
                        ) : (
                            <div className="flex flex-col gap-1">
                                {scaledIngredients.map((ing) => (
                                    <div
                                        key={`${ing.name}__${ing.unit}`}
                                        className="flex items-center justify-between rounded-xl px-3 py-2"
                                        style={{ backgroundColor: "var(--color-background)" }}
                                    >
                                        <span className="text-sm" style={{ color: "var(--color-text-primary)" }}>
                                            {ing.name}
                                        </span>
                                        <span className="text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>
                                            {Number(ing.quantity.toFixed(2))}{" "}
                                            {ing.unit}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                )}

                {/* Handleliste-snarvei */}
                <section
                    className="rounded-2xl p-5 mb-6"
                    style={{
                        backgroundColor: "var(--color-surface)",
                        border: "1px solid var(--color-border)",
                    }}
                >
                    <div className="flex items-center justify-between mb-3">
                        <h2
                            className="text-base font-semibold"
                            style={{ color: "var(--color-text-primary)" }}
                        >
                            Handleliste
                        </h2>
                        <span
                            className="text-sm font-medium"
                            style={{ color: "var(--color-text-secondary)" }}
                        >
                            {shoppingLoading ? "..." : `${shoppingListCount} Varer`}
                        </span>
                    </div>
                    <button
                        onClick={() => navigate(ROUTES.SHOPPING_LIST.path)}
                        className="w-full rounded-xl py-2.5 text-sm font-semibold transition-all duration-150 active:scale-95 cursor-pointer"
                        style={{
                            backgroundColor: "var(--color-primary)",
                            color: "var(--color-on-primary)",
                        }}
                    >
                        Gå til handleliste
                    </button>
                </section>

                {/* Aktive oppskrifter */}
                <section
                    className="rounded-2xl p-5"
                    style={{
                        backgroundColor: "var(--color-surface)",
                        border: "1px solid var(--color-border)",
                    }}
                >
                    <div className="flex items-center justify-between mb-4">
                        <h2
                            className="text-base font-semibold"
                            style={{ color: "var(--color-text-primary)" }}
                        >
                            Aktive oppskrifter
                        </h2>
                        <button
                            onClick={() => navigate(ROUTES.RECIPES.path)}
                            className="text-xs font-medium cursor-pointer"
                            style={{ color: "var(--color-primary)" }}
                        >
                            Se alle
                        </button>
                    </div>

                    {recipesLoading ? (
                        <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                            Laster oppskrifter...
                        </p>
                    ) : featuredRecipes.length === 0 ? (
                        <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                            Ingen oppskrifter lagt til ennå.
                        </p>
                    ) : (
                        <div className="flex flex-wrap gap-3">
                            {featuredRecipes.map((recipe) => (
                                <div
                                    key={recipe.id}
                                    className="flex items-center gap-3 rounded-xl p-3 flex-1 min-w-[200px]"
                                    style={{ border: "1px solid var(--color-border)" }}
                                >
                                    <div
                                        className="flex h-10 w-10 items-center justify-center rounded-full shrink-0"
                                        style={{
                                            backgroundColor: "var(--color-secondary-surface)",
                                            color: "var(--color-primary)",
                                        }}
                                    >
                                        <BookOpen size={16} />
                                    </div>
                                    <div>
                                        <p
                                            className="text-sm font-semibold"
                                            style={{ color: "var(--color-text-primary)" }}
                                        >
                                            {recipe.title}
                                        </p>
                                        <p
                                            className="text-xs"
                                            style={{ color: "var(--color-text-secondary)" }}
                                        >
                                            {recipe.category}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </main>
        </Layout>
    );
}