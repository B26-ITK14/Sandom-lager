/*
    * NotificationList.tsx
    * A list component displaying multiple notifications.
    * Shows empty state when no notifications are available.
*/

import { Package } from 'lucide-react';
import { NotificationItem } from './NotificationItem';
import type { Notification } from './types';

interface NotificationListProps {
    notifications: Notification[];
    onNotificationClick: (notification: Notification) => void;
}

export function NotificationList({ notifications, onNotificationClick }: NotificationListProps) {
    if (notifications.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-6">
                <Package size={48} style={{ color: 'var(--color-text-secondary)' }} className="mb-4" />
                <p className="text-center" style={{ color: 'var(--color-text-secondary)' }}>
                    Du har ingen varsler
                </p>
            </div>
        );
    }

    return (
        <ul className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
            {notifications.map((notification) => (
                <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onClick={onNotificationClick}
                />
            ))}
        </ul>
    );
}
