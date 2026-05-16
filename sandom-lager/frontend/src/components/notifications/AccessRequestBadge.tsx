/*
    * AccessRequestBadge.tsx
    * Shows a badge with the number of pending access requests.
    * Is used in the header when the user has pending access requests.
    * Author: Khalid Osman
*/

import { Bell } from "lucide-react";

interface AccessRequestBadgeProps {
    count: number;
    onClick?: () => void;
}

export default function AccessRequestBadge({ count, onClick }: AccessRequestBadgeProps) {
    if (count === 0) return null;

    return (
        <button
            type="button"
            onClick={onClick}
            title={`${count} ventende tilgangssøknad${count !== 1 ? "er" : ""}`}
            aria-label={`${count} ventende tilgangssøknad${count !== 1 ? "er" : ""}`}
            className="relative inline-flex items-center justify-center rounded-full p-2 transition-colors duration-150"
            style={{ color: 'var(--color-text-secondary)' }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--color-secondary-surface)')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
        >
            <Bell size={20} />
            <span
                className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold leading-none"
                style={{
                    backgroundColor: 'var(--color-danger)',
                    color: 'var(--color-on-danger)',
                }}
            >
                {count > 9 ? "9+" : count}
            </span>
        </button>
    );
}