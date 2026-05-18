/*
    * AllergenPicker.tsx
    * Renders a grid of allergen checkboxes for the add/edit recipe form.
    * Includes an optional edit mode (for managers/admins) to add or delete allergens.
    * Used by AddRecipeModal.tsx
    * Author: Sebastian Thomsen
*/

import { useState, useEffect } from "react";
import { Pencil, X, Plus, Check } from "lucide-react";
import type { Allergen } from "../../../types";

interface AllergenPickerProps {
    allAllergens: Allergen[];
    selectedAllergenIds: number[];
    onChange: (ids: number[]) => void;
    canManage?: boolean;
    onAddAllergen?: (name: string) => Promise<void>;
    onDeleteAllergen?: (id: number) => Promise<void>;
    style?: React.CSSProperties;
}

export default function AllergenPicker({
    allAllergens,
    selectedAllergenIds,
    onChange,
    canManage = false,
    onAddAllergen,
    onDeleteAllergen,
    style,
}: AllergenPickerProps) {
    const [editMode, setEditMode] = useState(false);
    const [newName, setNewName] = useState("");
    const [saving, setSaving] = useState(false);
    const [deleteError, setDeleteError] = useState<string | null>(null);
    const [addError, setAddError] = useState<string | null>(null);

    useEffect(() => {
        if (!deleteError) return;
        const t = setTimeout(() => setDeleteError(null), 4000);
        return () => clearTimeout(t);
    }, [deleteError]);

    useEffect(() => {
        if (!addError) return;
        const t = setTimeout(() => setAddError(null), 4000);
        return () => clearTimeout(t);
    }, [addError]);

    if (allAllergens.length === 0 && !canManage) return null;

    async function handleAdd() {
        if (!newName.trim() || !onAddAllergen) return;
        setSaving(true);
        setAddError(null);
        try {
            await onAddAllergen(newName.trim());
            setNewName("");
        } catch (err) {
            const e = err as { detail?: string; message?: string };
            setAddError(e.detail ?? e.message ?? "Kunne ikke legge til allergen");
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete(id: number) {
        if (!onDeleteAllergen) return;
        setDeleteError(null);
        try {
            await onDeleteAllergen(id);
        } catch (err) {
            const e = err as { detail?: string; message?: string };
            setDeleteError(e.detail ?? e.message ?? "Kunne ikke slette allergen");
        }
    }

    return (
        <div className="flex flex-col gap-2" style={style}>
            {/* Header row */}
            <div className="flex items-center justify-between">
                <span className="text-sm font-medium" style={{ color: "var(--color-text-secondary)" }}>
                    Allergener
                </span>
                {canManage && (
                    <button
                        type="button"
                        onClick={() => {
                            setEditMode((prev) => !prev);
                            setDeleteError(null);
                            setAddError(null);
                            setNewName("");
                        }}
                        className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-lg transition-colors cursor-pointer"
                        style={{
                            color: editMode ? "var(--color-on-primary)" : "var(--color-primary)",
                            backgroundColor: editMode ? "var(--color-primary)" : "transparent",
                            border: `1px solid var(--color-primary)`,
                        }}
                    >
                        {editMode ? <Check size={12} /> : <Pencil size={12} />}
                        {editMode ? "Ferdig" : "Rediger"}
                    </button>
                )}
            </div>

            {/* Edit mode: list with delete buttons + add new */}
            {editMode ? (
                <div
                    className="flex flex-col gap-1.5 rounded-xl p-3"
                    style={{ backgroundColor: "var(--color-secondary-surface)", border: "1px solid var(--color-border)" }}
                >
                    {allAllergens.length === 0 && (
                        <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
                            Ingen allergener lagt til ennå.
                        </p>
                    )}
                    {allAllergens.map((allergen) => (
                        <div key={allergen.id} className="flex items-center justify-between">
                            <span className="text-sm" style={{ color: "var(--color-text-primary)" }}>
                                {allergen.name}
                            </span>
                            <button
                                type="button"
                                onClick={() => handleDelete(allergen.id)}
                                className="w-6 h-6 flex items-center justify-center rounded-full transition-colors cursor-pointer"
                                style={{ color: "var(--color-text-secondary)" }}
                                aria-label={`Slett ${allergen.name}`}
                            >
                                <X size={14} />
                            </button>
                        </div>
                    ))}

                    {deleteError && (
                        <p className="text-xs text-red-500 mt-1">{deleteError}</p>
                    )}

                    {/* Add new allergen */}
                    <div className="flex gap-2 mt-2">
                        <input
                            type="text"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAdd(); } }}
                            placeholder="Nytt allergen..."
                            className="flex-1 text-sm px-3 py-1.5 rounded-lg outline-none"
                            style={{
                                backgroundColor: "var(--color-background)",
                                border: "1px solid var(--color-border)",
                                color: "var(--color-text-primary)",
                            }}
                        />
                        <button
                            type="button"
                            onClick={handleAdd}
                            disabled={saving || !newName.trim()}
                            className="flex items-center gap-1 text-sm px-3 py-1.5 rounded-lg transition-opacity cursor-pointer"
                            style={{
                                backgroundColor: "var(--color-primary)",
                                color: "var(--color-on-primary)",
                                opacity: saving || !newName.trim() ? 0.5 : 1,
                            }}
                        >
                            <Plus size={14} />
                            Legg til
                        </button>
                    </div>
                    {addError && (
                        <p className="text-xs text-red-500">{addError}</p>
                    )}
                </div>
            ) : (
                /* Normal mode: checkbox grid */
                allAllergens.length > 0 && (
                    <div className="grid grid-cols-3 gap-1.5">
                        {allAllergens.map((allergen) => (
                            <label key={allergen.id} className="flex items-center gap-2 cursor-pointer select-none">
                                <input
                                    type="checkbox"
                                    checked={selectedAllergenIds.includes(allergen.id)}
                                    onChange={(e) => {
                                        onChange(
                                            e.target.checked
                                                ? [...selectedAllergenIds, allergen.id]
                                                : selectedAllergenIds.filter((id) => id !== allergen.id)
                                        );
                                    }}
                                    className="w-4 h-4 rounded cursor-pointer"
                                    style={{ accentColor: "var(--color-primary)" }}
                                />
                                <span className="text-sm" style={{ color: "var(--color-text-primary)" }}>
                                    {allergen.name}
                                </span>
                            </label>
                        ))}
                    </div>
                )
            )}
        </div>
    );
}

