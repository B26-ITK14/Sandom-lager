import Layout from "../components/Layout";
import { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";

import { fetchShoppingList, updateShoppingListItem, removeFromShoppingList } from "../api";
import type { ShoppingListItem } from "../types";

import ShoppingListToolbar from "../components/shoppingListPage/ShoppingListToolbar";
import ShoppingListItemRow from "../components/shoppingListPage/ShoppingListItem";
import ShoppingListPrintExport from "../components/shoppingListPage/ShoppingListPrintExport";
import { EmptyShoppingList }  from "../components/shoppingListPage/EmptyShoppingList";
import AddShoppingItemModal from "../components/shoppingListPage/AddShoppingItemModal";

export default function ShoppingListPage() {
    const { getAccessTokenSilently } = useAuth0();

    const [items, setItems] = useState<ShoppingListItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
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

    useEffect(() => {
        async function initialLoad() {
            await loadShoppingList();
            setIsLoading(false);
        }
        void initialLoad();
    }, [getAccessTokenSilently]);

    const handleIncrease = async (id: number) => {
        const item = items.find(i => i.id === id);
        if (!item) return;

        try {
            const token = await getAccessTokenSilently();
            await updateShoppingListItem(id, item.needed_quantity + 1, token);
            setItems(prev =>
                prev.map(i =>
                    i.id === id ? { ...i, needed_quantity: i.needed_quantity + 1 } : i
                )
            );
        } catch (error) {
            console.error("Kunne ikke øke mengde", error);
        }
    };

    const handleDecrease = async (id: number) => {
        const item = items.find(i => i.id === id);
        if (!item || item.needed_quantity <= 1) return;

        try {
            const token = await getAccessTokenSilently();
            await updateShoppingListItem(id, item.needed_quantity - 1, token);
            setItems(prev =>
                prev.map(i =>
                    i.id === id ? { ...i, needed_quantity: i.needed_quantity - 1 } : i
                )
            );
        } catch (error) {
            console.error("Kunne ikke redusere mengde", error);
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

    return (
        <Layout>
            <section className="flex flex-col gap-6">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                    <ShoppingListToolbar onAddItem={() => setIsAddModalOpen(true)} />
                    <ShoppingListPrintExport items={items} />
                </div>

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
                            />
                        ))}
                    </ul>
                )}
            </section>

            <AddShoppingItemModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onItemAdded={loadShoppingList}
            />
            
        </Layout>
    ) 
}