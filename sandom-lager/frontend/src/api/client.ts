/*
    * client.ts
    * A utility module that provides a wrapper around the Fetch API for making HTTP requests to the backend API.
    * It includes error handling and a custom error class (ApiError) to standardize error responses from the API.
 */

export class ApiError extends Error {
    status: number;

    constructor(status: number, message: string) {
        super(message);
        this.name = "ApiError";
        this.status = status;
    }
}

export async function apiFetchJson<T>(path: string, init?: RequestInit): Promise<T> {
    const response = await fetch(path, init);

    if (!response.ok) {
        throw new ApiError(response.status, `API request failed (${response.status})`);
    }

    return response.json() as Promise<T>;
}
