/*
    * RecipeFormFields.tsx
    * Basic text fields for the add/edit recipe form:
    * title, category, servings and instructions.
    * Used by AddRecipeModal.tsx
    * Author: Sebastian Thomsen
*/

import { useRef, useEffect, useState } from "react";
import { Pencil, X, Plus, Check } from "lucide-react";
import type { Category } from "../../../types";

const inputStyle = {
    backgroundColor: "var(--color-surface)",
    color: "var(--color-text-primary)",
    border: "1px solid var(--color-border)",
};

interface RecipeFormFieldsProps {
    title: string;
    onTitleChange: (value: string) => void;
    category: string;
    onCategoryChange: (value: string) => void;
    allCategories: Category[];
    canManageCategories?: boolean;
    onAddCategory?: (name: string) => Promise<void>;
    onDeleteCategory?: (id: number) => Promise<void>;
    instructions: string;
    onInstructionsChange: (value: string) => void;
    style?: React.CSSProperties;
}

export default function RecipeFormFields({
    title,
    onTitleChange,
    category,
    onCategoryChange,
    allCategories,
    canManageCategories = false,
    onAddCategory,
    onDeleteCategory,
    instructions,
    onInstructionsChange,
    style,
}: RecipeFormFieldsProps) {
    const titleRef = useRef<HTMLInputElement>(null);
    const [editMode, setEditMode] = useState(false);
    const [newName, setNewName] = useState("");
    const [saving, setSaving] = useState(false);
    const [deleteError, setDeleteError] = useState<string | null>(null);
    const [addError, setAddError] = useState<string | null>(null);

    useEffect(() => {
        titleRef.current?.focus();
    }, []);

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

    async function handleAdd() {
        if (!newName.trim() || !onAddCategory) return;
        setSaving(true);
        setAddError(null);
        try {
            await onAddCategory(newName.trim());
            setNewName("");
        } catch (err) {
            const e = err as { detail?: string; message?: string };
            setAddError(e.detail ?? e.message ?? "Kunne ikke legge til kategori");
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete(cat: Category) {
        if (!onDeleteCategory) return;
        setDeleteError(null);
        try {
            await onDeleteCategory(cat.id);
            if (category === cat.name) onCategoryChange("");
        } catch (err) {
            const e = err as { detail?: string; message?: string };
            setDeleteError(e.detail ?? e.message ?? "Kunne ikke slette kategori");
        }
    }

    return (
        <div className="flex flex-col gap-4" style={style}>
            {/* Title */}
            <div className="flex flex-col gap-1">
                <label htmlFor="recipe-title" className="text-sm font-medium" style={{ color: "var(--color-text-secondary)" }}>
                    Tittel <span aria-hidden="true">*</span>
                </label>
                <input
                    id="recipe-title"
                    ref={titleRef}
                    type="text"
                    value={title}
                    onChange={(e) => onTitleChange(e.target.value)}
                    required
                    placeholder="F.eks. Pasta Carbonara"
                    className="rounded-lg px-3 py-2 text-sm outline-none"
                    style={inputStyle}
                />
            </div>

            {/* Category */}
            <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                    <label htmlFor="recipe-category" className="text-sm font-medium" style={{ color: "var(--color-text-secondary)" }}>
                        Kategori <span aria-hidden="true">*</span>
                    </label>
                    {canManageCategories && (
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
                                border: "1px solid var(--color-primary)",
                            }}
                        >
                            {editMode ? <Check size={12} /> : <Pencil size={12} />}
                            {editMode ? "Ferdig" : "Rediger"}
                        </button>
                    )}
                </div>

                {editMode ? (
                    <div
                        className="flex flex-col gap-1.5 rounded-xl p-3"
                        style={{ backgroundColor: "var(--color-secondary-surface)", border: "1px solid var(--color-border)" }}
                    >
                        {allCategories.length === 0 && (
                            <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
                                Ingen kategorier lagt til ennå.
                            </p>
                        )}
                        {allCategories.map((cat) => (
                            <div key={cat.id} className="flex items-center justify-between">
                                <span className="text-sm" style={{ color: "var(--color-text-primary)" }}>{cat.name}</span>
                                <button
                                    type="button"
                                    onClick={() => handleDelete(cat)}
                                    className="w-6 h-6 flex items-center justify-center rounded-full cursor-pointer"
                                    style={{ color: "var(--color-text-secondary)" }}
                                    aria-label={`Slett ${cat.name}`}
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        ))}
                        {deleteError && <p className="text-xs text-red-500 mt-1">{deleteError}</p>}
                        <div className="flex gap-2 mt-2">
                            <input
                                type="text"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAdd(); } }}
                                placeholder="Ny kategori..."
                                className="flex-1 text-sm px-3 py-1.5 rounded-lg outline-none"
                                style={{ backgroundColor: "var(--color-background)", border: "1px solid var(--color-border)", color: "var(--color-text-primary)" }}
                            />
                            <button
                                type="button"
                                onClick={handleAdd}
                                disabled={saving || !newName.trim()}
                                className="flex items-center gap-1 text-sm px-3 py-1.5 rounded-lg transition-opacity cursor-pointer"
                                style={{ backgroundColor: "var(--color-primary)", color: "var(--color-on-primary)", opacity: saving || !newName.trim() ? 0.5 : 1 }}
                            >
                                <Plus size={14} />
                                Legg til
                            </button>
                        </div>
                        {addError && <p className="text-xs text-red-500">{addError}</p>}
                    </div>
                ) : (
                    <select
                        id="recipe-category"
                        value={category}
                        onChange={(e) => onCategoryChange(e.target.value)}
                        className="rounded-lg px-3 py-2 text-sm outline-none cursor-pointer"
                        style={inputStyle}
                    >
                        <option value="" disabled>Velg kategori</option>
                        {allCategories.map((cat) => (
                            <option key={cat.id} value={cat.name}>{cat.name}</option>
                        ))}
                    </select>
                )}
            </div>

            

            {/* Instructions */}
            <div className="flex flex-col gap-1">
                <label htmlFor="recipe-instructions" className="text-sm font-medium" style={{ color: "var(--color-text-secondary)" }}>
                    Fremgangsmåte
                </label>
                <textarea
                    id="recipe-instructions"
                    value={instructions}
                    onChange={(e) => onInstructionsChange(e.target.value)}
                    rows={4}
                    placeholder="Beskriv fremgangsmåten steg for steg..."
                    className="rounded-lg px-3 py-2 text-sm outline-none resize-y"
                    style={inputStyle}
                />
            </div>
        </div>
    );
}

