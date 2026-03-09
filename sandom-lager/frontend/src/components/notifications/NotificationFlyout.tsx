/*
    * NotificationFlyout.tsx
    * A flyout notification panel that slides in from the right, displaying system notifications such as 
    * low stock alerts, expiring items, and shopping list updates.
    * Author: Emil Berglund
*/

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRouteByNickname } from '../../router/nav';
import { NotificationHeader } from './NotificationHeader';
import { NotificationList } from './NotificationList';
import { NotificationFooter } from './NotificationFooter';
import { mockNotifications } from './mockNotifications';
import type { Notification } from './types';

interface NotificationFlyoutProps {
    isOpen: boolean;
    onClose: () => void;
}

export function NotificationFlyout({ isOpen, onClose }: NotificationFlyoutProps) {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
    const unreadCount = notifications.filter(n => !n.isRead).length;

    const handleNotificationClick = (notification: Notification) => {
        // Mark as read
        setNotifications(notifications.map(n =>
            n.id === notification.id ? { ...n, isRead: true } : n
        ));

        // Navigate to related route if location exists
        if (notification.locationNickname) {
            const route = getRouteByNickname(notification.locationNickname);
            if (route) {
                navigate(route.path);
                onClose();
            }
        }
    };

    const handleMarkAllAsRead = () => {
        setNotifications(notifications.map(n => ({ ...n, isRead: true })));
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
                    <NotificationList 
                        notifications={notifications} 
                        onNotificationClick={handleNotificationClick}
                    />
                </div>

                <div className={isOpen ? 'animate-slide-in-right animate-delay-200' : ''}>
                    <NotificationFooter 
                        hasNotifications={notifications.length > 0} 
                        onMarkAllAsRead={handleMarkAllAsRead}
                    />
                </div>
            </section>
        </>
    );
}
