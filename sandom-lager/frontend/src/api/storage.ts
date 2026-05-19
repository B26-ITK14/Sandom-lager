/*
    * storage.ts
    * API functions for interacting with the storage-related endpoints of the backend API, such as fetching inventory and shopping list data.
    * This file serves as a single source of truth for all storage-related API calls, ensuring consistent handling of authentication and error management across the frontend application.
    * Author: Ida Tollaksen
*/

import { apiFetchJson } from "./client";
import type { IngredientUnit, InventoryItem, ShoppingListHistoryRow, ShoppingListItem } from "../types";

type CreateInventoryPayload = {
    ingredient_id: number;
    location_id: number;
    quantity: number;
};

export async function fetchInventory(accessToken: string): Promise<InventoryItem[]> {
    const data = await apiFetchJson<InventoryItem[]>("/api/inventory", {
        headers: { Authorization: `Bearer ${accessToken}` },
    });

    return data.map((item) => ({
        ...item,
        id: Number(item.id),
        location_id: Number(item.location_id),
        ingredient_id: Number(item.ingredient_id),
        quantity: Number(item.quantity),
    }));
}

export async function fetchShoppingList(accessToken: string): Promise<ShoppingListItem[]> {
    const data = await apiFetchJson<ShoppingListItem[]>("/api/shopping-list", {
        headers: { Authorization: `Bearer ${accessToken}` },
    });

    return data.map((item) => ({
        ...item,
        id: Number(item.id),
        ingredient_id: Number(item.ingredient_id),
        needed_quantity: Number(item.needed_quantity),
        stock_quantity: Number(item.stock_quantity),
    }));
}

interface AddShoppingListPayload {
    ingredient_id?: number;
    ingredient_name?: string;
    needed_quantity: number;
    unit?: IngredientUnit;
}

export async function addToShoppingList(
    payload: AddShoppingListPayload,
    accessToken: string
): Promise<ShoppingListItem> {
    return apiFetchJson<ShoppingListItem>("/api/shopping-list", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });
}

interface UpdateShoppingListPayload {
    needed_quantity?: number;
    unit?: IngredientUnit;
}

export async function updateShoppingListItem(
    id: number,
    payload: UpdateShoppingListPayload,
    accessToken: string
): Promise<ShoppingListItem> {
    return apiFetchJson<ShoppingListItem>(`/api/shopping-list/${id}`, {
        method: "PUT",
        headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });
}

export async function removeFromShoppingList(
    id: number,
    accessToken: string
): Promise<{ message: string; deleted: ShoppingListItem }> {
    return apiFetchJson<{ message: string; deleted: ShoppingListItem }>(`/api/shopping-list/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${accessToken}` },
    });
}

export async function clearShoppingList(
    accessToken: string
): Promise<{ message: string; deletedCount: number }> {
    return apiFetchJson<{ message: string; deletedCount: number }>("/api/shopping-list", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${accessToken}` },
    });
}

export async function generateShoppingListFromRecipes(
    recipeIds: number[],
    people: number,
    accessToken: string
): Promise<{ message: string; recipeCount: number; itemCount: number }> {
    return apiFetchJson<{ message: string; recipeCount: number; itemCount: number }>("/api/shopping-list/generate", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ recipe_ids: recipeIds, people }),
    });
}

export async function fetchShoppingListHistory(accessToken: string): Promise<ShoppingListHistoryRow[]> {
    const data = await apiFetchJson<ShoppingListHistoryRow[]>("/api/shopping-list/history", {
        headers: { Authorization: `Bearer ${accessToken}` },
    });

    return data.map((row) => ({
        ...row,
        batch_id: Number(row.batch_id),
        deleted_by_user_id: row.deleted_by_user_id === null ? null : Number(row.deleted_by_user_id),
        action_type: row.action_type,
        ingredient_id: row.ingredient_id === null ? null : Number(row.ingredient_id),
        needed_quantity: Number(row.needed_quantity),
        stock_quantity: Number(row.stock_quantity),
    }));
}

export async function updateInventoryQuantity(
    inventoryId: number,
    quantity: number,
    accessToken: string
): Promise<void> {
    await apiFetchJson(`/api/inventory/${inventoryId}`, {
        method: "PUT",
        headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ quantity }),
    });
}

export async function createInventory(
    data: CreateInventoryPayload,
    accessToken: string
): Promise<void> {
    await apiFetchJson("/api/inventory", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });
}

export async function deleteInventoryItem(
    inventoryId: number,
    accessToken: string
): Promise<void> {
    await apiFetchJson(`/api/inventory/${inventoryId}`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
        },
    });
}

// Favorites API
// The functions bellow interact with the favorites endpoints of the backend API
// Allowing the frontend to fetch, add, and remove favorite inventory items for the current user.
export async function fetchFavorites(accessToken: string): Promise<number[]> {
    return apiFetchJson<number[]>('/api/user/favorites', {
        headers: { Authorization: `Bearer ${accessToken}` },
    });
}

export async function addFavorite(inventoryId: number, accessToken: string): Promise<{ inventory_id: number } | { message: string } > {
    return apiFetchJson(`/api/user/favorites/${inventoryId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}` },
    });
}

export async function removeFavorite(inventoryId: number, accessToken: string): Promise<{ inventory_id: number }> {
    return apiFetchJson(`/api/user/favorites/${inventoryId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${accessToken}` },
    });
}
