/*
    * recipes.ts
    * API functions for interacting with recipe-related endpoints of the backend API.
    * Covers recipes, recipe ingredients, and ingredients.
*/

import { apiFetchJson } from "./client";
import type { Ingredient, Recipe, RecipeIngredient } from "../types";

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
    data: { title: string; category: string; instructions?: string; servings: number },
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
    data: { title: string; category: string; instructions?: string; servings: number },
    accessToken: string
): Promise<Recipe> {
    return apiFetchJson<Recipe>(`/api/recipes/${recipeId}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
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
