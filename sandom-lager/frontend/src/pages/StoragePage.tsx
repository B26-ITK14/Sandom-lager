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
import { useMemo, useState } from "react";
import { useInventory } from "../hooks/storage/useInventory";
import { useAuth0 } from "@auth0/auth0-react";
import { useUser } from "../context/UserContext";
import { AUTH0_AUDIENCE } from "../config/auth";
import { deleteInventoryItem, updateInventoryQuantity } from "../api/storage";
import type { InventoryItem } from "../types";

const FILTER_OPTIONS = ["Alle", "Mengde: lite -> mye", "Mengde: mye -> lite"];

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

    return (
        <Layout>
            <section className="mx-auto mt-4 max-w-lg">

                <header className="mb-6 flex items-center gap-3">

                    <div
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
                        />
                    </div>

                    <StorageFilterButton
                        options={FILTER_OPTIONS}
                        selectedFilter={selectedFilter}
                        onSelectFilter={setSelectedFilter}
                    />

                    <button
                        type="button"
                        className="grid h-12 w-12 place-items-center rounded-full"
                        style={{ backgroundColor: "#0a9a82", color: "#ffffff" }}
                        aria-label="Legg til produkt"
                    >
                        <Plus size={24} />
                    </button>

                </header>

                <section>
                    {notice ? (
                        <article className="mb-4 rounded-xl border px-4 py-3" style={{ borderColor: "#d4d6db", backgroundColor: "#f8fafc" }} role="status" aria-live="polite">
                            <div className="flex items-start gap-3">
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
                            </div>
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

                    {filteredProducts.map((product, index) => (
                        <ProductCard
                            key={`${product.name}-${index}`}
                            name={product.name}
                            quantity={product.quantity}
                            unit={product.unit}
                            highlighted={index % 2 === 0}
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
                    ))}
                </section>

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