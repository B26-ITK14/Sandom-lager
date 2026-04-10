/*
    * recipes.ts
    * API functions for interacting with recipe-related endpoints of the backend API.
    * Covers recipes, recipe ingredients, and ingredients.
*/

import { apiFetchJson } from "./client";
import type { Allergen, Ingredient, Recipe, RecipeIngredient } from "../types";

export type RecipesListResponse = Recipe[];

export async function fetchRecipes(accessToken: string): Promise<RecipesListResponse> {
    return apiFetchJson<RecipesListResponse>("/api/recipes", {
        headers: { Authorization: `Bearer ${accessToken}` },
    });
}

export async function fetchRecipeById(recipeId: number, accessToken: string): Promise<Recipe> {
    return apiFetchJson<Recipe>(`/api/recipes/${recipeId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
    });
}

export async function createRecipe(
    data: {
        title: string;
        category: string;
        instructions?: string;
        servings: number;
        image_url?: string | null;
        image_public_id?: string | null;
    },
    accessToken: string
): Promise<Recipe> {
    return apiFetchJson<Recipe>("/api/recipes", {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
}

export async function updateRecipe(
    recipeId: number,
    data: {
        title: string;
        category: string;
        instructions?: string;
        servings: number;
        image_url?: string | null;
        image_public_id?: string | null;
    },
    accessToken: string
): Promise<Recipe> {
    return apiFetchJson<Recipe>(`/api/recipes/${recipeId}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
}

export async function uploadRecipeImage(
    file: File,
    accessToken: string,
    recipeId?: number
): Promise<{ url: string; publicId: string }> {
    const formData = new FormData();
    formData.append("image", file);

    if (recipeId) {
        formData.append("recipeId", String(recipeId));
    }

    const response = await fetch("/api/upload/recipe-image", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
        body: formData,
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
        throw new Error((data as { error?: string; message?: string }).message || (data as { error?: string }).error || `Kunne ikke laste opp bilde (${response.status})`);
    }

    return {
        url: (data as { url: string }).url,
        publicId: (data as { publicId: string }).publicId,
    };
}

export async function deleteRecipe(recipeId: number, accessToken: string): Promise<void> {
    await apiFetchJson<unknown>(`/api/recipes/${recipeId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${accessToken}` },
    });
}

// Recipe ingredients

export async function fetchRecipeIngredients(
    recipeId: number,
    accessToken: string
): Promise<RecipeIngredient[]> {
    return apiFetchJson<RecipeIngredient[]>(`/api/recipes/${recipeId}/ingredients`, {
        headers: { Authorization: `Bearer ${accessToken}` },
    });
}

export async function addRecipeIngredient(
    recipeId: number,
    data: { ingredient_id: number; quantity: number },
    accessToken: string
): Promise<RecipeIngredient> {
    return apiFetchJson<RecipeIngredient>(`/api/recipes/${recipeId}/ingredients`, {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
}

export async function deleteRecipeIngredient(recipeIngredientId: number, accessToken: string): Promise<void> {
    await apiFetchJson<unknown>(`/api/recipe-ingredients/${recipeIngredientId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${accessToken}` },
    });
}

// Ingredients

export async function fetchIngredients(accessToken: string): Promise<Ingredient[]> {
    return apiFetchJson<Ingredient[]>("/api/ingredients", {
        headers: { Authorization: `Bearer ${accessToken}` },
    });
}

export async function createIngredient(
    data: { name: string; unit: string },
    accessToken: string
): Promise<Ingredient> {
    return apiFetchJson<Ingredient>("/api/ingredients", {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
}

// Allergens

export async function fetchAllergens(accessToken: string): Promise<Allergen[]> {
    return apiFetchJson<Allergen[]>("/api/recipes/allergens", {
        headers: { Authorization: `Bearer ${accessToken}` },
    });
}

export async function setRecipeAllergens(
    recipeId: number,
    allergenIds: number[],
    accessToken: string
): Promise<Recipe> {
    return apiFetchJson<Recipe>(`/api/recipes/${recipeId}/allergens`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ allergen_ids: allergenIds }),
    });
}
