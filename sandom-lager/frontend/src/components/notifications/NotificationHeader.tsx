/*
    * NotificationHeader.tsx
    * Header component for the notification flyout.
    * Displays title, unread count, and close button.
    * Author: Emil Berglund
*/

import { X } from 'lucide-react';

interface NotificationHeaderProps {
    unreadCount: number;
    onClose: () => void;
}

export function NotificationHeader({ unreadCount, onClose }: NotificationHeaderProps) {
    return (
        <section className="flex justify-between items-center p-6 border-b" style={{ borderColor: 'var(--color-border)' }}>
            <div>
                <h2 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                    Varsler
                </h2>
                {unreadCount > 0 && (
                    <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                        {unreadCount} uleste varsler
                    </p>
                )}
            </div>
            <button
                type="button"
                onClick={onClose}
                className="p-2 hover:opacity-70 cursor-pointer"
                style={{ color: 'var(--color-text-primary)' }}
                aria-label="Lukk varsler"
            >
                <X size={24} />
            </button>
        </section>
    );
}
