/*
    * useAddRecipeForm.ts
    * Custom hook that manages all state and logic for the add/edit recipe form.
    * Handles recipe fields, image, allergens, ingredient rows and form submission.
    * Used by AddRecipeModal.tsx
    * Author: Sebastian Thomsen
*/

import { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { AUTH0_AUDIENCE } from "../../../config/auth";
import { createIngredient, createRecipe, updateRecipe, addRecipeIngredient, deleteRecipeIngredient, 
    fetchIngredients, fetchAllergens, setRecipeAllergens, uploadRecipeImage, 
    createAllergen as apiCreateAllergen, deleteAllergen as apiDeleteAllergen,
    fetchCategories, createCategory as apiCreateCategory, deleteCategory as apiDeleteCategory } from "../../../api/recipes";
import type { Allergen, Category, Ingredient, Recipe, RecipeIngredient } from "../../../types";
import { type IngredientRow } from "./IngredientRows";

const DEFAULT_ROW: IngredientRow = { existingId: null, name: "", unit: "g", quantity: "" };

interface UseAddRecipeFormProps {
    initialRecipe?: Recipe;
    initialIngredients?: RecipeIngredient[];
    onCreated: () => void;
}

export function useAddRecipeForm({ initialRecipe, initialIngredients, onCreated }: UseAddRecipeFormProps) {
    const { getAccessTokenSilently } = useAuth0();

    // Recipe fields
    const [title, setTitle] = useState(initialRecipe?.title ?? "");
    const [category, setCategory] = useState<string>(initialRecipe?.category ?? "");
    const [instructions, setInstructions] = useState(initialRecipe?.instructions ?? "");

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

    // Categories
    const [allCategories, setAllCategories] = useState<Category[]>([]);

    // Available ingredients from the database (for autocomplete)
    const [existingIngredients, setExistingIngredients] = useState<Ingredient[]>([]);

    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

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
                const [ingredientsData, allergensData, categoriesData] = await Promise.all([
                    fetchIngredients(token),
                    fetchAllergens(token),
                    fetchCategories(token),
                ]);
                if (!cancelled) {
                    setExistingIngredients(ingredientsData);
                    setAllAllergens(allergensData);
                    setAllCategories(categoriesData);
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

    function handleImageChange(file: File | null) {
        setRecipeImageFile(file);
        if (file) setRemoveExistingImage(false);
    }

    function handleRemoveImage() {
        setRecipeImageFile(null);
        setRecipeImagePreview(null);
        setRecipeImageUrl(null);
        setRecipeImagePublicId(null);
        setRemoveExistingImage(true);
    }

    async function submitRecipe() {
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
                servings: 8,
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

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        await submitRecipe();
    }

    async function handleAddAllergen(name: string): Promise<void> {
        const token = await getAccessTokenSilently({ authorizationParams: { audience: AUTH0_AUDIENCE } });
        const newAllergen = await apiCreateAllergen(name, token);
        setAllAllergens((prev) => [...prev, newAllergen].sort((a, b) => a.name.localeCompare(b.name)));
    }

    async function handleDeleteAllergen(id: number): Promise<void> {
        const token = await getAccessTokenSilently({ authorizationParams: { audience: AUTH0_AUDIENCE } });
        await apiDeleteAllergen(id, token);
        setAllAllergens((prev) => prev.filter((a) => a.id !== id));
        setSelectedAllergenIds((prev) => prev.filter((aid) => aid !== id));
    }

    async function handleAddCategory(name: string): Promise<void> {
        const token = await getAccessTokenSilently({ authorizationParams: { audience: AUTH0_AUDIENCE } });
        const newCat = await apiCreateCategory(name, token);
        setAllCategories((prev) => [...prev, newCat].sort((a, b) => a.name.localeCompare(b.name)));
    }

    async function handleDeleteCategory(id: number): Promise<void> {
        const token = await getAccessTokenSilently({ authorizationParams: { audience: AUTH0_AUDIENCE } });
        await apiDeleteCategory(id, token);
        setAllCategories((prev) => prev.filter((c) => c.id !== id));
    }

    return {
        title, setTitle,
        category, setCategory,
        instructions, setInstructions,
        recipeImageUrl,
        recipeImageFile,
        recipeImagePreview,
        handleImageChange,
        handleRemoveImage,
        rows,
        allAllergens,
        selectedAllergenIds, setSelectedAllergenIds,
        handleAddAllergen,
        handleDeleteAllergen,
        allCategories,
        handleAddCategory,
        handleDeleteCategory,
        existingIngredients,
        submitting,
        error,
        updateRow,
        handleIngredientNameChange,
        addRow,
        removeRow,
        handleSubmit,
    };
}
