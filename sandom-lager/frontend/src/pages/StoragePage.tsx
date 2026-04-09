/*
 * StoragePage.tsx
 * Displays the inventory list from the backend API with search and quantity sorting.
 * Handles Auth0 token retrieval and shows loading, empty, and error states for data fetch.
 */

import Layout from "../components/Layout";
import LoadingSpinner from "../components/LoadingSpinner";
import ProductCard from "../components/storage/productCard";
import StorageFilterButton from "../components/storage/StorageFilterBtn";
import { CircleAlert, Plus, X } from "lucide-react";
import SearchInput from "../components/SearchInput";
import { useMemo, useState } from "react";
import { useInventory } from "../hooks/storage/useInventory";
import { useAuth0 } from "@auth0/auth0-react";
import { useUser } from "../context/UserContext";
import { AUTH0_AUDIENCE } from "../config/auth";
import { deleteInventoryItem, updateInventoryQuantity } from "../api/storage";
import type { InventoryItem } from "../types";

const FILTER_OPTIONS = ["Alle", "Mengde: lite -> mye", "Mengde: mye -> lite", "Favoritter"];

type Product = {
    id: number;
    name: string;
    quantity: number;
    unit: InventoryItem["unit"];
};

type Auth0ErrorShape = { error?: string; message?: string };

function isAuth0Error(error: unknown): error is Auth0ErrorShape {
    return typeof error === "object" && error !== null;
}

export default function StoragePage() {
    const { inventory, isLoading, errorMessage, refresh } = useInventory();
    const { role } = useUser();
    const { getAccessTokenSilently, getAccessTokenWithPopup } = useAuth0();

    const [selectedFilter, setSelectedFilter] = useState(FILTER_OPTIONS[0]);
    const [searchQuery, setSearchQuery] = useState("");
    const [editingProductId, setEditingProductId] = useState<number | null>(null);
    const [deletingProductId, setDeletingProductId] = useState<number | null>(null);
    const [notice, setNotice] = useState<string | null>(null);

    const products = useMemo(() => mapInventoryToProducts(inventory), [inventory]);

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
            try {
                const favorites = JSON.parse(localStorage.getItem("favoriteProducts") || "[]") as string[];
                const favoriteProducts = result.filter((product) => favorites.includes(product.name));
                const nonFavoriteProducts = result.filter((product) => !favorites.includes(product.name));
                result = [...favoriteProducts, ...nonFavoriteProducts];
            } catch (err) {
                console.error("Feil ved lesing av favoritter:", err);
            }
        }

        return result;

    }, [products, searchQuery, selectedFilter]);

    const canEditInventory = role === "admin" || role === "manager";
    const canDeleteInventory = role === "admin";

    function showNotice(message: string) {
        setNotice(message);
    }

    async function getInventoryToken(): Promise<string> {
        try {
            return await getAccessTokenSilently({
                authorizationParams: { audience: AUTH0_AUDIENCE },
            });
        } catch (error) {
            if (
                isAuth0Error(error) &&
                (error.error === "consent_required" || error.error === "login_required")
            ) {
                const popupToken = await getAccessTokenWithPopup({
                    authorizationParams: { audience: AUTH0_AUDIENCE },
                });

                if (!popupToken) {
                    throw new Error("Kunne ikke hente tilgang til lagerdata.");
                }

                return popupToken;
            }

            throw error;
        }
    }

    async function handleSaveProductQuantity(product: Product, nextQuantity: number) {
        if (!canEditInventory) {
            showNotice("Du har ikke tilgang til å redigere lageret.");
            return;
        }

        setEditingProductId(product.id);

        try {
            const token = await getInventoryToken();

            await updateInventoryQuantity(product.id, nextQuantity, token);
            refresh();
        } catch (error) {
            showNotice(error instanceof Error ? error.message : "Kunne ikke oppdatere lageret.");
        } finally {
            setEditingProductId(null);
        }
    }

    async function handleDeleteProduct(product: Product) {
        if (!canDeleteInventory) {
            showNotice("Du har ikke tilgang til å slette varer fra lageret.");
            return;
        }

        setDeletingProductId(product.id);

        try {
            const token = await getInventoryToken();
            await deleteInventoryItem(product.id, token);
            refresh();
        } catch (error) {
            showNotice(error instanceof Error ? error.message : "Kunne ikke slette vare fra lageret.");
        } finally {
            setDeletingProductId(null);
        }
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
                <div className="mb-4 flex items-start justify-between gap-4">
                    <section>
                        <h1 className="text-lg font-semibold sm:text-xl" style={{ color: "var(--color-header-text-primary)" }}>
                            Lageroversikt
                        </h1>

                        <p className="mt-1 text-sm" style={{ color: "var(--color-text-secondary)" }}>
                            {filteredProducts.length} {filteredProducts.length === 1 ? "vare" : "varer"} vist
                        </p>
                    </section>

                    <button
                        type="button"
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl cursor-pointer transition-transform hover:-translate-y-0.5"
                        style={{
                            background: "linear-gradient(135deg, var(--color-primary-gradient-from), var(--color-primary-gradient-to))",
                            color: "var(--color-on-primary)",
                        }}
                        aria-label="Legg til produkt"
                    >
                        <Plus size={18} />
                    </button>
                </div>

                <div className="flex items-center gap-3">
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
                                key={`${product.name}-${index}`}
                                className={index < filteredProducts.length - 1 ? "border-b" : ""}
                                style={{ borderColor: "var(--color-border)" }}
                            >
                                <ProductCard
                                    name={product.name}
                                    quantity={product.quantity}
                                    unit={product.unit}
                                    highlighted={false}
                                    onSaveQuantity={(nextQuantity) => {
                                        void handleSaveProductQuantity(product, nextQuantity);
                                    }}
                                    editDisabled={editingProductId === product.id}
                                    onDelete={() => {
                                        void handleDeleteProduct(product);
                                    }}
                                    deleteDisabled={deletingProductId === product.id}
                                    canEdit={canEditInventory}
                                    canDelete={canDeleteInventory}
                                    onNotice={showNotice}
                                />
                            </div>
                        ))}
                    </div>
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