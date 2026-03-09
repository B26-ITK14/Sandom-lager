/*
    * user.ts
    * API client module for user-related operations, such as fetching the current user's role.
    * This module abstracts away the details of making authenticated requests to the backend API and provides type-safe functions for user data retrieval.
*/

import { apiFetchJson } from "./client";
import type { UserRole } from "../types";

export type { UserRole };

type MeResponse = {
    role?: UserRole;
};

export async function fetchCurrentUserRole(accessToken: string): Promise<UserRole> {
    const data = await apiFetchJson<MeResponse>("/api/me", {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });

    return data.role ?? null;
}
