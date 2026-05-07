/*
    * RecipeDetailModal.tsx
    * Modal that shows full recipe details: title, category, servings,
    * ingredient list, and instructions/description.
    * Opened when user clicks the recipe card image area.
    * Author: Sebastian Thomsen
*/

import { useRef, useState } from "react";
import { useClickOutside, useEscapeKey, useRecipeIngredients } from "../../../hooks";
import RecipeDetailContent from "./RecipeDetailContent";
import type { Recipe, RecipeIngredient } from "../../../types";

interface RecipeDetailModalProps {
    recipe: Recipe;
    onClose: () => void;
    canManage?: boolean;
    onEdit?: (ingredients: RecipeIngredient[]) => void;
    onDelete?: () => Promise<void>;
}

export default function RecipeDetailModal({ recipe, onClose, canManage, onEdit, onDelete }: RecipeDetailModalProps) {
    const { ingredients, loading, error } = useRecipeIngredients(recipe.id);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState<string | null>(null);

    const modalPanelRef = useRef<HTMLDivElement>(null);

    useEscapeKey(onClose);
    useClickOutside(modalPanelRef, onClose);

    async function handleConfirmDelete() {
        if (!onDelete) return;
        setDeleting(true);
        setDeleteError(null);
        try {
            await onDelete();
        } catch {
            setDeleteError("Kunne ikke slette oppskriften. Prøv igjen.");
            setDeleting(false);
        }
    }

    return (
        /* Backdrop */
        <div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
            style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
            <div
                ref={modalPanelRef}
                className="w-full max-w-lg rounded-2xl shadow-xl overflow-hidden flex flex-col h-[80vh]"
                style={{ backgroundColor: "var(--color-background)", border: "1px solid var(--color-border)" }}
                role="dialog"
                aria-modal="true"
                aria-labelledby="recipe-detail-title"
            >
                {/* Header */}
                <div className="flex items-start justify-between px-5 py-4" style={{ borderBottom: "1px solid var(--color-border)" }}>
                    <div>
                        <h2 id="recipe-detail-title" className="text-lg font-semibold leading-tight" style={{ color: "var(--color-text-primary)" }}>
                            {recipe.title}
                        </h2>
                        <div className="flex items-center gap-3 mt-1">
                            <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: "var(--color-secondary-surface)", color: "var(--color-text-secondary)" }}>
                                {recipe.category}
                            </span>
                            <span className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
                                {recipe.servings} porsjoner
                            </span>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Lukk"
                        className="w-8 h-8 flex items-center justify-center rounded-full shrink-0 ml-4 mt-0.5 cursor-pointer"
                        style={{ color: "var(--color-text-secondary)" }}
                    >
                        <svg fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Scrollable content */}
                <RecipeDetailContent
                    recipe={recipe}
                    ingredients={ingredients}
                    loading={loading}
                    error={error}
                />

                {/* Footer */}
                <div className="px-5 py-3 flex flex-col gap-2" style={{ borderTop: "1px solid var(--color-border)" }}>
                    {confirmDelete ? (
                        <>
                            <p className="text-sm text-center" style={{ color: "var(--color-text-secondary)" }}>
                                Er du sikker? Dette kan ikke angres.
                            </p>
                            {deleteError && (
                                <p className="text-xs text-center text-red-500">{deleteError}</p>
                            )}
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => { setConfirmDelete(false); setDeleteError(null); }}
                                    disabled={deleting}
                                    className="flex-1 py-2.5 rounded-xl text-sm font-medium cursor-pointer"
                                    style={{
                                        backgroundColor: "var(--color-secondary-surface)",
                                        color: "var(--color-text-primary)",
                                        border: "1px solid var(--color-border)",
                                    }}
                                >
                                    Avbryt
                                </button>
                                <button
                                    type="button"
                                    onClick={handleConfirmDelete}
                                    disabled={deleting}
                                    className="flex-1 py-2.5 rounded-xl text-sm font-medium cursor-pointer"
                                    style={{ backgroundColor: "#ef4444", color: "#fff", opacity: deleting ? 0.6 : 1 }}
                                >
                                    {deleting ? "Sletter..." : "Slett"}
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            {canManage && (
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setConfirmDelete(true)}
                                        className="flex-1 py-2 rounded-xl text-sm font-medium cursor-pointer"
                                        style={{ backgroundColor: "rgba(239,68,68,0.1)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.25)" }}
                                    >
                                        Slett
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => onEdit?.(ingredients)}
                                        disabled={loading}
                                        className="flex-1 py-2 rounded-xl text-sm font-medium cursor-pointer"
                                        style={{
                                            backgroundColor: "var(--color-primary)",
                                            color: "var(--color-on-primary)",
                                            opacity: loading ? 0.6 : 1,
                                        }}
                                    >
                                        Rediger
                                    </button>
                                </div>
                            )}
                            <button
                                type="button"
                                onClick={onClose}
                                className="w-full py-2.5 rounded-xl text-sm font-medium cursor-pointer"
                                style={{
                                    backgroundColor: "var(--color-secondary-surface)",
                                    color: "var(--color-text-primary)",
                                    border: "1px solid var(--color-border)",
                                }}
                            >
                                Lukk
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
