import { useState } from 'react';
import { NavFlyout } from './NavFlyout';

export default function HeaderSection({
    currentPage,
}: {
    currentPage?: string;
}) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleMenuClick = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    return (
        <>
            <section className="mb-6 flex flex-row items-center justify-between">
                <button
                    className="p-2 text-gray-600 hover:text-gray-900 cursor-pointer"
                    onClick={handleMenuClick}
                >
                    <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
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
                <h2
                    className="text-2xl font-bold"
                    style={{ color: 'var(--color-text-primary)' }}>
                    {currentPage}
                </h2>
                <button className="p-2 text-gray-600 hover:text-gray-900">
                    <img
                        src="src/assets/temp_EmilB04.png"
                        alt="Profile Picture"
                        className="w-10 h-10 rounded-full"
                    />
                </button>
            </section>

            <NavFlyout isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
        </>
    );
}
