/*
    * HeaderSection.tsx
    * A header component for the main application pages, featuring a menu button, page title, and notification bell. 
    * It also integrates a flyout navigation menu.
    * Author: Emil Berglund
*/

import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bell, ArrowLeft } from 'lucide-react';
import { NavFlyout } from './NavFlyout';
import { NotificationFlyout } from './notifications';
import { getDisplayName } from '../routes';

interface HeaderSectionProps {
    notifications: boolean | true;
    backMenu?: boolean | false;
}

export default function HeaderSection({ notifications, backMenu }: HeaderSectionProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    // Get page name from current URL path
    const currentPage = getDisplayName(location.pathname);

    const handleMenuClick = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const handleNotificationClick = () => {
        setIsNotificationOpen(!isNotificationOpen);
    };

    return (
        <>
            <section className="mb-6 flex flex-row items-center justify-between">
                {backMenu ? (
                    <button
                        className="py-2 pr-4 cursor-pointer"
                        style={{ color: 'var(--color-header-text-primary)' }}
                        onClick={() => navigate(-1)}
                    >
                        <ArrowLeft size={24} />
                    </button>
                ) : (
                    <button
                        className="py-2 pr-4 text-gray-600 hover:text-gray-900 cursor-pointer"
                        onClick={handleMenuClick}
                    >
                        <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            style={{ color: 'var(--color-header-text-primary)' }}
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 6h16M4 12h16M4 18h16"
                            />
                        </svg>
                    </button>
                )}
                <h2
                    className="text-2xl font-bold"
                    style={{ color: 'var(--color-header-text-primary)' }}>
                    {currentPage}
                </h2>
                <button
                    className="p-2 hover:opacity-70 cursor-pointer relative"
                    style={{ color: 'var(--color-header-text-primary)' }}
                    onClick={handleNotificationClick}
                >
                    <Bell size={24} />
                    {/* Uncomment to show notification badge */}
                    {notifications && (
                        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                    )}
                </button>
            </section>

            <NavFlyout isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
            <NotificationFlyout isOpen={isNotificationOpen} onClose={() => setIsNotificationOpen(false)} />
        </>
    );
}
