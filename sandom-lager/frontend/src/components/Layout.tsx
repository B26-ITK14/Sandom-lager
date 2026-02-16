import type { ReactNode } from 'react';
import HeaderSection from './HeaderSection';

interface LayoutProps {
    children: ReactNode;
    currentPage?: string;
}

export default function Layout({ children, currentPage }: LayoutProps) {
    return (
        <div
            className="min-h-screen px-4 py-8 transition-colors max-w-4xl mx-auto"
            style={{ backgroundColor: 'var(--color-background)' }}
        >
            <header>
                <HeaderSection currentPage={currentPage} />
            </header>
            <div>
                {children}
            </div>
        </div>
    );
}
