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

// Type for route nicknames (useful for TypeScript)
export type RouteNickname = typeof ROUTES[keyof typeof ROUTES]['nickname'];
