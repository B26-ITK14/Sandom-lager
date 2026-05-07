/*
    * types.ts
    * Shared types for the My Applications settings domain.
*/

import type { AccessStatus } from "../../../constants/accessStatus";
export type { AccessStatus } from "../../../constants/accessStatus";

export type MyApplication = {
    id: string;
    locationId: number;
    locationName: string;
    accessStatus: AccessStatus;
    requestedAt: string | null;
};

export type LocationOption = {
    id: number;
    name: string;
};
