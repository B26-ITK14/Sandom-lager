/*
* ProductCard.tsx
* Displays an inventory item with its name, quantity, and unit.
* Allows editing the quantity and deleting the item with confirmation.
* Shows appropriate buttons based on user permissions and action states.
*/

import { useEffect, useState } from "react";
import DelCardQ from "./DelCardQ";
import StorageEditCardBtn from "./StorageEditCardBtn";
import StorageDelCardBtn from "./StorageDelCardBtn";
import FavProductBtn from "./FavProductBtn";

type ProductCardProps = {
    id: number;
    name: string;
    quantity: number;
    unit: string;
    highlighted?: boolean;
    onSaveQuantity?: (nextQuantity: number) => Promise<boolean> | boolean;
    onDelete?: () => Promise<boolean> | boolean;
    editDisabled?: boolean;
    deleteDisabled?: boolean;
    canEdit?: boolean;
    canDelete?: boolean;
    isFavorite?: boolean;
    onToggleFavorite?: (id: number) => void;
    onNotice?: (message: string) => void;
};

export default function ProductCard({
    id,
    name,
    quantity,
    unit,
    highlighted = false,
    onSaveQuantity,
    onDelete,
    editDisabled = false,
    deleteDisabled = false,
    canEdit = true,
    canDelete = true,
    isFavorite = false,
    onToggleFavorite,
    onNotice,
}: ProductCardProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [quantityInput, setQuantityInput] = useState(String(quantity));
    const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

    useEffect(() => {
        if (!isEditing) {
            setQuantityInput(String(quantity));
        }
    }, [quantity, isEditing]);

    async function handleEditButtonClick() {
        if (!canEdit) {
            onNotice?.("Du har ikke tilgang til å redigere lageret.");
            return;
        }

        if (!isEditing) {
            setQuantityInput(String(quantity));
            setIsEditing(true);
            return;
        }

        const normalizedInput = quantityInput.replace(",", ".").trim();
        const nextQuantity = Number(normalizedInput);

        if (!Number.isFinite(nextQuantity) || nextQuantity < 0) {
            onNotice?.("Ugyldig mengde. Skriv inn et tall som er 0 eller høyere.");
            return;
        }

        const didSave = await onSaveQuantity?.(nextQuantity);
        if (didSave !== false) {
            setIsEditing(false);
        }
    }

    async function handleConfirmDelete() {
        const didDelete = await onDelete?.();
        if (didDelete !== false) {
            setIsConfirmingDelete(false);
        }
    }

    return (
        <article
            className="rounded-none px-6 py-6"
            style={{backgroundColor: highlighted ? "#e2e5ea" : "#eceef2",}}
        >
            <div className="flex items-center justify-between">
                <section>
                    <h2 className="text-lg leading-none font-medium" style={{ color: "#000" }}>
                        {name}
                    </h2>

                    {isEditing ? (
                        <div className="mt-2 flex items-center gap-2">
                            <input
                                type="number"
                                min="0"
                                step="any"
                                className="w-24 rounded-md border px-2 py-1 text-md font-semibold outline-none"
                                style={{ borderColor: "#b8bcc6", color: "#5f6368", backgroundColor: "#ffffff" }}
                                value={quantityInput}
                                onChange={(event) => setQuantityInput(event.target.value)}
                                aria-label={`Ny mengde for ${name}`}
                                disabled={editDisabled}
                            />
                            <span className="text-md font-semibold" style={{ color: "#5f6368" }}>
                                {unit}
                            </span>
                        </div>
                    ) : (
                        <p className="mt-2 text-md leading-none font-semibold" style={{ color: "#5f6368" }}>
                            {quantity} {unit}
                        </p>
                    )}
                </section>

                <section className="flex items-center gap-3">
                    <FavProductBtn 
                        name={name}
                        onClick={() => onToggleFavorite?.(id)}
                        isSaved={isFavorite}
                    />
                    <StorageEditCardBtn
                        name={name}
                        onClick={() => {
                            void handleEditButtonClick();
                        }}
                        disabled={editDisabled}
                        isSaving={isEditing || editDisabled}
                    />
                    <StorageDelCardBtn
                        name={name}
                        onClick={() => {
                            if (!canDelete) {
                                onNotice?.("Du har ikke tilgang til å slette varer fra lageret.");
                                return;
                            }

                            setIsConfirmingDelete(true);
                        }}
                        disabled={deleteDisabled}
                    />
                </section>
            </div>

            {isConfirmingDelete ? (
                <div className="mt-4">
                    <DelCardQ
                        name={name}
                        onConfirm={() => {
                            void handleConfirmDelete();
                        }}
                        onCancel={() => {
                            setIsConfirmingDelete(false);
                        }}
                        disabled={deleteDisabled}
                    />
                </div>
            ) : null}
        </article>
    );
}