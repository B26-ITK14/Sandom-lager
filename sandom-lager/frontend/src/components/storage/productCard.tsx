/*
    * ProductCard.tsx
    * Displays an inventory item with its name, quantity, and unit.
    * Allows editing the quantity and deleting the item with confirmation.
    * Shows appropriate buttons based on user permissions and action states.
    * Author: Ida Tollaksen
*/

import { useState } from "react";
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

    function handleStartEdit() {
        if (!canEdit) {
            onNotice?.("Du har ikke tilgang til å redigere lageret.");
            return;
        }

        setQuantityInput(String(quantity));
        setIsEditing(true);
    }

    function handleCancelEdit() {
        setQuantityInput(String(quantity));
        setIsEditing(false);
    }

    async function handleConfirmEdit() {
        if (!canEdit) {
            onNotice?.("Du har ikke tilgang til å redigere lageret.");
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
            style={{
                backgroundColor: highlighted
                    ? "var(--color-secondary-surface)"
                    : "var(--color-surface)",
            }}
        >
            <div className="flex items-center justify-between">
                <section>
                    <h2 className="text-lg leading-none font-medium" style={{ color: "var(--color-text-primary)" }}>
                        {name}
                    </h2>

                    {isEditing ? (
                        <div className="mt-2 flex items-center gap-2">
                            <input
                                type="number"
                                min="0"
                                step="any"
                                className="w-24 rounded-md border px-2 py-1 text-md font-semibold outline-none"
                                style={{
                                    borderColor: "var(--color-primary)",
                                    color: "var(--color-text-primary)",
                                    backgroundColor: "var(--color-surface)",
                                }}
                                value={quantityInput}
                                onChange={(event) => setQuantityInput(event.target.value)}
                                aria-label={`Ny mengde for ${name}`}
                                disabled={editDisabled}
                            />
                            <span className="text-md font-semibold" style={{ color: "var(--color-text-secondary)" }}>
                                {unit}
                            </span>
                        </div>
                    ) : (
                        <p className="mt-2 text-md leading-none font-semibold" style={{ color: "var(--color-text-secondary)" }}>
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
                    {isEditing ? (
                        <>
                            <StorageEditCardBtn
                                name={name}
                                variant="confirm"
                                onClick={() => {
                                    void handleConfirmEdit();
                                }}
                                disabled={editDisabled}
                            />
                            <StorageEditCardBtn
                                name={name}
                                variant="cancel"
                                onClick={handleCancelEdit}
                                disabled={editDisabled}
                            />
                        </>
                    ) : (
                        <StorageEditCardBtn
                            name={name}
                            variant="edit"
                            onClick={handleStartEdit}
                            disabled={editDisabled}
                        />
                    )}
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
                <div
                    className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 p-4 sm:items-center"
                    role="presentation"
                    onClick={() => {
                        if (!deleteDisabled) {
                            setIsConfirmingDelete(false);
                        }
                    }}
                >
                    <div
                        className="w-full max-w-sm"
                        role="presentation"
                        onClick={(event) => {
                            event.stopPropagation();
                        }}
                    >
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
                </div>
            ) : null}
        </article>
    );
}