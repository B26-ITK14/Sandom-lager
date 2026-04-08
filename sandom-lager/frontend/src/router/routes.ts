/*
    * routes.ts
    * Centralized definition of all routes used in the frontend application, including their paths, display names, and unique nicknames.
    * This file serves as a single source of truth for route information, making it easier to manage navigation and ensure consistency across the application.
*/

import type { Route } from "../types";

export type RouteNickname =
    | "dashboard"
    | "shopping-list"
    | "storage"
    | "recipes"
    | "settings"
    | "settings-account"
    | "settings-applications"
    | "settings-app-settings"
    | "settings-about"
    | "request-access"
    | "pending-approval"
    | "admin";

export const ROUTES: Record<string, Route> = {
    DASHBOARD: {
        nickname: "dashboard",
        path: "/",
        displayName: "Dashbord",
    },
    SHOPPING_LIST: {
        nickname: "shopping-list",
        path: "/shopping-list",
        displayName: "Handleliste",
    },
    STORAGE: {
        nickname: "storage",
        path: "/storage",
        displayName: "Lager",
    },
    RECIPES: {
        nickname: "recipes",
        path: "/recipes",
        displayName: "Oppskrifter",
    },
    SETTINGS: {
        nickname: "settings",
        path: "/settings",
        displayName: "Innstillinger",
    },
    SETTINGS_ACCOUNT: {
        nickname: "settings-account",
        path: "/settings/account",
        displayName: "Min konto",
    },
    SETTINGS_APPLICATIONS: {
        nickname: "settings-applications",
        path: "/settings/applications",
        displayName: "Mine søknader",
    },
    SETTINGS_APP_SETTINGS: {
        nickname: "settings-app-settings",
        path: "/settings/app-settings",
        displayName: "App innstillinger",
    },
    SETTINGS_ABOUT: {
        nickname: "settings-about",
        path: "/settings/about",
        displayName: "Om Sandom Lager",
    },
    REQUEST_ACCESS: {
        nickname: "request-access",
        path: "/request-access",
        displayName: "Søk om tilgang",
    },
    PENDING_APPROVAL: {
        nickname: "pending-approval",
        path: "/pending-approval",
        displayName: "Venter på godkjenning",
    },
    ADMIN: {
        nickname: "admin",
        path: "/admin",
        displayName: "Admin",
    },
} as const;
