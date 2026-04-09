/*
 * StoragePage.tsx
 * Displays the inventory list from the backend API with search and quantity sorting.
 * Handles Auth0 token retrieval and shows loading, empty, and error states for data fetch.
 */

import Layout from "../components/Layout";
import LoadingSpinner from "../components/LoadingSpinner";
import ProductCard from "../components/storage/productCard";
import StorageFilterButton from "../components/storage/StorageFilterBtn";
import { CircleAlert, Plus, Search, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useInventory } from "../hooks/storage/useInventory";
import { useUser } from "../context/UserContext";
import { deleteInventoryItem, updateInventoryQuantity } from "../api/storage";
import AddInventoryModal from "../components/storage/AddInventoryModal";
import { useApiAccessToken } from "../hooks/useApiAccessToken";
import type { InventoryItem } from "../types";

const FILTER_OPTIONS = ["Alle", "Mengde: lite -> mye", "Mengde: mye -> lite", "Favoritter"];

type Product = {
    id: number;
    name: string;
    quantity: number;
    unit: InventoryItem["unit"];
};

export default function StoragePage() {
    const { inventory, isLoading, errorMessage, refresh } = useInventory();
    const { role } = useUser();
    const { getApiAccessToken } = useApiAccessToken();

    const [selectedFilter, setSelectedFilter] = useState(FILTER_OPTIONS[0]);
    const [searchQuery, setSearchQuery] = useState("");
    const [editingProductId, setEditingProductId] = useState<number | null>(null);
    const [deletingProductId, setDeletingProductId] = useState<number | null>(null);
    const [notice, setNotice] = useState<string | null>(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [favoriteProductIds, setFavoriteProductIds] = useState<number[]>(() => {
        try {
            const parsed = JSON.parse(localStorage.getItem("favoriteProducts") || "[]") as unknown;
            if (!Array.isArray(parsed)) {
                return [];
            }

            return parsed
                .map((value) => Number(value))
                .filter((value) => Number.isInteger(value) && value > 0);
        } catch {
            return [];
        }
    });

    useEffect(() => {
        localStorage.setItem("favoriteProducts", JSON.stringify(favoriteProductIds));
    }, [favoriteProductIds]);

    const products = useMemo(() => mapInventoryToProducts(inventory), [inventory]);

    useEffect(() => {
        setFavoriteProductIds((previous) =>
            previous.filter((favoriteId) => products.some((product) => product.id === favoriteId))
        );
    }, [products]);

    const filteredProducts = useMemo(() => {

        const normalizedQuery = searchQuery.trim().toLowerCase();

        let result = products.filter((product) => {
            if (!normalizedQuery) return true;
            return product.name.toLowerCase().includes(normalizedQuery);
        });

        if (selectedFilter === "Mengde: lite -> mye") {
            result = [...result].sort(
                (a, b) => a.quantity - b.quantity
            );
        }

        if (selectedFilter === "Mengde: mye -> lite") {
            result = [...result].sort(
                (a, b) => b.quantity - a.quantity
            );
        }

        if (selectedFilter === "Favoritter") {
            const favoriteProducts = result.filter((product) => favoriteProductIds.includes(product.id));
            const nonFavoriteProducts = result.filter((product) => !favoriteProductIds.includes(product.id));
            result = [...favoriteProducts, ...nonFavoriteProducts];
        }

        return result;

    }, [favoriteProductIds, products, searchQuery, selectedFilter]);

    const canEditInventory = role === "admin" || role === "manager";
    const canDeleteInventory = role === "admin";

    function showNotice(message: string) {
        setNotice(message);
    }

    function toggleFavorite(productId: number) {
        setFavoriteProductIds((previous) => {
            if (previous.includes(productId)) {
                return previous.filter((id) => id !== productId);
            }

            return [...previous, productId];
        });
    }

    async function handleSaveProductQuantity(product: Product, nextQuantity: number): Promise<boolean> {
        if (!canEditInventory) {
            showNotice("Du har ikke tilgang til å redigere lageret.");
            return false;
        }

        setEditingProductId(product.id);

        try {
            const token = await getApiAccessToken();

            await updateInventoryQuantity(product.id, nextQuantity, token);
            refresh();
            return true;
        } catch (error) {
            showNotice(error instanceof Error ? error.message : "Kunne ikke oppdatere lageret.");
            return false;
        } finally {
            setEditingProductId(null);
        }
    }

    async function handleDeleteProduct(product: Product): Promise<boolean> {
        if (!canDeleteInventory) {
            showNotice("Du har ikke tilgang til å slette varer fra lageret.");
            return false;
        }

        setDeletingProductId(product.id);

        try {
            const token = await getApiAccessToken();
            await deleteInventoryItem(product.id, token);
            refresh();
            return true;
        } catch (error) {
            showNotice(error instanceof Error ? error.message : "Kunne ikke slette vare fra lageret.");
            return false;
        } finally {
            setDeletingProductId(null);
        }
    }

    function handleInventoryCreated() {
        setShowAddModal(false);
        refresh();
    }

    if (isLoading) {
        return <LoadingSpinner />;
    }

    return (
        <Layout>
            <section className="mx-auto mt-4 max-w-lg">

                <header className="mb-6 flex items-center gap-3">

                    <form
                        role="search"
                        onSubmit={(event) => {
                            event.preventDefault();
                        }}
                        className="flex h-12 flex-1 items-center gap-2 rounded-2xl border px-4"
                        style={{ borderColor: "#c7c8cb", backgroundColor: "#f7f7f8" }}
                    >
                        <Search size={20} color="#b8b9bd" />

                        <input
                            type="search"
                            placeholder="Søk på lageret"
                            className="w-full border-none bg-transparent text-base outline-none"
                            style={{ color: "#6f7278" }}
                            value={searchQuery}
                            onChange={(event) => setSearchQuery(event.target.value)}
                            aria-label="Søk i lager"
                        />
                    </form>

                    <StorageFilterButton
                        options={FILTER_OPTIONS}
                        selectedFilter={selectedFilter}
                        onSelectFilter={setSelectedFilter}
                    />

                    {canEditInventory ? (
                        <button
                            type="button"
                            className="grid h-12 w-12 place-items-center rounded-full"
                            style={{ backgroundColor: "#0a9a82", color: "#ffffff" }}
                            aria-label="Legg til produkt"
                            onClick={() => {
                                setShowAddModal(true);
                            }}
                        >
                            <Plus size={24} />
                        </button>
                    ) : null}

                </header>

                <section>
                    {notice ? (
                        <article className="mb-4 rounded-xl border px-4 py-3" style={{ borderColor: "#d4d6db", backgroundColor: "#f8fafc" }} role="status" aria-live="polite">
                            <section className="flex items-start gap-3">
                                <CircleAlert size={18} className="mt-0.5 shrink-0" style={{ color: "#5f6470" }} />

                                <p className="text-sm font-semibold" style={{ color: "#253042" }}>
                                    {notice}
                                </p>

                                <button
                                    type="button"
                                    aria-label="Lukk melding"
                                    className="ml-auto shrink-0 rounded-md p-1 transition-opacity hover:opacity-75"
                                    style={{ color: "#5f6470" }}
                                    onClick={() => setNotice(null)}
                                >
                                    <X size={16} />
                                </button>
                            </section>
                        </article>
                    ) : null}

                    {errorMessage ? (
                        <p className="rounded-2xl border px-4 py-5 text-sm" style={{ borderColor: "#ee9da1", color: "#7d2126", backgroundColor: "#fff3f3" }}>
                            {errorMessage}
                        </p>
                    ) : null}

                    {!errorMessage && filteredProducts.length === 0 ? (
                        <p className="rounded-2xl border px-4 py-5 text-sm" style={{ borderColor: "#c7c8cb", color: "#6f7278", backgroundColor: "#f7f7f8" }}>
                            Ingen varer funnet i lageret.
                        </p>
                    ) : null}

                    <ul className="list-none p-0 m-0">
                        {filteredProducts.map((product, index) => (
                            <li key={product.id}>
                                <ProductCard
                                    id={product.id}
                                    name={product.name}
                                    quantity={product.quantity}
                                    unit={product.unit}
                                    highlighted={index % 2 === 0}
                                    onSaveQuantity={(nextQuantity) => handleSaveProductQuantity(product, nextQuantity)}
                                    editDisabled={editingProductId === product.id}
                                    onDelete={() => handleDeleteProduct(product)}
                                    deleteDisabled={deletingProductId === product.id}
                                    canEdit={canEditInventory}
                                    canDelete={canDeleteInventory}
                                    isFavorite={favoriteProductIds.includes(product.id)}
                                    onToggleFavorite={toggleFavorite}
                                    onNotice={showNotice}
                                />
                            </li>
                        ))}
                    </ul>
                </section>

                {showAddModal ? (
                    <AddInventoryModal
                        onClose={() => setShowAddModal(false)}
                        onCreated={handleInventoryCreated}
                    />
                ) : null}

            </section>
        </Layout>
    );
}

function mapInventoryToProducts(inventory: InventoryItem[]): Product[] {
    return inventory.map((item) => ({
        id: item.id,
        name: item.ingredient,
        quantity: item.quantity,
        unit: item.unit,
    }));
}