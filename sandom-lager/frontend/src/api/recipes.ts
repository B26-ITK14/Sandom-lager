/*
    * recipes.ts
    * API functions for interacting with the recipes-related endpoints of the backend API, such as fetching recipe lists and details.
    * This file serves as a single source of truth for all recipes-related API calls, ensuring consistent handling of authentication and error management across the frontend application.
*/

import { apiFetchJson } from "./client";
import type { Recipe, RecipeIngredient } from "../types";

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

export async function fetchRecipeIngredients(
    recipeId: number,
    accessToken: string
): Promise<RecipeIngredient[]> {
    return apiFetchJson<RecipeIngredient[]>(`/api/recipes/${recipeId}/ingredients`, {
        headers: { Authorization: `Bearer ${accessToken}` },
    });
}
