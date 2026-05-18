/*
    * env.ts
    * Centralized configuration for environment variables used in the frontend application.
    * Provides a type-safe way to access required environment variables and ensures that missing variables are caught at startup.
    * In development mode, Auth0 env vars are optional and default to demo values for local Docker testing.
    * In production, all required env vars must be set at build time via Vite/Cloudflare Pages environment variables.
    * Author: Emil Berglund
*/

// Check if we're in development mode
const isDev = import.meta.env.MODE === 'development';

// In development, allow missing Auth0 env vars with demo values for local Docker testing
// In production, these must be set at build time via Vite/Cloudflare Pages environment variables
const authDomain = import.meta.env.VITE_AUTH0_DOMAIN || (isDev ? 'dev.auth0.com' : undefined);
const authClientId = import.meta.env.VITE_AUTH0_CLIENT_ID || (isDev ? 'dev-client-id' : undefined);

if (!authDomain && !isDev) {
    throw new Error('[env] Missing VITE_AUTH0_DOMAIN in production build');
}
if (!authClientId && !isDev) {
    throw new Error('[env] Missing VITE_AUTH0_CLIENT_ID in production build');
}

export const env = {
    VITE_AUTH0_DOMAIN: authDomain || 'dev.auth0.com',
    VITE_AUTH0_CLIENT_ID: authClientId || 'dev-client-id',
    VITE_AUTH0_AUDIENCE: import.meta.env.VITE_AUTH0_AUDIENCE || "https://sandom-api",
    VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL || "",
} as const;
