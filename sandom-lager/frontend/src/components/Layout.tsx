/*
    * Layout.tsx
    * A layout component that provides a consistent structure for the main application pages, including a header section and a content area.
*/

import type { ReactNode } from 'react';
import HeaderSection from './HeaderSection';

interface LayoutProps {
    children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
    return (
        <div
            className="min-h-screen px-4 py-8 transition-colors max-w-6xl mx-auto"
            style={{ backgroundColor: 'var(--color-background)' }}
        >
            <header>
                <HeaderSection />
            </header>
            <div>
                {children}
            </div>
        </div>
    );
}
