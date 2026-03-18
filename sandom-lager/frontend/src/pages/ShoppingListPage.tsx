import Layout from "../components/Layout";
import { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";

import { fetchShoppingList } from "../api";
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

    useEffect(() => {
        async function loadShoppingList() {
            try {
                const token = await getAccessTokenSilently();
                const data = await fetchShoppingList(token);
                setItems(data);
            } catch (error) {
                console.error("Kunne ikke hente handlelisten", error);
            } finally {
                setIsLoading(false);
            }
        }
        void loadShoppingList();
    }, [getAccessTokenSilently]);

    const handleIncrease = (id: number) => {
        setItems(prev =>
            prev.map(item =>
                item.id === id ? { ...item, needed_quantity: item.needed_quantity + 1 } : item
            )
        );
    };

    const handleDecrease = (id: number) => {
        setItems(prev =>
            prev.map(item =>
                item.id === id ? { ...item, needed_quantity: Math.max(0, item.needed_quantity - 1) } : item
            )
        );
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
                            />
                        ))}
                    </ul>
                )}
            </section>

            <AddShoppingItemModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
            />
            
        </Layout>
    ) 
}