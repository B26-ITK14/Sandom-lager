/*
    * user.ts
    * API client module for user-related operations, such as fetching the current user's role.
    * This module abstracts away the details of making authenticated requests to the backend API and provides type-safe functions for user data retrieval.
*/

import { apiFetchJson } from "./client";
import { apiUrl } from "./client";
import type { UserRole } from "../types";

export type { UserRole };

type MeResponse = {
    role?: UserRole;
    name?: string;
    username?: string | null;
    blocked?: boolean;
    profilePicture?: string | null;
    location?: string | null;
};

export async function fetchMe(accessToken: string): Promise<{ role: UserRole; name: string; username: string | null; blocked: boolean; profilePicture: string | null; location: string | null }> {
    const data = await apiFetchJson<MeResponse>("/api/me", {
        headers: { Authorization: `Bearer ${accessToken}` },
    });
    return {
        role: data.role ?? null,
        name: data.name ?? '',
        username: data.username ?? null,
        blocked: data.blocked ?? false,
        profilePicture: data.profilePicture ?? null,
        location: data.location ?? null,
    };
}

/**
 * Triggers an Auth0 password reset email for the given email address.
 * Only works for users with an auth0 (username/password) connection.
 */
export async function updateName(name: string, accessToken: string): Promise<void> {
    const response = await fetch(apiUrl('/api/me/name'), {
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

export async function updateUsername(username: string, accessToken: string): Promise<string | null> {
    const response = await fetch(apiUrl('/api/me/username'), {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ username }),
    });

    if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error((data as { message?: string }).message ?? `Kunne ikke oppdatere brukernavn (${response.status})`);
    }

    const data = await response.json().catch(() => ({}));
    return (data as { username?: string | null }).username ?? null;
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

export async function updateNotificationPreferences(
    preferences: {
        notifyInventory?: boolean;
        notifyRecipes?: boolean;
        notifySystem?: boolean;
    },
    accessToken: string
): Promise<{ notifyInventory: boolean; notifyRecipes: boolean; notifySystem: boolean }> {
    const response = await fetch(apiUrl('/api/me/notification-preferences'), {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(preferences),
    });

    if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error((data as { message?: string }).message ?? `Kunne ikke oppdatere varslepreferanser (${response.status})`);
    }

    return response.json();
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
    is_current?: boolean;
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
    const response = await fetch(apiUrl(`/api/me/sessions/${encodeURIComponent(sessionId)}`), {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!response.ok && response.status !== 204) {
        throw new Error(`Kunne ikke avslutte sesjon (${response.status})`);
    }
}

export async function revokeOtherSessions(accessToken: string): Promise<number> {
    const response = await fetch(apiUrl('/api/me/sessions/others'), {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
        throw new Error(`Kunne ikke avslutte andre sesjoner (${response.status})`);
    }

    const data = await response.json().catch(() => ({}));
    return (data as { revoked?: number }).revoked ?? 0;
}


export async function requestEmailChange(newEmail: string, accessToken: string): Promise<void> {
    const response = await fetch(apiUrl('/api/me/email'), {
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

export async function updateProfilePicture(file: File, accessToken: string): Promise<string | null> {
    const formData = new FormData();
    formData.append('profilePicture', file);

    const response = await fetch(apiUrl('/api/me/profile-picture'), {
        method: 'PATCH',
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
        body: formData,
    });

    if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error((data as { message?: string }).message ?? `Kunne ikke oppdatere profilbildet (${response.status})`);
    }

    const data = await response.json().catch(() => ({}));
    return (data as { profilePicture?: string | null }).profilePicture ?? null;
}
