/*
    * nav.ts
    * Utility functions for handling navigation and route information in the frontend application.
    * This file provides helper functions to retrieve route information based on path or nickname, as well as functions to get display names and lists of routes for use in navigation components.
*/

import { ROUTES } from "./routes";
import type { Route } from "../types";

export const getRouteByPath = (path: string): Route | undefined => {
    return Object.values(ROUTES).find((route) => route.path === path);
};

export const getRouteByNickname = (nickname: string): Route | undefined => {
    return Object.values(ROUTES).find((route) => route.nickname === nickname);
};

export const getDisplayName = (path: string): string => {
    const route = getRouteByPath(path);
    return route?.displayName || "Dashboard";
};

export const getAllRoutes = (): Route[] => {
    return Object.values(ROUTES);
};

export const getAllMainRoutes = (): Route[] => {
    const allowedNicknames = ["dashboard", "shopping-list", "storage", "recipes", "settings"];
    return Object.values(ROUTES).filter((route) => allowedNicknames.includes(route.nickname));
};