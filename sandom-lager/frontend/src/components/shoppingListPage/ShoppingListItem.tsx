/*
    * ShoppingListItem.tsx
    * A component that displays a single item in the shopping list, allowing users to increase, decrease, or delete the item. It also provides options to edit the unit and quantity of the item.
    * The component handles loading states and displays appropriate messages when there are no items to show.
    * Author: Andreas Skaarberg
*/

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
    const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

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
            setIsConfirmingDelete(false);
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
                    color: "var(--color-text-primary)"
                }}>
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
                        background: "var(--color-warning, #f59e0b)",
                        color: "#ffffff",
                    }}
                    aria-label={`Reduser mengde for ${item.ingredient}`}>
                    −
                </button>

                <button
                    onClick={handleIncrease}
                    disabled={isLoading}
                    className="h-9 w-9 rounded-full text-lg transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                    style={{
                        background: "var(--color-success, #10b981)",
                        color: "#ffffff",
                    }}
                    aria-label={`Øk mengde for ${item.ingredient}`}>
                    +
                </button>

                <button
                    onClick={() => setIsConfirmingDelete(true)}
                    disabled={isLoading}
                    className="h-9 w-9 rounded-full text-lg transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                    style={{
                        background: "var(--color-danger, #dc2626)",
                        color: "#ffffff",
                    }}
                    aria-label={`Slett ${item.ingredient} fra handlelisten`}>
                    ×
                </button>
            </menu>

            {isConfirmingDelete && (
                <div
                    className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 p-4 sm:items-center"
                    role="presentation"
                    onClick={() => {
                        if (!isLoading) {
                            setIsConfirmingDelete(false);
                        }
                    }}
                >
                    <div
                        className="w-full max-w-sm rounded-2xl border p-4 shadow-lg"
                        role="dialog"
                        aria-modal="true"
                        aria-label={`Bekreft sletting av ${item.ingredient}`}
                        style={{
                            borderColor: "var(--color-border)",
                            backgroundColor: "var(--color-surface)",
                        }}
                        onClick={(event) => {
                            event.stopPropagation();
                        }}
                    >
                        <p className="text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>
                            Slett {item.ingredient} fra handlelisten?
                        </p>
                        <p className="mt-1 text-xs" style={{ color: "var(--color-text-secondary)" }}>
                            Denne handlingen kan ikke angres.
                        </p>

                        <div className="mt-4 flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => setIsConfirmingDelete(false)}
                                disabled={isLoading}
                                className="rounded-md border px-3 py-1.5 text-xs font-semibold cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                                style={{
                                    borderColor: "var(--color-border)",
                                    color: "var(--color-text-primary)",
                                    backgroundColor: "var(--color-secondary-surface)",
                                }}
                            >
                                Avbryt
                            </button>
                            <button
                                type="button"
                                onClick={() => void handleDelete()}
                                disabled={isLoading}
                                className="rounded-md px-3 py-1.5 text-xs font-semibold cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                                style={{
                                    backgroundColor: "var(--color-danger, #dc2626)",
                                    color: "#ffffff",
                                }}
                            >
                                {isLoading ? "Sletter..." : "Slett vare"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </li>
    );
}