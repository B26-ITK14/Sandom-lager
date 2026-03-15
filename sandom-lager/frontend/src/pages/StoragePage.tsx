/*
 * StoragePage.tsx
 * Displays the inventory list from the backend API with search and quantity sorting.
 * Handles Auth0 token retrieval and shows loading, empty, and error states for data fetch.
 */

import Layout from "../components/Layout";
import LoadingSpinner from "../components/LoadingSpinner";
import ProductCard from "../components/storage/productCard";
import StorageFilterButton from "../components/storage/StorageFilterButton";
import { fetchInventory } from "../api/storage";
import { AUTH0_AUDIENCE } from "../config/auth";
import { Plus, Search } from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import type { InventoryItem } from "../types";

const FILTER_OPTIONS = ["Alle", "Mengde: lite -> mye", "Mengde: mye -> lite"];

function parseQuantityValue(quantity: string) {
    const parsed = Number.parseFloat(quantity.replace(",", "."));
    return Number.isNaN(parsed) ? 0 : parsed;
}

type Product = {
    name: string;
    quantity: string;
};

function isAuth0Error(error: unknown): error is { error?: string; message?: string } {
    return typeof error === "object" && error !== null;
}

export default function StoragePage() {

    const {
        getAccessTokenSilently,
        getAccessTokenWithPopup,
        isAuthenticated,
        isLoading: authLoading,
    } = useAuth0();

    const [products, setProducts] = useState<Product[]>([]);
    const [selectedFilter, setSelectedFilter] = useState(FILTER_OPTIONS[0]);
    const [searchQuery, setSearchQuery] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        if (authLoading) {
            return;
        }

        if (!isAuthenticated) {
            setProducts([]);
            setErrorMessage(null);
            setIsLoading(false);
            return;
        }

        let cancelled = false;

        async function loadInventory() {
            try {
                setIsLoading(true);
                setErrorMessage(null);

                let token: string;

                try {
                    token = await getAccessTokenSilently({
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

                        token = popupToken;
                    } else {
                        throw error;
                    }
                }

                const inventory = await fetchInventory(token);

                if (cancelled) {
                    return;
                }

                setProducts(mapInventoryToProducts(inventory));

            } catch (error) {
                console.error("Feil ved innhenting av lagerdata:", error);

                if (cancelled) {
                    return;
                }

                setProducts([]);
                setErrorMessage(
                    error instanceof Error
                        ? error.message
                        : "Kunne ikke hente lagerdata."
                );
            } finally {
                if (!cancelled) {
                    setIsLoading(false);
                }
            }
        }

        loadInventory();

        return () => {
            cancelled = true;
        };
    }, [authLoading, getAccessTokenSilently, getAccessTokenWithPopup, isAuthenticated]);

    const filteredProducts = useMemo(() => {

        const normalizedQuery = searchQuery.trim().toLowerCase();

        let result = products.filter((product) => {
            if (!normalizedQuery) return true;
            return product.name.toLowerCase().includes(normalizedQuery);
        });

        if (selectedFilter === "Mengde: lite -> mye") {
            result = [...result].sort(
                (a, b) => parseQuantityValue(a.quantity) - parseQuantityValue(b.quantity)
            );
        }

        if (selectedFilter === "Mengde: mye -> lite") {
            result = [...result].sort(
                (a, b) => parseQuantityValue(b.quantity) - parseQuantityValue(a.quantity)
            );
        }

        return result;

    }, [products, searchQuery, selectedFilter]);

    if (authLoading || isLoading) {
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
                            highlighted={index % 2 === 0}
                        />
                    ))}
                </section>

            </section>
        </Layout>
    );
}

function mapInventoryToProducts(inventory: InventoryItem[]): Product[] {
    return inventory.map((item) => ({
        name: item.ingredient,
        quantity: `${item.quantity} ${item.unit}`,
    }));
}