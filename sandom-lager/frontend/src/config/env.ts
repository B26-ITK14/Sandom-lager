/*
    * env.ts
    * Centralized configuration for environment variables used in the frontend application.
    * Provides a type-safe way to access required environment variables and ensures that missing variables are caught at startup.
*/

function requireEnv(key: "VITE_AUTH0_DOMAIN" | "VITE_AUTH0_CLIENT_ID"): string {
    const value = import.meta.env[key];

    if (!value) {
        // Build a helpful error that lists all missing required VITE_ variables.
        // Find other required keys (expand here if needed).
        const requiredKeys = ["VITE_AUTH0_DOMAIN", "VITE_AUTH0_CLIENT_ID"];
        const missing = requiredKeys.filter((k) => !import.meta.env[k as keyof ImportMetaEnv]);

        const guidance = `Missing required environment variable(s): ${missing.join(", ")}.\n` +
            `Set them in your build environment (Cloudflare Pages / Vite) as VITE_... variables and rebuild the site.`;

        // Throw a single, clear error instead of one-per-key to make debugging easier in production logs.
        throw new Error(`[env] ${guidance}`);
    }

    return value;
}

export const env = {
    VITE_AUTH0_DOMAIN: requireEnv("VITE_AUTH0_DOMAIN"),
    VITE_AUTH0_CLIENT_ID: requireEnv("VITE_AUTH0_CLIENT_ID"),
    VITE_AUTH0_AUDIENCE: import.meta.env.VITE_AUTH0_AUDIENCE || "https://sandom-api",
    VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL || "",
} as const;
