type ProductCardProps = {
    name: string;
    quantity: string;
    highlighted?: boolean;
};

import { Pencil, Star, Trash2 } from "lucide-react";

export default function ProductCard({ name, quantity, highlighted = false }: ProductCardProps) {
    return (
        <article
            className="flex items-center justify-between rounded-none px-6 py-8"
            style={{backgroundColor: highlighted ? "#e2e5ea" : "#eceef2",}}
        >
            <section>
                <h2 className="text-lg leading-none font-medium" style={{ color: "#000" }}>
                    {name}
                </h2>
                <p className="mt-2 text-md leading-none font-semibold" style={{ color: "#5f6368" }}>
                    {quantity}
                </p>
            </section>

            <section className="flex items-center gap-3">
                <button
                    type="button"
                    className="grid h-11 w-11 place-items-center rounded-full"
                    style={{ backgroundColor: "#d5d7db", color: "#000" }}
                    aria-label={`Marker ${name} som favoritt`}
                >
                    <Star size={20} />
                </button>
                <button
                    type="button"
                    className="grid h-11 w-11 place-items-center rounded-full"
                    style={{ backgroundColor: "#f2cf8e", color: "#000" }}
                    aria-label={`Rediger ${name}`}
                >
                    <Pencil size={20} />
                </button>
                <button
                    type="button"
                    className="grid h-11 w-11 place-items-center rounded-full"
                    style={{ backgroundColor: "#ee9da1", color: "#000" }}
                    aria-label={`Slett ${name}`}
                >
                    <Trash2 size={20} />
                </button>
            </section>
        </article>
    );
}