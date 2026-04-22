/*
    * AddRecipeModal.tsx
    * Modal for creating a new recipe with ingredients.
    * Only rendered for admin/manager users.
    * Flow: fill in recipe details → add ingredients → submit creates recipe + adds all ingredients.
*/

import { useEffect, useRef, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { AUTH0_AUDIENCE } from "../../config/auth";
import { createIngredient, createRecipe, updateRecipe, addRecipeIngredient, deleteRecipeIngredient, fetchIngredients, fetchAllergens, setRecipeAllergens, uploadRecipeImage } from "../../api/recipes";
import { useClickOutside, useEscapeKey } from "../../hooks";
import { INGREDIENT_UNITS, RECIPE_CATEGORIES } from "../../types";
import type { Allergen, Ingredient, IngredientUnit, Recipe, RecipeIngredient } from "../../types";
import AllergenPicker from "./addRecipeModal/AllergenPicker";
import RecipeImagePicker from "./addRecipeModal/RecipeImagePicker";

interface IngredientRow {
    // If existingId is set, we reuse an existing ingredient; otherwise we create a new one
    existingId: number | null;
    name: string;
    unit: IngredientUnit;
    quantity: string;
}

interface AddRecipeModalProps {
    onClose: () => void;
    onCreated: () => void;
    initialRecipe?: Recipe;
    initialIngredients?: RecipeIngredient[];
}

const DEFAULT_ROW: IngredientRow = { existingId: null, name: "", unit: "g", quantity: "" };

export default function AddRecipeModal({ onClose, onCreated, initialRecipe, initialIngredients }: AddRecipeModalProps) {
    const { getAccessTokenSilently } = useAuth0();

    // Recipe fields
    const [title, setTitle] = useState(initialRecipe?.title ?? "");
    const [category, setCategory] = useState<string>(initialRecipe?.category ?? "");
    const [instructions, setInstructions] = useState(initialRecipe?.instructions ?? "");
    const [servings, setServings] = useState(String(initialRecipe?.servings ?? 8));
    const [recipeImageUrl, setRecipeImageUrl] = useState<string | null>(initialRecipe?.image_url ?? null);
    const [recipeImagePublicId, setRecipeImagePublicId] = useState<string | null>(initialRecipe?.image_public_id ?? null);
    const [recipeImageFile, setRecipeImageFile] = useState<File | null>(null);
    const [recipeImagePreview, setRecipeImagePreview] = useState<string | null>(null);
    const [removeExistingImage, setRemoveExistingImage] = useState(false);

    // Ingredient rows
    const [rows, setRows] = useState<IngredientRow[]>(
        initialIngredients && initialIngredients.length > 0
            ? initialIngredients.map((ri) => ({
                  existingId: ri.ingredient_id,
                  name: ri.ingredient_name,
                  unit: ri.unit,
                  quantity: String(ri.quantity),
              }))
            : [{ ...DEFAULT_ROW }]
    );

    // Allergens
    const [allAllergens, setAllAllergens] = useState<Allergen[]>([]);
    const [selectedAllergenIds, setSelectedAllergenIds] = useState<number[]>([]);

    // Available ingredients from the database (for autocomplete)
    const [existingIngredients, setExistingIngredients] = useState<Ingredient[]>([]);

    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const titleRef = useRef<HTMLInputElement>(null);

    // Focus title input on mount
    useEffect(() => {
        titleRef.current?.focus();
    }, []);

    useEscapeKey(onClose);

    useEffect(() => {
        if (!recipeImageFile) {
            setRecipeImagePreview(null);
            return;
        }

        const objectUrl = URL.createObjectURL(recipeImageFile);
        setRecipeImagePreview(objectUrl);

        return () => URL.revokeObjectURL(objectUrl);
    }, [recipeImageFile]);

    // Load existing ingredients and all allergens for the form
    useEffect(() => {
        let cancelled = false;
        async function load() {
            try {
                const token = await getAccessTokenSilently({ authorizationParams: { audience: AUTH0_AUDIENCE } });
                const [ingredientsData, allergensData] = await Promise.all([
                    fetchIngredients(token),
                    fetchAllergens(token),
                ]);
                if (!cancelled) {
                    setExistingIngredients(ingredientsData);
                    setAllAllergens(allergensData);
                    if (initialRecipe) {
                        const matched = initialRecipe.allergens
                            .map((name) => allergensData.find((a) => a.name === name)?.id)
                            .filter((id): id is number => id !== undefined);
                        setSelectedAllergenIds(matched);
                    }
                }
            } catch {
                // Non-critical
            }
        }
        load();
        return () => { cancelled = true; };
    }, [getAccessTokenSilently]);

    function updateRow(index: number, patch: Partial<IngredientRow>) {
        setRows((prev) => prev.map((row, i) => (i === index ? { ...row, ...patch } : row)));
    }

    function handleIngredientNameChange(index: number, name: string) {
        const match = existingIngredients.find(
            (ing) => ing.name.toLowerCase() === name.toLowerCase()
        );
        if (match) {
            updateRow(index, { name: match.name, existingId: match.id, unit: match.unit });
        } else {
            updateRow(index, { name, existingId: null });
        }
    }

    function addRow() {
        setRows((prev) => [...prev, { ...DEFAULT_ROW }]);
    }

    function removeRow(index: number) {
        setRows((prev) => prev.filter((_, i) => i !== index));
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);

        if (!title.trim()) {
            setError("Tittel er påkrevd.");
            return;
        }
        if (!category) {
            setError("Du må velge en kategori.");
            return;
        }

        const validRows = rows.filter((r) => r.name.trim() && r.quantity.trim());

        setSubmitting(true);
        try {
            const token = await getAccessTokenSilently({ authorizationParams: { audience: AUTH0_AUDIENCE } });

            let uploadedImageUrl = removeExistingImage ? null : recipeImageUrl;
            let uploadedImagePublicId = removeExistingImage ? null : recipeImagePublicId;
            if (recipeImageFile) {
                const imageUpload = await uploadRecipeImage(recipeImageFile, token, initialRecipe?.id);
                uploadedImageUrl = imageUpload.url;
                uploadedImagePublicId = imageUpload.publicId;
            }

            const recipeData = {
                title: title.trim(),
                category: category.trim(),
                instructions: instructions.trim() || undefined,
                servings: parseInt(servings, 10) || 8,
                image_url: uploadedImageUrl,
                image_public_id: uploadedImagePublicId,
            };

            // 1. Create or update the recipe
            const recipe = initialRecipe
                ? await updateRecipe(initialRecipe.id, recipeData, token)
                : await createRecipe(recipeData, token);

            // 2. Set allergens (always call in edit mode to support removing all allergens)
            if (selectedAllergenIds.length > 0 || initialRecipe) {
                await setRecipeAllergens(recipe.id, selectedAllergenIds, token);
            }

            setRecipeImageUrl(recipe.image_url ?? uploadedImageUrl ?? null);
            setRecipeImagePublicId(recipe.image_public_id ?? uploadedImagePublicId ?? null);

            // 3. For edit mode: remove all existing ingredient links first
            if (initialRecipe && initialIngredients) {
                for (const ri of initialIngredients) {
                    await deleteRecipeIngredient(ri.id, token);
                }
            }

            // 4. Add all valid ingredient rows
            for (const row of validRows) {
                let ingredientId = row.existingId;

                if (!ingredientId) {
                    const ing = await createIngredient({ name: row.name.trim(), unit: row.unit }, token);
                    ingredientId = ing.id;
                }

                await addRecipeIngredient(recipe.id, { ingredient_id: ingredientId, quantity: parseFloat(row.quantity) }, token);
            }

            onCreated();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Noe gikk galt. Prøv igjen.");
        } finally {
            setSubmitting(false);
        }
    }

    const inputStyle = {
        backgroundColor: "var(--color-surface)",
        color: "var(--color-text-primary)",
        border: "1px solid var(--color-border)",
    };

    const modalPanelRef = useRef<HTMLDivElement>(null);

    useClickOutside(modalPanelRef, onClose);

    return (
        /* Backdrop */
        <div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
            style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
            <div
                ref={modalPanelRef}
                className="w-full max-w-lg rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]"
                style={{ backgroundColor: "var(--color-background)", border: "1px solid var(--color-border)" }}
                role="dialog"
                aria-modal="true"
                aria-labelledby="add-recipe-title"
            >
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid var(--color-border)" }}>
                    <h2 id="add-recipe-title" className="text-lg font-semibold" style={{ color: "var(--color-text-primary)" }}>
                        {initialRecipe ? "Rediger oppskrift" : "Legg til oppskrift"}
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Lukk"
                        className="w-8 h-8 flex items-center justify-center rounded-full transition-colors cursor-pointer"
                        style={{ color: "var(--color-text-secondary)" }}
                    >
                        <svg fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Scrollable form body */}
                <form onSubmit={handleSubmit} className="flex flex-col gap-4 overflow-y-auto px-5 py-4">
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
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            placeholder="F.eks. Pasta Carbonara"
                            className="rounded-lg px-3 py-2 text-sm outline-none"
                            style={inputStyle}
                        />
                    </div>

                    {/* Category */}
                    <div className="flex flex-col gap-1">
                        <label htmlFor="recipe-category" className="text-sm font-medium" style={{ color: "var(--color-text-secondary)" }}>
                            Kategori <span aria-hidden="true">*</span>
                        </label>
                        <select
                            id="recipe-category"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="rounded-lg px-3 py-2 text-sm outline-none cursor-pointer"
                            style={inputStyle}
                        >
                            <option value="" disabled>Velg kategori</option>
                            {RECIPE_CATEGORIES.map((cat) => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    {/* Servings */}
                    <div className="flex flex-col gap-1">
                        <label htmlFor="recipe-servings" className="text-sm font-medium" style={{ color: "var(--color-text-secondary)" }}>
                            Antall porsjoner
                        </label>
                        <input
                            id="recipe-servings"
                            type="number"
                            min={1}
                            value={servings}
                            onChange={(e) => setServings(e.target.value)}
                            className="rounded-lg px-3 py-2 text-sm outline-none w-28"
                            style={inputStyle}
                        />
                    </div>

                    {/* Instructions */}
                    <div className="flex flex-col gap-1">
                        <label htmlFor="recipe-instructions" className="text-sm font-medium" style={{ color: "var(--color-text-secondary)" }}>
                            Fremgangsmåte
                        </label>
                        <textarea
                            id="recipe-instructions"
                            value={instructions}
                            onChange={(e) => setInstructions(e.target.value)}
                            rows={4}
                            placeholder="Beskriv fremgangsmåten steg for steg..."
                            className="rounded-lg px-3 py-2 text-sm outline-none resize-y"
                            style={inputStyle}
                        />
                    </div>

                    {/* Recipe image */}
                    <RecipeImagePicker
                        imageUrl={recipeImageUrl}
                        imagePreview={recipeImagePreview}
                        imageFile={recipeImageFile}
                        onFileChange={(file) => {
                            setRecipeImageFile(file);
                            if (file) setRemoveExistingImage(false);
                        }}
                        onRemove={() => {
                            setRecipeImageFile(null);
                            setRecipeImagePreview(null);
                            setRecipeImageUrl(null);
                            setRecipeImagePublicId(null);
                            setRemoveExistingImage(true);
                        }}
                    />

                    {/* Allergens */}
                    <AllergenPicker
                        allAllergens={allAllergens}
                        selectedAllergenIds={selectedAllergenIds}
                        onChange={setSelectedAllergenIds}
                    />

                    {/* Ingredients */}
                    <div className="flex flex-col gap-2">
                        <span className="text-sm font-medium" style={{ color: "var(--color-text-secondary)" }}>
                            Ingredienser
                        </span>

                        {rows.map((row, index) => {
                            const isExisting = row.existingId !== null;
                            return (
                                <div key={index} className="flex gap-2 items-start">
                                    {/* Ingredient name with datalist autocomplete */}
                                    <div className="flex flex-col gap-1 flex-1">
                                        <input
                                            type="text"
                                            list="ingredient-suggestions"
                                            value={row.name}
                                            onChange={(e) => handleIngredientNameChange(index, e.target.value)}
                                            placeholder="Navn"
                                            aria-label={`Ingrediens ${index + 1} navn`}
                                            className="rounded-lg px-3 py-2 text-sm outline-none w-full"
                                            style={inputStyle}
                                        />
                                    </div>

                                    {/* Unit – read-only if existing ingredient */}
                                    <select
                                        value={row.unit}
                                        onChange={(e) => updateRow(index, { unit: e.target.value as IngredientUnit })}
                                        disabled={isExisting}
                                        aria-label={`Ingrediens ${index + 1} enhet`}
                                        className="rounded-lg px-2 py-2 text-sm outline-none"
                                        style={{
                                            ...inputStyle,
                                            opacity: isExisting ? 0.6 : 1,
                                            width: "5.5rem",
                                        }}
                                    >
                                        {INGREDIENT_UNITS.map((u) => (
                                            <option key={u} value={u}>{u}</option>
                                        ))}
                                    </select>

                                    {/* Quantity */}
                                    <input
                                        type="number"
                                        min={0}
                                        step="any"
                                        value={row.quantity}
                                        onChange={(e) => updateRow(index, { quantity: e.target.value })}
                                        placeholder="Mengde"
                                        aria-label={`Ingrediens ${index + 1} mengde`}
                                        className="rounded-lg px-3 py-2 text-sm outline-none"
                                        style={{ ...inputStyle, width: "6rem" }}
                                    />

                                    {/* Remove row */}
                                    {rows.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeRow(index)}
                                            aria-label="Fjern ingrediens"
                                            className="mt-1 w-8 h-8 flex items-center justify-center rounded-full shrink-0 cursor-pointer"
                                            style={{ color: "var(--color-text-secondary)" }}
                                        >
                                            <svg fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" className="w-4 h-4" aria-hidden="true">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    )}
                                </div>
                            );
                        })}

                        {/* Datalist for autocomplete */}
                        <datalist id="ingredient-suggestions">
                            {existingIngredients.map((ing) => (
                                <option key={ing.id} value={ing.name} />
                            ))}
                        </datalist>

                        <button
                            type="button"
                            onClick={addRow}
                            className="flex items-center gap-1 text-sm font-medium mt-1 self-start cursor-pointer"
                            style={{ color: "var(--color-primary)" }}
                        >
                            <svg fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" className="w-4 h-4" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                            </svg>
                            Legg til ingrediens
                        </button>
                    </div>

                    {error && (
                        <p className="text-sm text-red-500">{error}</p>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3 pt-1 pb-2">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={submitting}
                            className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer"
                            style={{
                                backgroundColor: "var(--color-secondary-surface)",
                                color: "var(--color-text-primary)",
                                border: "1px solid var(--color-border)",
                            }}
                        >
                            Avbryt
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-opacity cursor-pointer"
                            style={{
                                backgroundColor: "var(--color-primary)",
                                color: "var(--color-on-primary)",
                                opacity: submitting ? 0.6 : 1,
                            }}
                        >
                            {submitting ? "Lagrer..." : initialRecipe ? "Lagre endringer" : "Lagre oppskrift"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
