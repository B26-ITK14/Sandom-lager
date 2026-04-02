import { useState } from "react";
import type { ShoppingListItem } from "../../types";

interface Props {
    item: ShoppingListItem;
    onIncrease: (id: number) => Promise<void>;
    onDecrease: (id: number) => Promise<void>;
    onDelete: (id: number) => Promise<void>;
}

export default function ShoppingListItem({ item, onIncrease, onDecrease, onDelete }: Props) {
    const [isLoading, setIsLoading] = useState(false);

    const handleIncrease = async () => {
        setIsLoading(true);
        try {
            await onIncrease(item.id);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDecrease = async () => {
        setIsLoading(true);
        try {
            await onDecrease(item.id);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        setIsLoading(true);
        try {
            await onDelete(item.id);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <li
        className="flex items-center justify-between rounded-xl p-4"
        style={{
             background: "var(--color-surface)",
             border: "1px solid var(--color-border)",
             opacity: isLoading ? 0.5 : 1,
             }}>

            <dl className="flex flex-col gap-4 m-0">
                <dt className="font-semibold" style={{
                    color: "var(--color-text-primary)"}}>
                    {item.ingredient}
                </dt>
                <dd className="m-0 text-sm"
                    style={{ color: "var(--color-text-secondary)" }}>
                    {item.needed_quantity} {item.unit}
                </dd>
            </dl>

            <menu className="flex items-center gap-3 list-none m-0 p-0">
                <button
                    onClick={handleDecrease}
                    disabled={isLoading}
                    className="h-9 w-9 rounded-full text-lg transition-colors disabled:opacity-50"
                    style={{
                        background: "var(--color-secondary-surface)",
                        border: "1px solid var(--color-border)",
                        color: "var(--color-text-primary)",
                    }}
                    aria-label={`Reduser mengde for ${item.ingredient}`}>
                    −
                </button>

                <button
                    onClick={handleIncrease}
                    disabled={isLoading}
                    className="h-9 w-9 rounded-full text-lg transition-colors disabled:opacity-50"
                    style={{
                        background: "var(--color-primary)",
                        color: "var(--color-on-primary)",
                    }}
                    aria-label={`Øk mengde for ${item.ingredient}`}>
                    +
                </button>

                <button
                    onClick={handleDelete}
                    disabled={isLoading}
                    className="h-9 w-9 rounded-full text-lg transition-colors disabled:opacity-50"
                    style={{
                        background: "var(--color-secondary-surface)",
                        border: "1px solid var(--color-border)",
                        color: "var(--color-text-primary)",
                    }}
                    aria-label={`Slett ${item.ingredient} fra handlelisten`}>
                    ×
                </button>
            </menu>
        </li>
    );
}