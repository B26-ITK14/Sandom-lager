/*
    * NavFlyout.tsx
    * A flyout navigation menu component that slides in from the left, providing user information, navigation links, and a logout option. 
    * It also includes an overlay to focus attention on the menu when open.
    * Author: Emil Berglund
*/

import { useRef } from 'react';
import { X, Power } from 'lucide-react';
import { useAuth0 } from '@auth0/auth0-react';
import { useUppercaseUsername } from '../hooks/user/useName';
import { useNavigate, useLocation } from 'react-router-dom';
import { getAllMainRoutes } from '../router/nav';
import { LogoutLoadingOverlay, useAppLogout } from '../auth';
import { useUser } from '../context/UserContext';
import { useAppVersion } from '../hooks/version/appVersion';
import { useClickOutside, useEscapeKey } from '../hooks';

interface NavFlyoutProps {
    isOpen: boolean;
    onClose: () => void;
}

export function NavFlyout({ isOpen, onClose }: NavFlyoutProps) {
    const flyoutRef = useRef<HTMLElement>(null);
    const username = useUppercaseUsername();
    const { user } = useAuth0();
    const { location: userLocation } = useUser();
    const { logoutUser, isLoggingOut } = useAppLogout(onClose);
    const { display: appVersion } = useAppVersion();
    const navigate = useNavigate();
    const routeLocation = useLocation();
    const imageSrc = user?.picture;

    const handleLogout = () => {
        void logoutUser();
    };

    const handleNavigation = (path: string) => {
        navigate(path);
        onClose();
    };

    useEscapeKey(onClose, isOpen);
    useClickOutside(flyoutRef, onClose, isOpen);

    return (
        <>
            {/* Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/10 backdrop-blur-sm z-40 animate-fade-in"
                />
            )}

            {/* Flyout */}
            <section
                id="app-nav-flyout"
                ref={flyoutRef}
                className={`fixed top-0 left-0 h-full w-full max-w-136 z-50 flex flex-col transition-transform duration-500 ease-out ${isOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
                style={{ backgroundColor: 'var(--color-surface)' }}
            >
                {/* Header with user info */}
                <section
                    className={`flex justify-between items-center pt-20 rounded-b-3xl ${isOpen ? 'animate-slide-in-left' : ''}`}
                >
                    <div
                        className="flex items-center gap-3 py-6 px-8 rounded-br-3xl"
                        style={{ backgroundColor: 'var(--color-surface)' }}
                    >
                        <div className="w-14 aspect-square overflow-hidden rounded-full">
                            <img
                                src={imageSrc}
                                alt="Profile Picture"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div>
                            <p className="font-bold text-lg" style={{ color: 'var(--color-text-primary)' }}>
                                {username}
                            </p>
                            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                                {userLocation ?? 'Ukjent lokasjon'}
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-8 hover:opacity-70 cursor-pointer"
                        style={{ color: 'var(--color-text-primary)' }}
                        aria-label="Lukk meny"
                    >
                        <X size={28} />
                    </button>
                </section>

                {/* Navigation links */}
                <nav className={`flex-1 py-4 overflow-y-auto ${isOpen ? 'animate-slide-in-left animate-delay-100' : ''}`}>
                    <ul className="space-y-2">
                        {getAllMainRoutes().map((route) => (
                            <li key={route.nickname}>
                                <button
                                    onClick={() => handleNavigation(route.path)}
                                    className={`w-full text-left p-3 px-6 rounded-md transition-colors hover:opacity-80 cursor-pointer relative ${routeLocation.pathname === route.path ? 'font-bold' : ''
                                        }`}
                                    style={{
                                        color: 'var(--color-text-primary)',
                                    }}
                                >
                                    {routeLocation.pathname === route.path && (
                                        <span
                                            className="absolute left-0 top-0 bottom-0 w-1 rounded-r"
                                            style={{ backgroundColor: 'var(--color-primary)' }}
                                        />
                                    )}
                                    {route.displayName}
                                </button>
                            </li>
                        ))}
                    </ul>
                </nav>

                {/* Footer with logout and version */}
                <div className="p-6" >
                    <button
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        className="flex items-center gap-2 font-bold rounded-md transition-colors mb-4 cursor-pointer"
                        style={{ color: 'var(--color-text-primary)' }}
                        onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-danger)'}
                        onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-text-primary)'}
                    >
                        <Power size={20} />
                        Logg ut
                    </button>
                    <p className="text-xs text-right" style={{ color: 'var(--color-text-secondary)' }}>
                        Versjon: {appVersion}
                    </p>
                </div>
            </section>

            <LogoutLoadingOverlay isVisible={isLoggingOut} />
        </>
    );

}