/*
    * client.ts
    * A utility module that provides a wrapper around the Fetch API for making HTTP requests to the backend API.
    * It includes error handling and a custom error class (ApiError) to standardize error responses from the API.
 */

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ?? "";

    export function apiUrl(path: string): string {
        return `${API_BASE_URL}${path}`;
    }

export class ApiError extends Error {
    status: number;
    detail?: string;

    constructor(status: number, message: string, detail?: string) {
        super(message);
        this.name = "ApiError";
        this.status = status;
        this.detail = detail;
    }
}

export async function apiFetchJson<T>(path: string, init?: RequestInit): Promise<T> {
    const response = await fetch(apiUrl(path), init);

    if (!response.ok) {
        let errorDetail: string | undefined;
        
        // Try to get detailed error message from response body
        try {
            const errorBody = await response.json() as Record<string, unknown>;
            errorDetail = (errorBody.detail || errorBody.message) as string;
        } catch {
            // If response is not JSON, ignore
        }

        throw new ApiError(response.status, `API request failed (${response.status})`, errorDetail);
    }

    if (response.status === 204) return undefined as T;

    return response.json() as Promise<T>;
}
