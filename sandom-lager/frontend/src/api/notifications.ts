import { apiFetchJson } from "./client";
import type { Notification } from "../components/notifications";

type NotificationDto = {
    id: number;
    type: "warning" | "info" | "alert";
    title: string;
    message: string;
    location_nickname: Notification["locationNickname"] | null;
    is_read: boolean;
    created_at: string;
};

/*
 * Formats a date into a relative time string (e.g., "5 min siden", "2 timer siden").
 * createdAtIso - The ISO date string of when the notification was created.
 * A relative time string.
*/
function formatRelativeTime(createdAtIso: string): string {
    const createdAt = new Date(createdAtIso).getTime();
    const diffMs = Date.now() - createdAt;
    const minute = 60_000;
    const hour = 60 * minute;
    const day = 24 * hour;

    if (diffMs < hour) {
        const minutes = Math.max(1, Math.floor(diffMs / minute));
        return `${minutes} min siden`;
    }

    if (diffMs < day) {
        const hours = Math.max(1, Math.floor(diffMs / hour));
        return `${hours} timer siden`;
    }

    const days = Math.max(1, Math.floor(diffMs / day));
    return `${days} dager siden`;
}

export async function fetchNotifications(accessToken: string, unreadOnly?: boolean) : Promise<Notification[]> {
    const path = unreadOnly ? "/api/notifications?unreadOnly=true" : "/api/notifications";

    const data = await apiFetchJson<NotificationDto[]>(path, {
        headers: { Authorization: `Bearer ${accessToken}` },
        method: "GET",
        cache: "no-store",
    });

    return data.map((notification) => ({
        id: Number(notification.id),
        type: notification.type,
        title: notification.title,
        message: notification.message,
        time: formatRelativeTime(notification.created_at),
        isRead: Boolean(notification.is_read),
        locationNickname: notification.location_nickname ?? undefined,
    }));
}

export async function markNotificationRead( id: number, accessToken: string): Promise<void> {
    await apiFetchJson<{ id: number; is_read: boolean }>(`/api/notifications/${id}/read`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        method: "PATCH",
    });
}

export async function markAllNotificationsRead(accessToken: string): Promise<void> {
    await apiFetchJson<{ message: string; updatedCount: number }>("/api/notifications/read-all", {
        headers: { Authorization: `Bearer ${accessToken}` },
        method: "PATCH",
    });
}

export async function notifyAdminsOfAccessRequest(accessToken: string, locationId: number): Promise<void> {
    await apiFetchJson<{ message: string; count: number }>("/api/notifications/access-request", {
        headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({ location_id: locationId }),
    });
}

/**
 * Determines the navigation path based on notification type.
 * - warning: low-stock alerts → /storage
 * - alert: access-related notifications → /admin/access
 */
export function getNotificationPath(type: "warning" | "info" | "alert"): string {
    if (type === "warning") {
        return "/storage";
    }
    if (type === "alert") {
        return "/admin/access";
    }
    return "/"; // Fallback to home
}