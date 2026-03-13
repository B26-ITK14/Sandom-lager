/*
    * StoragePage.tsx
*/

import Layout from "../components/Layout";
import ProductCard from "../components/storage/productCard";
import { Plus, Search, SlidersHorizontal } from "lucide-react";

const MOCK_PRODUCTS = [
    { name: "Melk", quantity: "10L" },
    { name: "Juice", quantity: "5L" },
];

export default function StoragePage() {
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

                    <button
                        type="button"
                        className="grid h-12 w-12 place-items-center rounded-2xl"
                        style={{ backgroundColor: "#5d6cb5", color: "#ffffff" }}
                        aria-label="Filtrer produkter"
                    >
                        <SlidersHorizontal size={22} />
                    </button>

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
                    {MOCK_PRODUCTS.map((product, index) => (
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