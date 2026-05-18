/*
    * utils.ts
    * Utility functions for reading and saving user preferences in localStorage, as well as type definitions for settings options.
    * These functions are used across various settings cards to persist user preferences and apply them immediately.
    * The readPref function retrieves a preference value from localStorage, returning a fallback value if the key is not found or if parsing fails. The savePref function saves a preference value to localStorage after stringifying it.
    * Author: Emil Berglund
*/

export type FontSize = 'small' | 'medium' | 'large';
export type Language = 'nb' | 'en';

export function readPref<T>(key: string, fallback: T): T {
    try {
        const v = localStorage.getItem(key);
        return v !== null ? (JSON.parse(v) as T) : fallback;
    } catch {
        return fallback;
    }
}

export function savePref(key: string, value: unknown) {
    localStorage.setItem(key, JSON.stringify(value));
}
