/*
 * StoragePage.tsx
 * Displays the inventory list from the backend API with search and quantity sorting.
 * Handles Auth0 token retrieval and shows loading, empty, and error states for data fetch.
 * Allows users with appropriate roles to edit quantities and delete inventory items, with feedback messages for actions.
 * Author: Ida Tollaksen (main), Emil Berglund (refactoring and styling)
 */

import { useEffect, useMemo, useState } from "react";
import { CircleAlert, Plus, X } from "lucide-react";
import Layout from "../components/Layout";
import LoadingSpinner from "../components/LoadingSpinner";
import SearchInput from "../components/SearchInput";
import ProductCard from "../components/storage/productCard";
import StorageFilterButton from "../components/storage/StorageFilterBtn";
import AddInventoryModal from "../components/storage/AddInventoryModal";
import { deleteInventoryItem, updateInventoryQuantity } from "../api/storage";
import { useUser } from "../context/UserContext";
import { useApiAccessToken } from "../hooks/useApiAccessToken";
import { useInventory } from "../hooks/storage/useInventory";
import { usePageMeta } from "../hooks";
import type { InventoryItem } from "../types";

const FILTER_OPTIONS = ["Alle", "Mengde: lite -> mye", "Mengde: mye -> lite", "Favoritter"];

type Product = {
    id: number;
    name: string;
    quantity: number;
    unit: InventoryItem["unit"];
};

export default function StoragePage() {
    usePageMeta({
        title: "Storage - Sandom Lager",
        description: "Manage your inventory with advanced search, filtering, and quantity tracking",
        keywords: "storage, inventory, products, quantity, warehouse",
        ogTitle: "Storage - Sandom Lager",
        ogDescription: "Manage your inventory items",
    });
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
            if (!normalizedQuery) {
                return true;
            }

            return product.name.toLowerCase().includes(normalizedQuery);
        });

        if (selectedFilter === "Mengde: lite -> mye") {
            result = [...result].sort((a, b) => a.quantity - b.quantity);
        }

        if (selectedFilter === "Mengde: mye -> lite") {
            result = [...result].sort((a, b) => b.quantity - a.quantity);
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

    const hasProducts = !errorMessage && filteredProducts.length > 0;

    return (
        <Layout>
            <header
                className="mb-6 rounded-3xl border p-4 sm:p-5"
                style={{
                    backgroundColor: "var(--color-surface)",
                    borderColor: "var(--color-border)",
                    boxShadow: "0 16px 36px -28px rgba(15, 23, 42, 0.8)",
                }}
            >
                <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
                    <section>
                        <h1 className="text-lg font-semibold sm:text-xl" style={{ color: "var(--color-header-text-primary)" }}>
                            Lageroversikt
                        </h1>

                        <p className="mt-1 text-sm" style={{ color: "var(--color-text-secondary)" }}>
                            {filteredProducts.length} {filteredProducts.length === 1 ? "vare" : "varer"} vist
                        </p>
                    </section>

                    {canEditInventory ? (
                        <button
                            type="button"
                            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl cursor-pointer transition-transform hover:-translate-y-0.5"
                            style={{
                                background: "linear-gradient(135deg, var(--color-primary-gradient-from), var(--color-primary-gradient-to))",
                                color: "var(--color-on-primary)",
                            }}
                            aria-label="Legg til produkt"
                            onClick={() => {
                                setShowAddModal(true);
                            }}
                        >
                            <Plus size={18} />
                        </button>
                    ) : null}
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <SearchInput
                        id="storage-search"
                        value={searchQuery}
                        onChange={setSearchQuery}
                        placeholder="Søk på lageret"
                    />

                    <StorageFilterButton
                        options={FILTER_OPTIONS}
                        selectedFilter={selectedFilter}
                        onSelectFilter={setSelectedFilter}
                    />
                </div>
            </header>

            <section>
                {notice ? (
                    <article
                        className="mb-4 rounded-2xl border px-4 py-3"
                        style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-secondary-surface)" }}
                        role="status"
                        aria-live="polite"
                    >
                        <div className="flex items-start gap-3">
                            <CircleAlert size={18} className="mt-0.5 shrink-0" style={{ color: "var(--color-text-secondary)" }} />
                            <p className="text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>
                                {notice}
                            </p>
                            <button
                                type="button"
                                aria-label="Lukk melding"
                                className="ml-auto shrink-0 rounded-md p-1 cursor-pointer transition-opacity hover:opacity-75"
                                style={{ color: "var(--color-text-secondary)" }}
                                onClick={() => setNotice(null)}
                            >
                                <X size={16} />
                            </button>
                        </div>
                    </article>
                ) : null}

                {errorMessage ? (
                    <p
                        className="rounded-2xl border px-4 py-5 text-sm"
                        style={{
                            borderColor: "var(--color-danger)",
                            color: "var(--color-danger)",
                            backgroundColor: "var(--color-surface)",
                        }}
                    >
                        {errorMessage}
                    </p>
                ) : null}

                {!errorMessage && filteredProducts.length === 0 ? (
                    <p
                        className="rounded-2xl border px-4 py-5 text-sm"
                        style={{
                            borderColor: "var(--color-border)",
                            color: "var(--color-text-secondary)",
                            backgroundColor: "var(--color-secondary-surface)",
                        }}
                    >
                        Ingen varer funnet i lageret.
                    </p>
                ) : null}

                {hasProducts ? (
                    <div
                        className="overflow-hidden rounded-2xl border"
                        style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)" }}
                    >
                        {filteredProducts.map((product, index) => (
                            <div
                                key={product.id}
                                className={index < filteredProducts.length - 1 ? "border-b" : ""}
                                style={{ borderColor: "var(--color-border)" }}
                            >
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
                            </div>
                        ))}
                    </div>
                ) : null}
            </section>

            {showAddModal ? (
                <AddInventoryModal
                    onClose={() => setShowAddModal(false)}
                    onCreated={handleInventoryCreated}
                />
            ) : null}
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