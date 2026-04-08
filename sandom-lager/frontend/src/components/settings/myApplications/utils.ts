/*
    * utils.ts
    * Presentation utilities for My Applications status and date formatting.
*/

import {
    ACCESS_STATUS_LABELS,
    ACCESS_STATUS_STYLES,
    type AccessStatus,
} from "../../../constants/accessStatus";

export function statusLabel(status: AccessStatus): string {
    return ACCESS_STATUS_LABELS[status];
}

export function statusStyle(status: AccessStatus): { bg: string; text: string } {
    return ACCESS_STATUS_STYLES[status];
}

export function formatRequestedAt(iso: string | null): string {
    if (!iso) return "Ukjent tidspunkt";

    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return "Ukjent tidspunkt";

    return new Intl.DateTimeFormat("nb-NO", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(date);
}
