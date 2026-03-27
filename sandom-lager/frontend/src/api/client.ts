/*
    * client.ts
    * A utility module that provides a wrapper around the Fetch API for making HTTP requests to the backend API.
    * It includes error handling and a custom error class (ApiError) to standardize error responses from the API.
 */

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
    const method = init?.method ?? 'GET';
    console.log(`[API] ${method} ${path}`);

    const response = await fetch(path, init);

    if (!response.ok) {
        let errorDetail: string | undefined;
        
        // Try to get detailed error message from response body
        try {
            const errorBody = await response.json() as Record<string, unknown>;
            errorDetail = (errorBody.detail || errorBody.message) as string;
        } catch {
            // If response is not JSON, ignore
        }

        console.error(`[API] ${method} ${path} → ${response.status} ${response.statusText}`);
        throw new ApiError(response.status, `API request failed (${response.status})`, errorDetail);
    }

    console.log(`[API] ${method} ${path} → ${response.status} OK`);
    return response.json() as Promise<T>;
}
