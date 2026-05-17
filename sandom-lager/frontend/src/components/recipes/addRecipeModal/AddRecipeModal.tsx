/*
    * AddRecipeModal.tsx
    * Modal for creating a new recipe with ingredients.
    * Only rendered for admin/manager users.
    * Flow: fill in recipe details → add ingredients → submit creates recipe + adds all ingredients.
    * Author: Sebastian Thomsen
*/

import { useRef } from "react";
import { useClickOutside, useEscapeKey } from "../../../hooks";
import type { Recipe, RecipeIngredient } from "../../../types";
import AllergenPicker from "./AllergenPicker";
import RecipeImagePicker from "./RecipeImagePicker";
import RecipeFormFields from "./RecipeFormFields";
import IngredientRows from "./IngredientRows";
import { useAddRecipeForm } from "./useAddRecipeForm";


interface AddRecipeModalProps {
    onClose: () => void;
    onCreated: () => void;
    initialRecipe?: Recipe;
    initialIngredients?: RecipeIngredient[];
}

export default function AddRecipeModal({ onClose, onCreated, initialRecipe, initialIngredients }: AddRecipeModalProps) {
    const {
        title, setTitle,
        category, setCategory,
        instructions, setInstructions,
        servings, setServings,
        recipeImageUrl, recipeImageFile, recipeImagePreview,
        handleImageChange, handleRemoveImage,
        allAllergens, selectedAllergenIds, setSelectedAllergenIds,
        handleAddAllergen,
        handleDeleteAllergen,
        existingIngredients,
        rows, updateRow, handleIngredientNameChange, addRow, removeRow,
        submitting, error,
        handleSubmit,
    } = useAddRecipeForm({ initialRecipe, initialIngredients, onCreated });

    const modalPanelRef = useRef<HTMLDivElement>(null);

    useEscapeKey(onClose);
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
                    <RecipeFormFields
                        title={title}
                        onTitleChange={setTitle}
                        category={category}
                        onCategoryChange={setCategory}
                        servings={servings}
                        onServingsChange={setServings}
                        instructions={instructions}
                        onInstructionsChange={setInstructions}
                    />

                    {/* Recipe image */}
                    <RecipeImagePicker
                        imageUrl={recipeImageUrl}
                        imagePreview={recipeImagePreview}
                        imageFile={recipeImageFile}
                        onFileChange={handleImageChange}
                        onRemove={handleRemoveImage}
                    />

                    {/* Allergens */}
                    <AllergenPicker
                        allAllergens={allAllergens}
                        selectedAllergenIds={selectedAllergenIds}
                        onChange={setSelectedAllergenIds}
                        canManage={true}
                        onAddAllergen={handleAddAllergen}
                        onDeleteAllergen={handleDeleteAllergen}
                    />

                    {/* Ingredients */}
                    <IngredientRows
                        rows={rows}
                        existingIngredients={existingIngredients}
                        onNameChange={handleIngredientNameChange}
                        onRowChange={updateRow}
                        onAddRow={addRow}
                        onRemoveRow={removeRow}
                    />

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
