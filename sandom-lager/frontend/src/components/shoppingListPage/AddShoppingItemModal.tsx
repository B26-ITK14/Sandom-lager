import { useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { addToShoppingList, fetchInventory } from "../../api";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onItemAdded?: () => void;
}

export default function AddShoppingItemModal({ isOpen, onClose, onItemAdded }: Props) {
    const { getAccessTokenSilently } = useAuth0();
    const [ingredients, setIngredients] = useState<Array<{ id: number; name: string; unit: string }>>([]);
    const [selectedIngredient, setSelectedIngredient] = useState<number | null>(null);
    const [quantity, setQuantity] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleOpenModal = async () => {
        if (isLoading) return;
        try {
            const token = await getAccessTokenSilently();
            const inventory = await fetchInventory(token);
            // Extract unique ingredients from inventory
            const uniqueIngredients = Array.from(
                new Map(inventory.map(item => [item.id, item])).values()
            ).map(item => ({
                id: item.id,
                name: item.ingredient,
                unit: item.unit,
            }));
            setIngredients(uniqueIngredients);
        } catch (err) {
            console.error("Failed to load ingredients:", err);
            setError("Kunne ikke laste ingredienser");
        }
    };

    const handleAddItem = async () => {
        if (!selectedIngredient || quantity <= 0) {
            setError("Velg en ingrediens og skriv inn mengde");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const token = await getAccessTokenSilently();
            await addToShoppingList(selectedIngredient, quantity, token);
            
            // Reset form
            setSelectedIngredient(null);
            setQuantity(1);
            onItemAdded?.();
            onClose();
        } catch (err) {
            console.error("Failed to add item:", err);
            setError("Kunne ikke legge til vare");
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    // Load ingredients when modal opens
    if (ingredients.length === 0) {
        handleOpenModal();
    }

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
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>
                            Ingrediens
                        </label>
                        <select
                            value={selectedIngredient || ""}
                            onChange={(e) => setSelectedIngredient(Number(e.target.value))}
                            disabled={isLoading || ingredients.length === 0}
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
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>
                            Mengde
                        </label>
                        <input
                            type="number"
                            min="1"
                            value={quantity}
                            onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
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
                        className="py-2 px-4 rounded-md transition-opacity"
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
                        disabled={isLoading || !selectedIngredient}
                        className="py-2 px-4 rounded-md transition-opacity"
                        style={{
                            background: "var(--color-primary)",
                            color: "var(--color-on-primary)",
                            opacity: (isLoading || !selectedIngredient) ? 0.5 : 1,
                        }}>
                        {isLoading ? "Legger til..." : "Lagre"}
                    </button>
                </footer>
            </div>
        </div>
    )
}