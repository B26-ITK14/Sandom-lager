/*
    * routes.ts
    * Centralized route configuration for the application.
    * Provides consistent routing with nicknames, absolute URLs, and display names.
    * Author: Emil Berglund
*/

export interface Route {
    nickname: string;
    path: string;
    displayName: string;
}

export const ROUTES: Record<string, Route> = {
    DASHBOARD: {
        nickname: 'dashboard',
        path: '/',
        displayName: 'Dashbord',
    },
    SHOPPING_LIST: {
        nickname: 'shopping-list',
        path: '/shopping-list',
        displayName: 'Handleliste',
    },
    STORAGE: {
        nickname: 'storage',
        path: '/storage',
        displayName: 'Lager',
    },
    RECIPES: {
        nickname: 'recipes',
        path: '/recipes',
        displayName: 'Oppskrifter',
    },
    SETTINGS: {
        nickname: 'settings',
        path: '/settings',
        displayName: 'Innstillinger',
    },
    SETTINGS_ACCOUNT: {
        nickname: 'settings-account',
        path: '/settings/account',
        displayName: 'Min konto',
    },
    SETTINGS_APPLICATIONS: {
        nickname: 'settings-applications',
        path: '/settings/applications',
        displayName: 'Mine søknader',
    },
    SETTINGS_APP_SETTINGS: {
        nickname: 'settings-app-settings',
        path: '/settings/app-settings',
        displayName: 'App innstillinger',
    },

    // ------------ Admin --------------//
    ADMIN: {
        nickname: 'admin',
        path: '/admin',
        displayName: 'Admin',
    },
    REQUEST_ACCESS: {
        nickname: 'request-access',
        path: '/request-access',
        displayName: 'Søk om tilgang',
    },
    PENDING_APPROVAL: {
        nickname: 'pending-approval',
        path: '/pending-approval',
        displayName: 'Venter på godkjenning',
    },

} as const;

// Helper function to get route by path
export const getRouteByPath = (path: string): Route | undefined => {
    return Object.values(ROUTES).find(route => route.path === path);
};

// Helper function to get route by nickname
export const getRouteByNickname = (nickname: string): Route | undefined => {
    return Object.values(ROUTES).find(route => route.nickname === nickname);
};

// Helper function to get display name by path
export const getDisplayName = (path: string): string => {
    const route = getRouteByPath(path);
    return route?.displayName || 'Dashboard';
};

// Helper function to get all routes as array
export const getAllRoutes = (): Route[] => {
    return Object.values(ROUTES);
};

// ----- Oppdatert getAllmainRoutes -------
// Helper function to get all MAIN routes (excluding sub-routes)
export const getAllMainRoutes = (): Route[] => {
    return Object.values(ROUTES).filter(
        route =>
            !route.path.includes('/settings/') &&
            !route.path.includes('/admin') &&
            !route.path.includes('/request-access') &&
            !route.path.includes('/pending-approval')
    );
}

// Type for route nicknames (useful for TypeScript)
export type RouteNickname = typeof ROUTES[keyof typeof ROUTES]['nickname'];
