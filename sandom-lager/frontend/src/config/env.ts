/*
    * env.ts
    * Centralized configuration for environment variables used in the frontend application.
    * Provides a type-safe way to access required environment variables and ensures that missing variables are caught at startup.
*/

function requireEnv(key: "VITE_AUTH0_DOMAIN" | "VITE_AUTH0_CLIENT_ID"): string {
    const value = import.meta.env[key];

    if (!value) {
        throw new Error(`[env] Missing required environment variable: ${key}`);
    }

    return value;
}

export const env = {
    VITE_AUTH0_DOMAIN: requireEnv("VITE_AUTH0_DOMAIN"),
    VITE_AUTH0_CLIENT_ID: requireEnv("VITE_AUTH0_CLIENT_ID"),
    VITE_AUTH0_AUDIENCE: import.meta.env.VITE_AUTH0_AUDIENCE || "https://sandom-api",
} as const;
