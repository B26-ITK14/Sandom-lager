import { useState } from "react";
import { INGREDIENT_UNITS, type IngredientUnit } from "../../types";
import type { ShoppingListItem } from "../../types";

interface Props {
    item: ShoppingListItem;
    compact?: boolean;
    onIncrease: (id: number) => Promise<void>;
    onDecrease: (id: number) => Promise<void>;
    onDelete: (id: number) => Promise<void>;
    onUpdateUnit: (id: number, unit: IngredientUnit) => Promise<void>;
    onSetQuantity: (id: number, nextQuantity: number) => Promise<void>;
}

export default function ShoppingListItem({ item, compact, onIncrease, onDecrease, onDelete, onUpdateUnit, onSetQuantity }: Props) {
    const [isLoading, setIsLoading] = useState(false);
    const [isUnitEditing, setIsUnitEditing] = useState(false);
    const [isQuantityEditing, setIsQuantityEditing] = useState(false);
    const [quantityInput, setQuantityInput] = useState("");

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

    const openQuantityEditor = () => {
        setQuantityInput(String(item.needed_quantity));
        setIsQuantityEditing(true);
    };

    const commitQuantity = async () => {
        const parsed = Number(quantityInput.replace(",", "."));

        if (!Number.isFinite(parsed) || parsed <= 0) {
            setIsQuantityEditing(false);
            return;
        }

        if (parsed === Number(item.needed_quantity)) {
            setIsQuantityEditing(false);
            return;
        }

        setIsLoading(true);
        try {
            await onSetQuantity(item.id, parsed);
        } finally {
            setIsLoading(false);
            setIsQuantityEditing(false);
        }
    };

    if (compact) {
        return (
            <li
                className="flex items-center justify-between px-3 py-2"
                style={{
                    background: "var(--color-surface)",
                    borderBottom: "1px solid var(--color-border)",
                    opacity: isLoading ? 0.5 : 1,
                }}>
                <span className="text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>
                    {item.ingredient}
                </span>
                <span className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                    {formatQuantity(item.needed_quantity)} {item.unit}
                </span>
            </li>
        );
    }

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
                    {isQuantityEditing ? (
                        <input
                            type="number"
                            min="0.1"
                            step="0.1"
                            autoFocus
                            value={quantityInput}
                            disabled={isLoading}
                            onChange={(e) => setQuantityInput(e.target.value)}
                            onBlur={() => void commitQuantity()}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    e.preventDefault();
                                    void commitQuantity();
                                }
                                if (e.key === "Escape") {
                                    e.preventDefault();
                                    setIsQuantityEditing(false);
                                }
                            }}
                            className="w-20 rounded-md px-2 py-1"
                            style={{
                                background: "var(--color-surface)",
                                border: "1px solid var(--color-border)",
                                color: "var(--color-text-primary)",
                            }}
                        />
                    ) : (
                        <button
                            type="button"
                            disabled={isLoading}
                            className="underline-offset-2 hover:underline cursor-pointer disabled:cursor-not-allowed"
                            style={{ color: "var(--color-text-primary)" }}
                            onClick={openQuantityEditor}>
                            {formatQuantity(item.needed_quantity)}
                        </button>
                    )}{" "}
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
                            className="underline-offset-2 hover:underline cursor-pointer disabled:cursor-not-allowed"
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
                    className="h-9 w-9 rounded-full text-lg transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
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
                    className="h-9 w-9 rounded-full text-lg transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
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
                    className="h-9 w-9 rounded-full text-lg transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
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