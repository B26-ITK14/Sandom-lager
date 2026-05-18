/*
 * sessionUtils.ts
 * Utility functions for parsing and formatting session/device data in ActiveSessionsPanel.
 * Includes functions to parse user agent strings, determine device icons, and format session timestamps.
 * Is used by ActiveSessionsPanel.tsx in the Security & Privacy section of the account settings page.
 * Author: Emil Berglund
 */

import { Monitor, Smartphone, Tablet } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export function parseUserAgent(ua?: string): { browser: string; os: string } {
    if (!ua) return { browser: "Ukjent nettleser", os: "Ukjent OS" };

    let browser = "Ukjent nettleser";
    if (ua.includes("Edg/")) browser = "Edge";
    else if (ua.includes("OPR/") || ua.includes("Opera")) browser = "Opera";
    else if (ua.includes("Chrome/") && !ua.includes("Chromium"))
        browser = "Chrome";
    else if (ua.includes("Firefox/")) browser = "Firefox";
    else if (ua.includes("Safari/") && !ua.includes("Chrome")) browser = "Safari";
    else if (ua.includes("Chromium")) browser = "Chromium";

    let os = "Ukjent OS";
    if (ua.includes("iPhone") || ua.includes("iPad"))
        os = ua.includes("iPad") ? "iPadOS" : "iOS";
    else if (ua.includes("Android")) os = "Android";
    else if (ua.includes("Windows")) os = "Windows";
    else if (ua.includes("Mac OS X")) os = "macOS";
    else if (ua.includes("Linux")) os = "Linux";

    return { browser, os };
}

export function getDeviceIcon(ua?: string): LucideIcon {
    if (!ua) return Monitor;
    if (
        ua.includes("iPhone") ||
        (ua.includes("Android") && !ua.includes("Tablet"))
    )
        return Smartphone;
    if (ua.includes("iPad") || ua.includes("Tablet")) return Tablet;
    return Monitor;
}

export function formatRelative(dateStr?: string): string {
    if (!dateStr) return "Ukjent";
    const diff = Date.now() - new Date(dateStr).getTime();
    const minutes = Math.floor(diff / 60_000);
    if (minutes < 2) return "Akkurat nå";
    if (minutes < 60) return `${minutes} min siden`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} t siden`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days} d siden`;
    return new Date(dateStr).toLocaleDateString("nb-NO", {
        day: "numeric",
        month: "short",
    });
}
