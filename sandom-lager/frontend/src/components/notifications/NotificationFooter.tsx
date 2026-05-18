/*
    * NotificationFooter.tsx
    * Footer component for the notification flyout.
    * Provides "Mark all as read" functionality.
    * Is used in the NotificationFlyout component when there are notifications to show.
    * Author: Emil Berglund
*/

interface NotificationFooterProps {
    hasNotifications: boolean;
    onMarkAllAsRead: () => void;
}

export function NotificationFooter({ hasNotifications, onMarkAllAsRead }: NotificationFooterProps) {
    if (!hasNotifications) {
        return null;
    }

    return (
        <div className="p-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
            <button
                className="w-full py-2 text-sm font-semibold hover:opacity-70 cursor-pointer"
                style={{ color: 'var(--color-primary)' }}
                onClick={onMarkAllAsRead}
            >
                Merk alle som lest
            </button>
        </div>
    );
}
