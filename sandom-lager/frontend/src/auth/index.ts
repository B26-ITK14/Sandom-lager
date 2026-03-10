/*
    * index.ts
    * The main entry point for the authentication module, which re-exports all authentication-related components, hooks, and utilities.
    * This file serves as a single source of truth for importing authentication functionality across the frontend application.
 */

export { default as ProtectedRoute } from "./ProtectedRoute";
export { useAppLogout } from "./useAppLogout";
export { LogoutLoadingOverlay } from "./LogoutLoadingOverlay";
