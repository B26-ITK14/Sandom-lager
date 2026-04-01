/*
    * storage.ts
    * API functions for interacting with the storage-related endpoints of the backend API, such as fetching inventory and shopping list data.
    * This file serves as a single source of truth for all storage-related API calls, ensuring consistent handling of authentication and error management across the frontend application.
*/

import { apiFetchJson } from "./client";
import type { InventoryItem, ShoppingListItem } from "../types";

export async function fetchInventory(accessToken: string): Promise<InventoryItem[]> {
    return apiFetchJson<InventoryItem[]>("/api/inventory", {
        headers: { Authorization: `Bearer ${accessToken}` },
    });
}

export async function fetchShoppingList(accessToken: string): Promise<ShoppingListItem[]> {
    return apiFetchJson<ShoppingListItem[]>("/api/shopping-list", {
        headers: { Authorization: `Bearer ${accessToken}` },
    });
}

export async function addToShoppingList(
    itemId: number,
    quantity: number,
    accessToken: string
): Promise<ShoppingListItem> {
    return apiFetchJson<ShoppingListItem>("/api/shopping-list", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ ingredient_id: itemId, needed_quantity: quantity }),
    });
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
