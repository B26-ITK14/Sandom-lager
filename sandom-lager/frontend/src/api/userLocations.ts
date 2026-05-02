/*
    * userLocations.ts
    * API-funksjoner for håndtering av lokasjoner og tilgangssøknader.
*/

import type { UserLocationResponse } from "../types";
import { notifyAdminsOfAccessRequest } from "./notifications";

export async function fetchLocations(token: string) {
    const res = await fetch("/api/locations", {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Feil ved henting av lokasjoner");
    return res.json();
}

export async function requestLocationAccess(token: string, locationId: number): Promise<void> {
    const res = await fetch("/api/user-locations/request", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ location_id: locationId }),
    });
    if (!res.ok) throw new Error("Søknad feilet");

    try {
        await notifyAdminsOfAccessRequest(token, locationId);
    } catch (error) {
        console.warn("Could not notify admins about access request", error);
    }
}

export async function fetchMyLocationAccess(token: string): Promise<UserLocationResponse[]> {
    const res = await fetch("/api/user-locations/me", {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Feil ved henting av søknadsstatus");
    return res.json();
}