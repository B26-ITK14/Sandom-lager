/*
    * userLocations.ts
    * API-funksjoner for håndtering av lokasjoner og tilgangssøknader.
*/

import type { UserLocationResponse } from "../types";
import { notifyAdminsOfAccessRequest } from "./notifications";
import { apiUrl } from "./client";

export async function fetchLocations(token: string) {
    const res = await fetch(apiUrl("/api/locations"), {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Feil ved henting av lokasjoner");
    return res.json();
}

export async function requestLocationAccess(token: string, locationId: number): Promise<void> {
    const res = await fetch(apiUrl("/api/user-locations/request"), {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ location_id: locationId }),
    });
    if (!res.ok) {
        let errorMessage = "Søknad feilet";
        let errorCode: string | undefined;
        let errorDetail: string | undefined;

        try {
            const responseText = await res.text();
            const errorData = responseText ? JSON.parse(responseText) as {
                message?: string;
                code?: string;
                detail?: string;
            } : null;

            errorMessage = errorData?.message || responseText || "Søknad feilet";
            errorCode = errorData?.code;
            errorDetail = errorData?.detail;
        } catch {
            // Could not parse error response, use default message
        }

        const error = new Error(errorMessage) as Error & { code?: string };
        error.code = errorCode;
        if (errorDetail) {
            error.message = `${error.message} ${errorDetail}`;
        }
        throw error;
    }

    try {
        await notifyAdminsOfAccessRequest(token, locationId);
    } catch (error) {
        console.warn("Could not notify admins about access request", error);
    }
}

export async function fetchMyLocationAccess(token: string): Promise<UserLocationResponse[]> {
    const res = await fetch(apiUrl("/api/user-locations/me"), {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Feil ved henting av søknadsstatus");
    return res.json();
}