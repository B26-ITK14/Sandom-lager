/* AddInventoryModal.tsx 
* A modal component for adding a new inventory item to the storage.
* Fetches necessary data (ingredients, locations, existing inventory) on mount to populate the form.
* Validates input and submits the new inventory item to the backend API.
* Displays loading states and error messages as needed.
*/

import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { createInventory, fetchInventory } from "../../api/storage";
import { fetchIngredients } from "../../api/recipes";
import { fetchLocations } from "../../api/userLocations";
import { useApiAccessToken } from "../../hooks/useApiAccessToken";
import type { Ingredient, InventoryItem } from "../../types";

type LocationOption = {
    id: number;
    name: string;
};

type AddInventoryModalProps = {
    onClose: () => void;
    onCreated: () => void;
};

export default function AddInventoryModal({ onClose, onCreated }: AddInventoryModalProps) {
    const { getApiAccessToken } = useApiAccessToken();

    const [ingredients, setIngredients] = useState<Ingredient[]>([]);
    const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
    const [locations, setLocations] = useState<LocationOption[]>([]);
    const [ingredientId, setIngredientId] = useState("");
    const [locationId, setLocationId] = useState("");
    const [quantity, setQuantity] = useState("");
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        async function loadData() {
            setLoading(true);
            setError(null);

            try {
                const token = await getApiAccessToken();
                const [ingredientsData, locationsData, inventoryData] = await Promise.all([
                    fetchIngredients(token),
                    fetchLocations(token) as Promise<LocationOption[]>,
                    fetchInventory(token),
                ]);

                if (cancelled) {
                    return;
                }

                setIngredients(ingredientsData);
                setLocations(locationsData);
                setInventoryItems(inventoryData);

                if (ingredientsData.length > 0) {
                    setIngredientId(String(ingredientsData[0].id));
                }

                if (locationsData.length > 0) {
                    setLocationId(String(locationsData[0].id));
                }
            } catch (loadError) {
                if (!cancelled) {
                    setError(loadError instanceof Error ? loadError.message : "Kunne ikke hente data for skjemaet.");
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        void loadData();

        return () => {
            cancelled = true;
        };
    }, [getApiAccessToken]);

    const selectedLocationName = useMemo(
        () => locations.find((location) => String(location.id) === locationId)?.name ?? null,
        [locations, locationId]
    );

    const availableIngredients = useMemo(() => {
        if (!selectedLocationName) {
            return ingredients;
        }

        const existingIngredientNames = new Set(
            inventoryItems
                .filter((item) => item.location === selectedLocationName)
                .map((item) => item.ingredient.trim().toLowerCase())
        );

        return ingredients.filter(
            (ingredient) => !existingIngredientNames.has(ingredient.name.trim().toLowerCase())
        );
    }, [ingredients, inventoryItems, selectedLocationName]);

    useEffect(() => {
        if (availableIngredients.length === 0) {
            setIngredientId("");
            return;
        }

        const currentExists = availableIngredients.some(
            (ingredient) => String(ingredient.id) === ingredientId
        );

        if (!currentExists) {
            setIngredientId(String(availableIngredients[0].id));
        }
    }, [availableIngredients, ingredientId]);

    const canSubmit = useMemo(() => {
        const parsedQuantity = Number(quantity.replace(",", "."));
        return (
            ingredientId.length > 0 &&
            locationId.length > 0 &&
            Number.isFinite(parsedQuantity) &&
            parsedQuantity >= 0
        );
    }, [ingredientId, locationId, quantity]);

    async function handleSubmit(event: FormEvent) {
        event.preventDefault();

        const parsedQuantity = Number(quantity.replace(",", "."));
        if (!Number.isFinite(parsedQuantity) || parsedQuantity < 0) {
            setError("Ugyldig mengde. Skriv inn et tall som er 0 eller høyere.");
            return;
        }

        setSubmitting(true);
        setError(null);

        try {
            const token = await getApiAccessToken();
            await createInventory(
                {
                    ingredient_id: Number(ingredientId),
                    location_id: Number(locationId),
                    quantity: parsedQuantity,
                },
                token
            );
            onCreated();
        } catch (submitError) {
            setError(submitError instanceof Error ? submitError.message : "Kunne ikke legge til varen.");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <aside
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center"
            aria-label="Legg til vare modal"
            onClick={onClose}
        >
            <section
                className="w-full max-w-md rounded-2xl border p-5"
                style={{
                    borderColor: "var(--color-border)",
                    backgroundColor: "var(--color-surface)",
                }}
                role="dialog"
                aria-modal="true"
                aria-labelledby="add-storage-item-title"
                onClick={(event) => event.stopPropagation()}
            >
                <header className="mb-4 flex items-center justify-between">
                    <h2
                        id="add-storage-item-title"
                        className="text-lg font-semibold"
                        style={{ color: "var(--color-text-primary)" }}
                    >
                        Legg til vare i lageret
                    </h2>
                </header>

                {loading ? (
                    <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                        Laster valg...
                    </p>
                ) : (
                    <form className="space-y-3" onSubmit={(event) => void handleSubmit(event)}>
                        <fieldset className="m-0 border-0 p-0">
                            <label
                                className="mb-1 block text-sm font-medium"
                                htmlFor="storage-add-ingredient"
                                style={{ color: "var(--color-text-secondary)" }}
                            >
                                Ingrediens
                            </label>
                            <select
                                id="storage-add-ingredient"
                                value={ingredientId}
                                onChange={(event) => setIngredientId(event.target.value)}
                                className="w-full rounded-lg border px-3 py-2 text-sm outline-none"
                                style={{
                                    borderColor: "var(--color-border)",
                                    color: "var(--color-text-primary)",
                                    backgroundColor: "var(--color-secondary-surface)",
                                }}
                                disabled={availableIngredients.length === 0}
                            >
                                {availableIngredients.length === 0 ? (
                                    <option value="">Ingen ledige ingredienser for valgt lokasjon</option>
                                ) : null}
                                {availableIngredients.map((ingredient) => (
                                    <option key={ingredient.id} value={ingredient.id}>
                                        {ingredient.name} ({ingredient.unit})
                                    </option>
                                ))}
                            </select>
                        </fieldset>

                        <fieldset className="m-0 border-0 p-0">
                            <label
                                className="mb-1 block text-sm font-medium"
                                htmlFor="storage-add-location"
                                style={{ color: "var(--color-text-secondary)" }}
                            >
                                Lokasjon
                            </label>
                            <select
                                id="storage-add-location"
                                value={locationId}
                                onChange={(event) => setLocationId(event.target.value)}
                                className="w-full rounded-lg border px-3 py-2 text-sm outline-none"
                                style={{
                                    borderColor: "var(--color-border)",
                                    color: "var(--color-text-primary)",
                                    backgroundColor: "var(--color-secondary-surface)",
                                }}
                            >
                                {locations.map((location) => (
                                    <option key={location.id} value={location.id}>
                                        {location.name}
                                    </option>
                                ))}
                            </select>
                        </fieldset>

                        <fieldset className="m-0 border-0 p-0">
                            <label
                                className="mb-1 block text-sm font-medium"
                                htmlFor="storage-add-quantity"
                                style={{ color: "var(--color-text-secondary)" }}
                            >
                                Mengde
                            </label>
                            <input
                                id="storage-add-quantity"
                                type="number"
                                min="0"
                                step="any"
                                value={quantity}
                                onChange={(event) => setQuantity(event.target.value)}
                                className="w-full rounded-lg border px-3 py-2 text-sm outline-none"
                                style={{
                                    borderColor: "var(--color-border)",
                                    color: "var(--color-text-primary)",
                                    backgroundColor: "var(--color-secondary-surface)",
                                }}
                            />
                        </fieldset>

                        {error ? (
                            <p
                                className="rounded-lg border px-3 py-2 text-sm"
                                style={{
                                    borderColor: "var(--color-danger, #dc2626)",
                                    color: "var(--color-danger, #dc2626)",
                                    backgroundColor: "var(--color-secondary-surface)",
                                }}
                            >
                                {error}
                            </p>
                        ) : null}

                        <footer className="flex justify-end gap-2 pt-1">
                            <button
                                type="button"
                                onClick={onClose}
                                className="rounded-lg border px-3 py-2 text-sm font-semibold cursor-pointer"
                                style={{
                                    borderColor: "var(--color-border)",
                                    color: "var(--color-text-primary)",
                                    backgroundColor: "var(--color-secondary-surface)",
                                }}
                            >
                                Avbryt
                            </button>
                            <button
                                type="submit"
                                disabled={!canSubmit || submitting}
                                className="rounded-lg px-3 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                                style={{ backgroundColor: "var(--color-primary)" }}
                            >
                                {submitting ? "Lagrer..." : "Legg til"}
                            </button>
                        </footer>
                    </form>
                )}
            </section>
        </aside>
    );
}
