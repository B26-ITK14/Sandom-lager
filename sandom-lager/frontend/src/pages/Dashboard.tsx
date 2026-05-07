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
import { useEffect, useState } from "react";
import { fetchShoppingList } from "../api/storage";
import { AUTH0_AUDIENCE } from "../config/auth";
import type { ShoppingListItem } from "../types";
import { ROUTES } from "../router/routes";
import { BookOpen, ShoppingCart, Package, AlertTriangle } from "lucide-react";
import { usePageMeta } from "../hooks";

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
    const { inventory, isLoading: inventoryLoading } = useInventory();
    const { getAccessTokenSilently, isAuthenticated } = useAuth0();
    const [shoppingList, setShoppingList] = useState<ShoppingListItem[]>([]);
    const [shoppingLoading, setShoppingLoading] = useState(true);

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

    const totalInventoryItems = inventory.length;
    const activeRecipes = recipes.length;
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

    const featuredRecipes = recipes.slice(0, 3);

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