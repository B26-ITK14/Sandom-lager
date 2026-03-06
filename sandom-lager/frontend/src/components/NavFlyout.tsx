/*
    * NavFlyout.tsx
    * A flyout navigation menu component that slides in from the left, providing user information, navigation links, and a logout option. 
    * It also includes an overlay to focus attention on the menu when open.
    * Author: Emil Berglund
*/

import { X, Search, Power } from 'lucide-react';
import { useUsername } from '../hooks/useName';
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getAllMainRoutes } from '../routes';
import { version } from '../../package.json';

interface NavFlyoutProps {
    isOpen: boolean;
    onClose: () => void;
}

export function NavFlyout({ isOpen, onClose }: NavFlyoutProps) {
    const username = useUsername();
    const { logout } = useAuth0();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout({ logoutParams: { returnTo: window.location.origin } });
        onClose();
    };

    const handleNavigation = (path: string) => {
        navigate(path);
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
                        <img
                            src="src/assets/temp_EmilB04.png"
                            alt="Profile Picture"
                            className="w-14 h-14 rounded-full"
                        />
                        <div>
                            <p className="font-bold text-lg" style={{ color: 'var(--color-text-primary)' }}>
                                {username}
                            </p>
                            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                                Tomasgården, Kornsjø
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-8 hover:opacity-70 cursor-pointer"
                        style={{ color: 'var(--color-text-primary)' }}
                    >
                        <X size={28} />
                    </button>
                </section>

                {/* Search bar */}
                <div className={`p-6 ${isOpen ? 'animate-slide-in-left animate-delay-100' : ''}`}>
                    <div className="relative">
                        <Search
                            size={20}
                            className="absolute left-4 top-1/2 transform -translate-y-1/2"
                            style={{ color: 'var(--color-text-secondary)' }}
                        />
                        <input
                            type="text"
                            placeholder="Søk etter noe.."
                            className="w-full pl-12 pr-4 py-3 rounded-full border"
                            style={{
                                backgroundColor: 'var(--color-background)',
                                borderColor: 'var(--color-border)',
                                color: 'var(--color-text-primary)',
                            }}
                        />
                    </div>
                </div>

                {/* Navigation links */}
                <nav className={`flex-1 py-4 overflow-y-auto ${isOpen ? 'animate-slide-in-left animate-delay-100' : ''}`}>
                    <ul className="space-y-2">
                        {getAllMainRoutes().map((route) => (
                            <li key={route.nickname}>
                                <button
                                    onClick={() => handleNavigation(route.path)}
                                    className={`w-full text-left p-3 px-6 rounded-md transition-colors hover:opacity-80 cursor-pointer relative ${
                                        location.pathname === route.path ? 'font-bold' : ''
                                    }`}
                                    style={{
                                        color: 'var(--color-text-primary)',
                                    }}
                                >
                                    {location.pathname === route.path && (
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
                        className="flex items-center gap-2 font-bold rounded-md transition-colors mb-4 cursor-pointer"
                        style={{ color: 'var(--color-text-primary)' }}
                        onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-danger)'}
                        onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-text-primary)'}
                    >
                        <Power size={20} />
                        Logg ut
                    </button>
                    <p className="text-xs text-right" style={{ color: 'var(--color-text-secondary)' }}>
                        Versjon: {version ? version === '0.0.0' ? 'Under utvikling' : version : 'Ukjent'}
                    </p>
                </div>
            </section>
        </>
    );

}