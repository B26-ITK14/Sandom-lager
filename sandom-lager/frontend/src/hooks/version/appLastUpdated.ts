/*
    * appLastUpdated.ts
    * Custom React hook for exposing app last-updated metadata.
    * Reads from VITE_APP_LAST_UPDATED and formats it for display.
    * If the environment variable is missing or invalid, it provides sensible fallbacks.
    * Author: Emil Berglund
*/

export interface AppLastUpdatedInfo {
    raw: string | null;
    display: string;
}

export function useAppLastUpdated(): AppLastUpdatedInfo {
    const raw = import.meta.env.VITE_APP_LAST_UPDATED ?? null;

    if (!raw) {
        return {
            raw: null,
            display: "Ikke tilgjengelig",
        };
    }

    const parsedDate = new Date(raw);
    if (Number.isNaN(parsedDate.getTime())) {
        return {
            raw,
            display: raw,
        };
    }

    return {
        raw,
        display: new Intl.DateTimeFormat("nb-NO", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        }).format(parsedDate),
    };
}
