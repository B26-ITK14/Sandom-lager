/*
    * NotificationFlyout.tsx
    * A flyout notification panel that slides in from the right, displaying system notifications
    * such as low stock alerts or access approvals. 
*/

import { useNavigate } from 'react-router-dom';
import { getRouteByNickname } from '../../router/nav';
import { NotificationHeader } from './NotificationHeader';
import { NotificationList } from './NotificationList';
import { NotificationFooter } from './NotificationFooter';
import type { Notification } from './types';

interface NotificationFlyoutProps {
    isOpen: boolean;
    onClose: () => void;
    notifications: Notification[];
    unreadCount: number;
    isLoading: boolean;
    errorMessage?: string | null;
    onRefresh: () => void;
    onNotificationClick: (notificationId: number) => Promise<void>;
    onMarkAllAsRead: () => Promise<void>;
}

export function NotificationFlyout({
    isOpen,
    onClose,
    notifications,
    unreadCount,
    isLoading,
    errorMessage,
    onRefresh,
    onNotificationClick,
    onMarkAllAsRead,
}: NotificationFlyoutProps) {
    const navigate = useNavigate();

    const handleNotificationClick = async (notification: Notification) => {
        await onNotificationClick(notification.id);

        const route = notification.locationNickname ? getRouteByNickname(notification.locationNickname) : undefined;
        if (route) {
            navigate(route.path);
        }
        onClose();
    };

    return (
        <>
            {/* Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/10 backdrop-blur-sm z-40 animate-fade-in"
                    onClick={onClose}
                />
            )}

            {/* Flyout */}
            <section
                className={`fixed top-0 right-0 h-full w-full max-w-md transition-transform duration-200 ease-out z-50 flex flex-col ${
                    isOpen ? 'translate-x-0' : 'translate-x-full'
                }`}
                style={{ backgroundColor: 'var(--color-surface)' }}
            >
                <div className={isOpen ? 'animate-slide-in-right' : ''}>
                    <NotificationHeader unreadCount={unreadCount} onClose={onClose} />
                </div>

                <div className={`flex-1 overflow-y-auto ${isOpen ? 'animate-slide-in-right animate-delay-100' : ''}`}>
                    {isLoading && notifications.length === 0 && (
                        <div className="p-6 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                            Laster varsler...
                        </div>
                    )}

                    {!isLoading && errorMessage && notifications.length === 0 && (
                        <div className="p-6">
                            <p className="text-sm mb-3" style={{ color: 'var(--color-text-secondary)' }}>
                                Kunne ikke hente varsler.
                            </p>
                            <button
                                className="px-3 py-2 text-sm rounded-md cursor-pointer"
                                style={{
                                    color: 'var(--color-text-primary)',
                                    border: '1px solid var(--color-border)',
                                }}
                                onClick={onRefresh}
                            >
                                Prøv igjen
                            </button>
                        </div>
                    )}

                    {(!isLoading || notifications.length > 0) && (!errorMessage || notifications.length > 0) && (
                        <NotificationList
                            notifications={notifications}
                            onNotificationClick={handleNotificationClick}
                        />
                    )}
                </div>

                <div className={isOpen ? 'animate-slide-in-right animate-delay-200' : ''}>
                    <NotificationFooter 
                        hasNotifications={notifications.length > 0} 
                        onMarkAllAsRead={onMarkAllAsRead}
                    />
                </div>
            </section>
        </>
    );
}
