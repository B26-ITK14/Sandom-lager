/*
    * ActiveSessionsToggle.tsx
    * Collapsible button that reveals the ActiveSessionsPanel when expanded.
    * Used in the Security & Privacy section of the account settings page.
    * Author: Emil Berglund
*/

import { useState } from 'react';
import { Monitor, ChevronDown, ChevronUp } from 'lucide-react';
import ActiveSessionsPanel from './ActiveSessionsPanel';

export default function ActiveSessionsToggle() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div
            className="rounded-lg overflow-hidden"
            style={{ backgroundColor: 'var(--color-background)' }}
        >
            <button
                onClick={() => setIsOpen((o) => !o)}
                className="w-full flex items-center justify-between p-4 transition-colors cursor-pointer"
                style={{ backgroundColor: 'var(--color-background)' }}
            >
                <div className="flex items-center gap-3">
                    <Monitor size={20} style={{ color: 'var(--color-text-secondary)' }} />
                    <div className="text-left">
                        <p className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                            Aktive sesjoner
                        </p>
                        <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                            Administrer påloggede enheter
                        </p>
                    </div>
                </div>
                {isOpen
                    ? <ChevronUp size={18} style={{ color: 'var(--color-text-secondary)' }} />
                    : <ChevronDown size={18} style={{ color: 'var(--color-text-secondary)' }} />
                }
            </button>

            {isOpen && (
                <div className="px-4 pb-4">
                    <ActiveSessionsPanel />
                </div>
            )}
        </div>
    );
}
