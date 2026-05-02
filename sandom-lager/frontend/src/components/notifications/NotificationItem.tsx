/*
    * NotificationItem.tsx
    * A single notification item component for the notification flyout.
    * Displays notification content and handles click actions.
    * Author: Emil Berglund
*/

import { AlertCircle, Clock, ShoppingCart, Package, Key, CheckCircle, Ban } from 'lucide-react';
import type { Notification } from './types';

interface NotificationItemProps {
    notification: Notification;
    onClick: (notification: Notification) => void;
}

export function NotificationItem({ notification, onClick }: NotificationItemProps) {
    const getNotificationIcon = (notification: Notification) => {
        const title = (notification.title || '').toLowerCase();

        // Access / admin related notifications
        if (title.includes('ny tilgang') || title.includes('tilgangssøknad') || title.includes('tilgangssøknad')) {
            return <Key size={20} className="text-yellow-500" />; // user-key in gold
        }

        if (title.includes('tilgang godkjent') || title.includes('tilgang godkjent') || title.includes('godkjent')) {
            return <CheckCircle size={20} className="text-green-500" />; // access granted in green
        }

        if (title.includes('avslått') || title.includes('avslå') || title.includes('avslatt') || title.includes('denied')) {
            return <Ban size={20} className="text-red-500" />; // access denied in red
        }

        // Fallback to icon by type
        switch (notification.type) {
            case 'warning':
                return <AlertCircle size={20} className="text-yellow-500" />;
            case 'alert':
                return <Clock size={20} className="text-red-500" />;
            case 'info':
                return <ShoppingCart size={20} className="text-blue-500" />;
            default:
                return <Package size={20} />;
        }
    };

    return (
        <li
            onClick={() => onClick(notification)}
            className={`p-4 hover:opacity-80 cursor-pointer transition-colors ${
                !notification.isRead ? 'bg-opacity-50' : ''
            }`}
            style={{
                backgroundColor: !notification.isRead ? 'var(--color-primary-light)' : 'transparent',
            }}
        >
            <div className="flex gap-3">
                    <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification)}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                        <h3
                            className={`text-sm font-semibold ${
                                !notification.isRead ? 'font-bold' : ''
                            }`}
                            style={{ color: 'var(--color-text-primary)' }}
                        >
                            {notification.title}
                        </h3>
                        {!notification.isRead && (
                            <span
                                className="w-2 h-2 rounded-full flex-shrink-0 ml-2"
                                style={{ backgroundColor: 'var(--color-primary)' }}
                            />
                        )}
                    </div>
                    <p
                        className="text-sm mb-1"
                        style={{ color: 'var(--color-text-secondary)' }}
                    >
                        {notification.message}
                    </p>
                    <p
                        className="text-xs"
                        style={{ color: 'var(--color-text-secondary)' }}
                    >
                        {notification.time}
                    </p>
                </div>
            </div>
        </li>
    );
}
