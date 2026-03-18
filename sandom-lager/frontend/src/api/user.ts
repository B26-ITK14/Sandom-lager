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
    blocked?: boolean;
    profilePicture?: string | null;
};

export async function fetchMe(accessToken: string): Promise<{ role: UserRole; name: string; blocked: boolean; profilePicture: string | null }> {
    const data = await apiFetchJson<MeResponse>("/api/me", {
        headers: { Authorization: `Bearer ${accessToken}` },
    });
    return {
        role: data.role ?? null,
        name: data.name ?? '',
        blocked: data.blocked ?? false,
        profilePicture: data.profilePicture ?? null,
    };
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

export async function updateProfilePicture(profilePicture: string, accessToken: string): Promise<string | null> {
    const response = await fetch('/api/me/profile-picture', {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ profilePicture }),
    });

    if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error((data as { message?: string }).message ?? `Kunne ikke oppdatere profilbildet (${response.status})`);
    }

    const data = await response.json().catch(() => ({}));
    return (data as { profilePicture?: string | null }).profilePicture ?? null;
}
