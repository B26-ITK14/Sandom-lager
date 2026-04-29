/*
    * ShoppingListPage.tsx
    * Main page for managing the shopping list, including generating from recipes, editing items, and viewing history.
*/

import Layout from "../components/Layout";
import { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { usePageMeta } from "../hooks";

import { fetchShoppingList, fetchShoppingListHistory, generateShoppingListFromRecipes, updateShoppingListItem, removeFromShoppingList } from "../api";
import type { IngredientUnit, ShoppingListHistoryRow, ShoppingListItem } from "../types";
import { useSelectedRecipes } from "../context/SelectedRecipesContext";

import ShoppingListToolbar from "../components/shoppingListPage/ShoppingListToolbar";
import ShoppingListItemRow from "../components/shoppingListPage/ShoppingListItem";
import ShoppingListPrintExport from "../components/shoppingListPage/ShoppingListPrintExport";
import DeleteShoppingListButton from "../components/shoppingListPage/DeleteShoppingListButton";
import ShoppingListHistory from "../components/shoppingListPage/ShoppingListHistory";
import { EmptyShoppingList }  from "../components/shoppingListPage/EmptyShoppingList";
import AddShoppingItemModal from "../components/shoppingListPage/AddShoppingItemModal";

export default function ShoppingListPage() {
    usePageMeta({
        title: "Shopping List - Sandom Lager",
        description: "Create and manage shopping lists from your recipes with history tracking",
        keywords: "shopping list, grocery list, meal planning, recipes",
        ogTitle: "Shopping List - Sandom Lager",
        ogDescription: "Manage your shopping lists",
    });
    const { getAccessTokenSilently } = useAuth0();
    const { selectedIds, clearSelected } = useSelectedRecipes();

    const [items, setItems] = useState<ShoppingListItem[]>([]);
    const [historyRows, setHistoryRows] = useState<ShoppingListHistoryRow[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isHistoryLoading, setIsHistoryLoading] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);
    const [generateError, setGenerateError] = useState<string | null>(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [compact, setCompact] = useState(false);

    const loadShoppingList = async () => {
        try {
            const token = await getAccessTokenSilently();
            const data = await fetchShoppingList(token);
            setItems(data);
        } catch {
            // Ignore load failures here; the page will remain in its current state.
        }
    };

    const loadShoppingListHistory = async () => {
        try {
            const token = await getAccessTokenSilently();
            const data = await fetchShoppingListHistory(token);
            setHistoryRows(data);
        } catch {
            // Ignore load failures here; the page will remain in its current state.
        }
    };

    useEffect(() => {
        async function initialLoad() {
            await Promise.all([
                loadShoppingList(),
                loadShoppingListHistory(),
            ]);
            setIsLoading(false);
            setIsHistoryLoading(false);
        }
        void initialLoad();
    }, [getAccessTokenSilently]);

    const handleIncrease = async (id: number) => {
        const item = items.find(i => i.id === id);
        if (!item) return;

        const nextQuantity = Number(item.needed_quantity) + 1;

        try {
            const token = await getAccessTokenSilently();
            await updateShoppingListItem(id, { needed_quantity: nextQuantity }, token);
            setItems(prev =>
                prev.map(i =>
                    i.id === id ? { ...i, needed_quantity: nextQuantity } : i
                )
            );
        } catch {
            // Ignore update failures here.
        }
    };

    const handleDecrease = async (id: number) => {
        const item = items.find(i => i.id === id);
        if (!item) return;

        const currentQuantity = Number(item.needed_quantity);
        if (currentQuantity <= 1) return;

        const nextQuantity = currentQuantity - 1;

        try {
            const token = await getAccessTokenSilently();
            await updateShoppingListItem(id, { needed_quantity: nextQuantity }, token);
            setItems(prev =>
                prev.map(i =>
                    i.id === id ? { ...i, needed_quantity: nextQuantity } : i
                )
            );
        } catch {
            // Ignore update failures here.
        }
    };

    const handleUnitUpdate = async (id: number, unit: IngredientUnit) => {
        try {
            const token = await getAccessTokenSilently();
            await updateShoppingListItem(id, { unit }, token);
            setItems((prev) => prev.map((item) => (item.id === id ? { ...item, unit } : item)));
        } catch {
            // Ignore update failures here.
        }
    };

    const handleSetQuantity = async (id: number, nextQuantity: number) => {
        try {
            const token = await getAccessTokenSilently();
            await updateShoppingListItem(id, { needed_quantity: nextQuantity }, token);
            setItems((prev) => prev.map((item) => (item.id === id ? { ...item, needed_quantity: nextQuantity } : item)));
        } catch {
            // Ignore update failures here.
        }
    };

    const handleDelete = async (id: number) => {
        try {
            const token = await getAccessTokenSilently();
            await removeFromShoppingList(id, token);
            setItems(prev => prev.filter(i => i.id !== id));
        } catch {
            // Ignore delete failures here.
        }
    };

    const handleGenerateShoppingList = async () => {
        if (selectedIds.size === 0 || isGenerating) return;

        setIsGenerating(true);
        setGenerateError(null);

        try {
            const token = await getAccessTokenSilently();
            await generateShoppingListFromRecipes(Array.from(selectedIds), token);
            clearSelected();
            await loadShoppingList();
        } catch {
            setGenerateError("Kunne ikke generere handleliste");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <Layout>
            <section className="flex flex-col gap-6">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                    <ShoppingListToolbar />
                    <div className="flex gap-3 flex-wrap items-center">
                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="py-2 px-4 rounded-md transition-colors cursor-pointer"
                            style={{
                                background: "var(--color-primary)",
                                color: "var(--color-on-primary)",
                            }}
                        >
                            + Legg til vare
                        </button>
                        <button
                            onClick={handleGenerateShoppingList}
                            disabled={selectedIds.size === 0 || isGenerating}
                            className="py-2 px-4 rounded-md transition-opacity cursor-pointer disabled:cursor-not-allowed"
                            style={{
                                background: "var(--color-primary)",
                                color: "var(--color-on-primary)",
                                opacity: selectedIds.size === 0 || isGenerating ? 0.6 : 1,
                            }}
                        >
                            {isGenerating ? "Genererer..." : `Generer handleliste (${selectedIds.size})`}
                        </button>
                        <button
                            onClick={() => setCompact(prev => !prev)}
                            className="py-2 px-4 rounded-md transition-colors cursor-pointer"
                            style={{
                                background: "var(--color-secondary-surface)",
                                border: "1px solid var(--color-border)",
                                color: "var(--color-text-primary)",
                            }}
                            title={compact ? "Bytt til detaljert visning" : "Bytt til kompakt visning"}
                        >
                            {compact ? "Detaljert" : "Kompakt"}
                        </button>
                        <ShoppingListPrintExport items={items} />
                        <DeleteShoppingListButton
                            onDeleted={async () => {
                                await Promise.all([loadShoppingList(), loadShoppingListHistory()]);
                            }}
                        />
                    </div>
                </div>

                {generateError && (
                    <p className="text-sm" style={{ color: "var(--color-error, #d32f2f)" }}>
                        {generateError}
                    </p>
                )}

                {isLoading ? (
                    <p style={{ color: "var(--color-text-secondary)" }}>Laster handleliste...</p>
                ) : items.length === 0 ? (
                    <EmptyShoppingList />
                ) : (
                    <ul className={`flex flex-col ${compact ? "gap-0" : "gap-3"}`}>
                        {items.map(item => (
                            <ShoppingListItemRow
                                key={item.id}
                                item={item}
                                compact={compact}
                                onIncrease={handleIncrease}
                                onDecrease={handleDecrease}
                                onDelete={handleDelete}
                                onUpdateUnit={handleUnitUpdate}
                                onSetQuantity={handleSetQuantity}
                            />
                        ))}
                    </ul>
                )}

                <ShoppingListHistory rows={historyRows} isLoading={isHistoryLoading} />
            </section>

            <AddShoppingItemModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onItemAdded={loadShoppingList}
            />
            
        </Layout>
    ) 
}