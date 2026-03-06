/*
    * SettingsNavItem.tsx
    * A reusable navigation item component for the settings page.
    * Author: Emil Berglund
*/


import React from 'react';
import { User, Bell, Lock, HelpCircle, Info, LogOut, ChevronRight, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';


interface SettingsNavItemProps {
    title: string;
    description?: string;
    url: string;
    figureType: 'account' | 'notification' | 'security' | 'help' | 'about' | 'logout';
    warning?: boolean;
    style?: React.CSSProperties;
}

const figureIconMap: Record<SettingsNavItemProps['figureType'], React.ReactNode> = {
    account: <User size={24} />,
    notification: <Bell size={24} />,
    security: <Lock size={24} />,
    help: <HelpCircle size={24} />,
    about: <Info size={24} />,
    logout: <LogOut size={24} />,
};

export default function SettingsNavItem({ title, description, url, figureType, warning, style }: SettingsNavItemProps) {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate(url);
    };

    return (
        <button
            className="flex items-center w-full text-left gap-4 py-1 my-8 cursor-pointer"
            style={style}
            onClick={handleClick}
        >
            {/* Icon */}
            <figure
                className="flex items-center justify-center w-11 h-11 rounded-full shrink-0"
                style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-primary)' }}
            >
                {figureIconMap[figureType]}
            </figure>

            {/* Text */}
            <div className="flex flex-col flex-1 min-w-0">
                <h3
                    className="text-base font-semibold"
                    style={{ color: 'var(--color-text-primary)' }}
                >
                    {title}
                </h3>
                {description && (
                    <p
                        className="text-sm truncate"
                        style={{ color: 'var(--color-text-secondary)' }}
                    >
                        {description}
                    </p>
                )}
            </div>

            {/* Warning indicator */}
            {warning && (
                <AlertTriangle size={20} className="shrink-0 text-red-500" />
            )}

            {/* Chevron */}
            <ChevronRight
                size={20}
                className="shrink-0"
                style={{ color: 'var(--color-text-secondary)' }}
            />
        </button>
    );
}