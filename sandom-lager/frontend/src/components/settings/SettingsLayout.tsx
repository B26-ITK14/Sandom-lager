/*
 * SettingsLayout.tsx
 * A page layout for settings sub-pages. Provides a header with a back button
 * and a scrollable content area. Used as the wrapper for individual settings pages.
 * Author: Emil Berglund
 */

import React from "react";
import HeaderSection from "../HeaderSection";

interface LayoutProps {
    title?: string;
    children?: React.ReactNode;
    notifications?: boolean;
    backMenu?: boolean;
}

export default function SettingsLayout({ children, notifications = false, backMenu = true }: LayoutProps) {

    return (
        <div
            className="min-h-screen flex flex-col max-w-6xl mx-auto px-4 py-8"
            style={{ backgroundColor: "var(--color-background)" }}
        >
            <header>
                <HeaderSection notifications={notifications} backMenu={backMenu} />
            </header>
            <div className="flex-1">{children}</div>
        </div>
    );
}
