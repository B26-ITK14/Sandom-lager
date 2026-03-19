/*
 * StoragePage.tsx
 * Displays the inventory list from the backend API with search and quantity sorting.
 * Handles Auth0 token retrieval and shows loading, empty, and error states for data fetch.
 */

import Layout from "../components/Layout";
import LoadingSpinner from "../components/LoadingSpinner";
import ProductCard from "../components/storage/productCard";
import StorageFilterButton from "../components/storage/StorageFilterButton";
import { Plus, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { useInventory } from "../hooks/storage/useInventory";
import type { InventoryItem } from "../types";

const FILTER_OPTIONS = ["Alle", "Mengde: lite -> mye", "Mengde: mye -> lite"];

type Product = {
    name: string;
    quantity: number;
    unit: InventoryItem["unit"];
};

export default function StoragePage() {
    const { inventory, isLoading, errorMessage } = useInventory();

    const [selectedFilter, setSelectedFilter] = useState(FILTER_OPTIONS[0]);
    const [searchQuery, setSearchQuery] = useState("");

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
                            quantity={`${product.quantity} ${product.unit}`}
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
        quantity: item.quantity,
        unit: item.unit,
    }));
}