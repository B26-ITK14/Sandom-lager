/*
    * StoragePage.tsx
*/

import Layout from "../components/Layout";
import ProductCard from "../components/storage/ProductCard";
import StorageFilterButton from "../components/storage/StorageFilterButton";
import { Plus, Search } from "lucide-react";
import { useMemo, useState } from "react";

const FILTER_OPTIONS = ["Alle", "Mengde: lite -> mye", "Mengde: mye -> lite"];

const MOCK_PRODUCTS = [
    { name: "Melk", quantity: "10L" },
    { name: "Juice", quantity: "5L" },
    { name: "Tomater", quantity: "2kg" },
    { name: "Epler", quantity: "8kg" },
];

function parseQuantityValue(quantity: string) {
    const parsed = Number.parseFloat(quantity.replace(",", "."));
    return Number.isNaN(parsed) ? 0 : parsed;
}

export default function StoragePage() {
    const [selectedFilter, setSelectedFilter] = useState(FILTER_OPTIONS[0]);

    const filterdProducts = useMemo(() => {
        const products = [...MOCK_PRODUCTS];

        if (selectedFilter === "Mengde: lite -> mye") {
            return products.sort(
                (a, b) => parseQuantityValue(a.quantity) - parseQuantityValue(b.quantity),
            );
        }

        if (selectedFilter === "Mengde: mye -> lite") {
            return products.sort(
                (a, b) => parseQuantityValue(b.quantity) - parseQuantityValue(a.quantity),
            );
        }

        return products;
    }, [selectedFilter]);

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
                    {filterdProducts.map((product, index) => (
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