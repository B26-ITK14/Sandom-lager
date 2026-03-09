/*
    * auth.ts
    * Centralized configuration for authentication-related constants, such as Auth0 audience and scopes.
    * This file serves as a single source of truth for authentication parameters used across the frontend application.
 */

import { env } from "./env";

export const AUTH0_AUDIENCE = env.VITE_AUTH0_AUDIENCE;
export const AUTH0_SCOPE = "openid profile email username";
