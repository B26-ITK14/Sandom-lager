/*
    * AccountDetailsCard.tsx
    * Card component for displaying user account details like role, membership date, and status.
    * Author: Emil Berglund
*/

import { Shield } from 'lucide-react';

interface AccountDetailsCardProps {
    role: string | null | undefined;
    memberSince: string;
}

export default function AccountDetailsCard({ role, memberSince }: AccountDetailsCardProps) {
    return (
        <section
            className="rounded-2xl p-6 lg:col-start-2 lg:row-start-1"
            style={{ backgroundColor: 'var(--color-surface)' }}
        >
            <div className="flex items-center gap-3 mb-6">
                <Shield size={24} style={{ color: 'var(--color-primary)' }} />
                <h3
                    className="text-xl font-semibold"
                    style={{ color: 'var(--color-text-primary)' }}
                >
                    Kontodetaljer
                </h3>
            </div>

            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Rolle</span>
                    <span
                        className="px-3 py-1 rounded-full text-sm font-medium capitalize"
                        style={{ backgroundColor: 'var(--color-background)', color: 'var(--color-primary)' }}
                    >
                        {role || 'N/A'}
                    </span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Medlem siden</span>
                    <span className="text-sm" style={{ color: 'var(--color-text-primary)' }}>{memberSince}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Status</span>
                    <span className="flex items-center gap-2 text-sm" style={{ color: 'var(--color-text-primary)' }}>
                        <span className="w-2 h-2 rounded-full bg-green-500" />
                        Aktiv
                    </span>
                </div>
            </div>
        </section>
    );
}
