import { useState } from "react";
import { INGREDIENT_UNITS, type IngredientUnit } from "../../types";
import type { ShoppingListItem } from "../../types";

interface Props {
    item: ShoppingListItem;
    onIncrease: (id: number) => Promise<void>;
    onDecrease: (id: number) => Promise<void>;
    onDelete: (id: number) => Promise<void>;
    onUpdateUnit: (id: number, unit: IngredientUnit) => Promise<void>;
}

export default function ShoppingListItem({ item, onIncrease, onDecrease, onDelete, onUpdateUnit }: Props) {
    const [isLoading, setIsLoading] = useState(false);
    const [isUnitEditing, setIsUnitEditing] = useState(false);

    const formatQuantity = (value: number) => {
        return new Intl.NumberFormat("nb-NO", { maximumFractionDigits: 2 }).format(value);
    };

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

    const handleUnitChange = async (nextUnit: IngredientUnit) => {
        setIsLoading(true);
        try {
            await onUpdateUnit(item.id, nextUnit);
            setIsUnitEditing(false);
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
                    {formatQuantity(item.needed_quantity)}{" "}
                    {isUnitEditing ? (
                        <select
                            value={item.unit}
                            disabled={isLoading}
                            onChange={(e) => void handleUnitChange(e.target.value as IngredientUnit)}
                            className="rounded-md px-2 py-1"
                            style={{
                                background: "var(--color-surface)",
                                border: "1px solid var(--color-border)",
                                color: "var(--color-text-primary)",
                            }}>
                            {INGREDIENT_UNITS.map((unit) => (
                                <option key={unit} value={unit}>
                                    {unit}
                                </option>
                            ))}
                        </select>
                    ) : (
                        <button
                            type="button"
                            disabled={isLoading}
                            className="underline-offset-2 hover:underline"
                            style={{ color: "var(--color-text-primary)" }}
                            onClick={() => setIsUnitEditing(true)}>
                            {item.unit}
                        </button>
                    )}
                </dd>
                <dd className="m-0 text-xs" style={{ color: "var(--color-text-secondary)" }}>
                    På lager: {formatQuantity(item.stock_quantity)} {item.unit}
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