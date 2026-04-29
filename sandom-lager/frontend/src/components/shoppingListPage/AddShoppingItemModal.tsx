import { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { addToShoppingList, fetchInventory } from "../../api";
import { COUNT_UNITS, INGREDIENT_UNITS, type IngredientUnit } from "../../types";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onItemAdded?: () => void;
}

export default function AddShoppingItemModal({ isOpen, onClose, onItemAdded }: Props) {
    const { getAccessTokenSilently } = useAuth0();
    const [ingredients, setIngredients] = useState<Array<{ id: number; name: string; unit: IngredientUnit }>>([]);
    const [entryMode, setEntryMode] = useState<"existing" | "new">("existing");
    const [selectedIngredient, setSelectedIngredient] = useState<number | null>(null);
    const [newIngredientName, setNewIngredientName] = useState("");
    const [selectedUnit, setSelectedUnit] = useState<IngredientUnit>("stk");
    const [quantityInput, setQuantityInput] = useState("1");
    const [isLoading, setIsLoading] = useState(false);
    const [isHydratingIngredients, setIsHydratingIngredients] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isCountUnit = COUNT_UNITS.includes(selectedUnit as (typeof COUNT_UNITS)[number]);

    const parseQuantity = (value: string): number => Number(value.replace(",", "."));

    const handleOpenModal = async () => {
        if (isHydratingIngredients) return;
        setIsHydratingIngredients(true);

        try {
            const token = await getAccessTokenSilently();
            const inventory = await fetchInventory(token);
            // Extract unique ingredients from inventory
            const uniqueIngredients = Array.from(
                new Map(inventory.map(item => [item.ingredient_id, item])).values()
            ).map(item => ({
                id: item.ingredient_id,
                name: item.ingredient,
                unit: item.unit,
            }));
            setIngredients(uniqueIngredients);
        } catch {
            setError("Kunne ikke laste ingredienser");
        } finally {
            setIsHydratingIngredients(false);
        }
    };

    useEffect(() => {
        if (!isOpen) return;
        void handleOpenModal();
    }, [isOpen]);

    useEffect(() => {
        if (entryMode !== "existing") return;
        const selected = ingredients.find((ing) => ing.id === selectedIngredient);
        if (selected) {
            setSelectedUnit(selected.unit);
        }
    }, [entryMode, selectedIngredient, ingredients]);

    const handleAddItem = async () => {
        const parsedQuantity = parseQuantity(quantityInput);
        const normalizedQuantity = isCountUnit ? Math.round(parsedQuantity) : parsedQuantity;

        if (!Number.isFinite(parsedQuantity) || parsedQuantity <= 0) {
            setError("Skriv inn gyldig mengde");
            return;
        }

        if (entryMode === "existing" && !selectedIngredient) {
            setError("Velg en ingrediens");
            return;
        }

        if (entryMode === "new" && !newIngredientName.trim()) {
            setError("Skriv inn navn på ny ingrediens");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const token = await getAccessTokenSilently();

            if (entryMode === "existing") {
                await addToShoppingList(
                    {
                        ingredient_id: selectedIngredient!,
                        needed_quantity: normalizedQuantity,
                        unit: selectedUnit,
                    },
                    token
                );
            } else {
                await addToShoppingList(
                    {
                        ingredient_name: newIngredientName.trim(),
                        needed_quantity: normalizedQuantity,
                        unit: selectedUnit,
                    },
                    token
                );
            }
            
            // Reset form
            setSelectedIngredient(null);
            setNewIngredientName("");
            setSelectedUnit("stk");
            setQuantityInput("1");
            onItemAdded?.();
            onClose();
        } catch {
            setError("Kunne ikke legge til vare");
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-item-title"
            className="fixed inset-0 flex items-center justify-center z-50"
            style={{ backgroundColor: "rgba(0, 0, 0, 0.35)" }}>

            <div className="w-full max-w-md rounded-xl p-6"
                style={{
                    background: "var(--color-surface)",
                    border: "1px solid var(--color-border)",
                }}>

                <h2
                    id="add-item-title"
                    className="text-xl font-medium"
                    style={{ color: "var(--color-text-primary)" }}>
                    Legg til vare
                </h2>

                {error && (
                    <p className="mt-3 text-sm" style={{ color: "var(--color-error, #d32f2f)" }}>
                        {error}
                    </p>
                )}

                <div className="mt-4 flex flex-col gap-4">
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={() => setEntryMode("existing")}
                            className="py-2 px-3 rounded-md cursor-pointer"
                            style={{
                                background: entryMode === "existing" ? "var(--color-primary)" : "var(--color-secondary-surface)",
                                color: entryMode === "existing" ? "var(--color-on-primary)" : "var(--color-text-primary)",
                                border: "1px solid var(--color-border)",
                            }}>
                            Velg eksisterende
                        </button>
                        <button
                            type="button"
                            onClick={() => setEntryMode("new")}
                            className="py-2 px-3 rounded-md cursor-pointer"
                            style={{
                                background: entryMode === "new" ? "var(--color-primary)" : "var(--color-secondary-surface)",
                                color: entryMode === "new" ? "var(--color-on-primary)" : "var(--color-text-primary)",
                                border: "1px solid var(--color-border)",
                            }}>
                            Skriv ny vare
                        </button>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>
                            Ingrediens
                        </label>
                        {entryMode === "existing" ? (
                            <select
                                value={selectedIngredient || ""}
                                onChange={(e) => setSelectedIngredient(Number(e.target.value))}
                                disabled={isLoading || isHydratingIngredients || ingredients.length === 0}
                                className="rounded-md px-3 py-2"
                                style={{
                                    background: "var(--color-surface)",
                                    border: "1px solid var(--color-border)",
                                    color: "var(--color-text-primary)",
                                }}>
                                <option value="">Velg ingrediens...</option>
                                {ingredients.map(ing => (
                                    <option key={ing.id} value={ing.id}>
                                        {ing.name}
                                    </option>
                                ))}
                            </select>
                        ) : (
                            <input
                                type="text"
                                value={newIngredientName}
                                onChange={(e) => setNewIngredientName(e.target.value)}
                                disabled={isLoading}
                                placeholder="F.eks. Havregryn"
                                className="rounded-md px-3 py-2"
                                style={{
                                    background: "var(--color-surface)",
                                    border: "1px solid var(--color-border)",
                                    color: "var(--color-text-primary)",
                                }}
                            />
                        )}
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>
                            Enhet
                        </label>
                        <select
                            value={selectedUnit}
                            onChange={(e) => setSelectedUnit(e.target.value as IngredientUnit)}
                            disabled={isLoading || entryMode === "existing"}
                            className="rounded-md px-3 py-2"
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
                        {entryMode === "existing" && (
                            <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
                                Enhet er låst for eksisterende ingredienser.
                            </p>
                        )}
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>
                            Mengde
                        </label>
                        <input
                            type="number"
                            min={isCountUnit ? "1" : "0.1"}
                            step={isCountUnit ? "1" : "0.1"}
                            value={quantityInput}
                            onChange={(e) => {
                                const raw = e.target.value.replace(",", ".");

                                if (raw === "") {
                                    setQuantityInput("");
                                    return;
                                }

                                if (isCountUnit) {
                                    if (/^\d+$/.test(raw)) {
                                        setQuantityInput(raw);
                                    }
                                    return;
                                }

                                if (/^\d*\.?\d*$/.test(raw)) {
                                    setQuantityInput(raw);
                                }
                            }}
                            onBlur={() => {
                                if (quantityInput.trim() === "") {
                                    setQuantityInput(isCountUnit ? "1" : "0.1");
                                    return;
                                }

                                const parsed = parseQuantity(quantityInput);
                                if (!Number.isFinite(parsed) || parsed <= 0) {
                                    setQuantityInput(isCountUnit ? "1" : "0.1");
                                    return;
                                }

                                const min = isCountUnit ? 1 : 0.1;
                                const clamped = Math.max(min, parsed);
                                const normalized = isCountUnit ? Math.round(clamped).toString() : clamped.toString();
                                setQuantityInput(normalized);
                            }}
                            disabled={isLoading}
                            className="rounded-md px-3 py-2"
                            style={{
                                background: "var(--color-surface)",
                                border: "1px solid var(--color-border)",
                                color: "var(--color-text-primary)",
                            }}
                        />
                    </div>
                </div>

                <footer className="mt-6 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="py-2 px-4 rounded-md transition-opacity cursor-pointer disabled:cursor-not-allowed"
                        style={{
                            background: "var(--color-secondary-surface)",
                            border: "1px solid var(--color-border)",
                            color: "var(--color-text-primary)",
                            opacity: isLoading ? 0.5 : 1,
                        }}>
                        Avbryt
                    </button>
                    <button
                        onClick={handleAddItem}
                        disabled={isLoading}
                        className="py-2 px-4 rounded-md transition-opacity cursor-pointer disabled:cursor-not-allowed"
                        style={{
                            background: "var(--color-primary)",
                            color: "var(--color-on-primary)",
                            opacity: isLoading ? 0.5 : 1,
                        }}>
                        {isLoading ? "Legger til..." : "Lagre"}
                    </button>
                </footer>
            </div>
        </div>
    )
}