/*
    * index.ts
    * Type definitions for the frontend application, including user roles, route information, and data models for recipes, ingredients, shopping list items, and inventory items.
    * This file serves as a central location for all type definitions used across the frontend codebase, ensuring consistency and type safety.
*/

import type { RouteNickname } from "../router/routes";

export type UserRole = "admin" | "manager" | "user" | null;

export interface Route {
    nickname: RouteNickname;
    path: string;
    displayName: string;
}

export interface User {
    id: number;
    auth0_id: string;
    email: string;
    name: string | null;
    role: UserRole;
    created_at: string;
}

export interface Recipe {
    id: number;
    location_id: number;
    title: string;
    category: string;
    instructions: string | null;
    servings: number;
    created_at: string;
}

export type WeightUnit = "mg" | "g" | "hg" | "kg";
export type VolumeUnit = "ml" | "cl" | "dl" | "l";
export type SpoonUnit = "krm" | "tsk" | "ss";
export type CountUnit = "stk" | "pk" | "pose" | "boks" | "glass" | "flaske";
export type IngredientUnit = WeightUnit | VolumeUnit | SpoonUnit | CountUnit;

export const WEIGHT_UNITS: readonly WeightUnit[] = ["mg", "g", "hg", "kg"];
export const VOLUME_UNITS: readonly VolumeUnit[] = ["ml", "cl", "dl", "l"];
export const SPOON_UNITS: readonly SpoonUnit[] = ["krm", "tsk", "ss"];
export const COUNT_UNITS: readonly CountUnit[] = ["stk", "pk", "pose", "boks", "glass", "flaske"];
export const INGREDIENT_UNITS: readonly IngredientUnit[] = [
    ...WEIGHT_UNITS,
    ...VOLUME_UNITS,
    ...SPOON_UNITS,
    ...COUNT_UNITS,
];

export const RECIPE_CATEGORIES = [
    "Frokost",
    "Lunsj",
    "Middag",
    "Mellommåltid",
    "Kveldsmat",
] as const;

export type RecipeCategory = typeof RECIPE_CATEGORIES[number];

export interface Ingredient {
    id: number;
    name: string;
    unit: IngredientUnit;
}

export interface RecipeIngredient {
    id: number;
    recipe_id: number;
    ingredient_id: number;
    quantity: number;
    ingredient_name: string;
    unit: IngredientUnit;
}

export interface ShoppingListItem {
    id: number;
    location_id: number;
    ingredient_id: number;
    needed_quantity: number;
    created_at: string;
}

export interface InventoryItem {
    id: number;
    ingredient: string;
    quantity: number;
    unit: IngredientUnit;
    location: string;
}

export interface UserLocationResponse {
    id: number;
    access_status: "pending" | "approved" | "denied";
    created_at: string;
    user_name: string;
    email: string;
    location_name: string;
}
