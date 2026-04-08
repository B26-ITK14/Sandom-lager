/*
    * accessStatus.ts
    * Global access-status types and presentation metadata used across the app.
*/

export type AccessStatus = "pending" | "approved" | "denied";

export const ACCESS_STATUS = {
    PENDING: "pending",
    APPROVED: "approved",
    DENIED: "denied",
} as const;

export const ACCESS_STATUS_VALUES: readonly AccessStatus[] = [
    ACCESS_STATUS.PENDING,
    ACCESS_STATUS.APPROVED,
    ACCESS_STATUS.DENIED,
];

export const ACCESS_STATUS_LABELS: Record<AccessStatus, string> = {
    pending: "Under behandling",
    approved: "Godkjent",
    denied: "Avslått",
};

export const ACCESS_STATUS_STYLES: Record<AccessStatus, { bg: string; text: string }> = {
    pending: { bg: "#FEF9C3", text: "#854D0E" },
    approved: { bg: "#DCFCE7", text: "#166534" },
    denied: { bg: "#FEE2E2", text: "#991B1B" },
};
