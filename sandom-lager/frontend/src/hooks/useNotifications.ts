import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { fetchNotifications, markAllNotificationsRead, markNotificationRead } from '../api';
import { useApiAccessToken } from './useApiAccessToken';
import type { Notification } from '../components/notifications';

const POLL_INTERVAL_MS = 45_000;
const FRESHNESS_WINDOW_MS = 20_000;

interface RefreshOptions {
    force?: boolean;
}

export function useNotifications() {
    const { isAuthenticated } = useAuth0();
    const { getApiAccessToken } = useApiAccessToken();

    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const lastLoadedAtRef = useRef<number>(0);

    const unreadCount = useMemo(
        () => notifications.filter((notification) => !notification.isRead).length,
        [notifications]
    );

    const refresh = useCallback(async ({ force = true }: RefreshOptions = {}) => {
        if (!isAuthenticated) {
            setNotifications([]);
            setErrorMessage(null);
            lastLoadedAtRef.current = 0;
            return;
        }

        const isFresh = Date.now() - lastLoadedAtRef.current < FRESHNESS_WINDOW_MS;
        if (!force && isFresh) {
            return;
        }

        try {
            setIsLoading(true);
            setErrorMessage(null);

            const token = await getApiAccessToken();
            const data = await fetchNotifications(token);

            setNotifications(data);
            lastLoadedAtRef.current = Date.now();
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : 'Kunne ikke hente varsler.');
        } finally {
            setIsLoading(false);
        }
    }, [getApiAccessToken, isAuthenticated]);

    const markOneAsRead = useCallback(async (notificationId: number) => {
        let shouldCallApi = false;

        setNotifications((prev) =>
            prev.map((notification) => {
                if (notification.id !== notificationId) {
                    return notification;
                }

                if (!notification.isRead) {
                    shouldCallApi = true;
                }

                return { ...notification, isRead: true };
            })
        );

        if (!shouldCallApi) {
            return;
        }

        try {
            const token = await getApiAccessToken();
            await markNotificationRead(notificationId, token);
            lastLoadedAtRef.current = Date.now();
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : 'Kunne ikke oppdatere varsel.');
            await refresh({ force: true });
        }
    }, [getApiAccessToken, refresh]);

    const markAllAsRead = useCallback(async () => {
        setNotifications((prev) => prev.map((notification) => ({ ...notification, isRead: true })));

        try {
            const token = await getApiAccessToken();
            await markAllNotificationsRead(token);
            lastLoadedAtRef.current = Date.now();
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : 'Kunne ikke markere alle varsler som lest.');
            await refresh({ force: true });
        }
    }, [getApiAccessToken, refresh]);

    useEffect(() => {
        void refresh({ force: true });
    }, [refresh]);

    useEffect(() => {
        if (!isAuthenticated) {
            return;
        }

        const intervalId = window.setInterval(() => {
            void refresh({ force: false });
        }, POLL_INTERVAL_MS);

        return () => {
            window.clearInterval(intervalId);
        };
    }, [isAuthenticated, refresh]);

    return {
        notifications,
        unreadCount,
        isLoading,
        errorMessage,
        refresh,
        markOneAsRead,
        markAllAsRead,
    };
}
