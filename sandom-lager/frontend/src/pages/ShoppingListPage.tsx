import Layout from "../components/Layout";
import { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";

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
    const { getAccessTokenSilently } = useAuth0();
    const { selectedIds, clearSelected } = useSelectedRecipes();

    const [items, setItems] = useState<ShoppingListItem[]>([]);
    const [historyRows, setHistoryRows] = useState<ShoppingListHistoryRow[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isHistoryLoading, setIsHistoryLoading] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);
    const [generateError, setGenerateError] = useState<string | null>(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    const loadShoppingList = async () => {
        try {
            const token = await getAccessTokenSilently();
            const data = await fetchShoppingList(token);
            setItems(data);
        } catch (error) {
            console.error("Kunne ikke hente handlelisten", error);
        }
    };

    const loadShoppingListHistory = async () => {
        try {
            const token = await getAccessTokenSilently();
            const data = await fetchShoppingListHistory(token);
            setHistoryRows(data);
        } catch (error) {
            console.error("Kunne ikke hente historikk", error);
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
        } catch (error) {
            console.error("Kunne ikke øke mengde", error);
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
        } catch (error) {
            console.error("Kunne ikke redusere mengde", error);
        }
    };

    const handleUnitUpdate = async (id: number, unit: IngredientUnit) => {
        try {
            const token = await getAccessTokenSilently();
            await updateShoppingListItem(id, { unit }, token);
            setItems((prev) => prev.map((item) => (item.id === id ? { ...item, unit } : item)));
        } catch (error) {
            console.error("Kunne ikke oppdatere enhet", error);
        }
    };

    const handleSetQuantity = async (id: number, nextQuantity: number) => {
        try {
            const token = await getAccessTokenSilently();
            await updateShoppingListItem(id, { needed_quantity: nextQuantity }, token);
            setItems((prev) => prev.map((item) => (item.id === id ? { ...item, needed_quantity: nextQuantity } : item)));
        } catch (error) {
            console.error("Kunne ikke sette mengde", error);
        }
    };

    const handleDelete = async (id: number) => {
        try {
            const token = await getAccessTokenSilently();
            await removeFromShoppingList(id, token);
            setItems(prev => prev.filter(i => i.id !== id));
        } catch (error) {
            console.error("Kunne ikke slette vare", error);
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
        } catch (error) {
            console.error("Kunne ikke generere handleliste", error);
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
                            className="py-2 px-4 rounded-md transition-colors"
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
                            className="py-2 px-4 rounded-md transition-opacity"
                            style={{
                                background: "var(--color-primary)",
                                color: "var(--color-on-primary)",
                                opacity: selectedIds.size === 0 || isGenerating ? 0.6 : 1,
                            }}
                        >
                            {isGenerating ? "Genererer..." : `Generer handleliste (${selectedIds.size})`}
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
                    <ul className="flex flex-col gap-3">
                        {items.map(item => (
                            <ShoppingListItemRow
                                key={item.id}
                                item={item}
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