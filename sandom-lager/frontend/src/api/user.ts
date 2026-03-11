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
    name?: string;
};

export async function fetchMe(accessToken: string): Promise<{ role: UserRole; name: string }> {
    const data = await apiFetchJson<MeResponse>("/api/me", {
        headers: { Authorization: `Bearer ${accessToken}` },
    });
    return { role: data.role ?? null, name: data.name ?? '' };
}

/**
 * Triggers an Auth0 password reset email for the given email address.
 * Only works for users with an auth0 (username/password) connection.
 */
export async function updateName(name: string, accessToken: string): Promise<void> {
    const response = await fetch('/api/me/name', {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ name }),
    });
    if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error((data as { message?: string }).message ?? `Kunne ikke oppdatere navn (${response.status})`);
    }
}

export async function requestPasswordChange(email: string, domain: string, clientId: string): Promise<void> {
    const response = await fetch(`https://${domain}/dbconnections/change_password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            client_id: clientId,
            email,
            connection: 'Username-Password-Authentication',
        }),
    });

    if (!response.ok) {
        throw new Error(`Kunne ikke sende tilbakestillingslenke (${response.status})`);
    }
}

export async function fetchCurrentUserRole(accessToken: string): Promise<UserRole> {
    const data = await apiFetchJson<MeResponse>("/api/me", {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });

    return data.role ?? null;
}

// ----- Sessions -----

export interface SessionDevice {
    initial_ip?: string;
    last_ip?: string;
    last_user_agent?: string;
    last_interaction_at?: string;
}

export interface Auth0Session {
    id: string;
    created_at: string;
    updated_at: string;
    last_interaction_at?: string;
    device?: SessionDevice;
    clients?: { client_id: string; name?: string }[];
}

export async function fetchSessions(accessToken: string): Promise<Auth0Session[]> {
    const data = await apiFetchJson<{ sessions: Auth0Session[] }>("/api/me/sessions", {
        headers: { Authorization: `Bearer ${accessToken}` },
    });
    return data?.sessions ?? [];
}

export async function revokeSession(sessionId: string, accessToken: string): Promise<void> {
    const response = await fetch(`/api/me/sessions/${encodeURIComponent(sessionId)}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!response.ok && response.status !== 204) {
        throw new Error(`Kunne ikke avslutte sesjon (${response.status})`);
    }
}


export async function requestEmailChange(newEmail: string, accessToken: string): Promise<void> {
    const response = await fetch('/api/me/email', {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ email: newEmail }),
    });
    if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error((data as { message?: string }).message ?? `Kunne ikke oppdatere e-post (${response.status})`);
    }
}
