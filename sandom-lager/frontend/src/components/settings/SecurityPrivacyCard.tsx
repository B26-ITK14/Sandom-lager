/*
    * SecurityPrivacyCard.tsx
    * Card component for managing security and privacy settings like password changes, 2FA, and active sessions.
    * Author: Emil Berglund
    TODO: Two-factor authentication is currently just a placeholder. Implement actual 2FA setup and management flow, possibly integrating with Auth0's Guardian or a custom solution.
*/

import { useState } from 'react';
import { Key, Smartphone, Monitor, Loader, CheckCircle, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth0 } from '@auth0/auth0-react';
import { env } from '../../config/env';
import { requestPasswordChange } from '../../api/user';
import ActiveSessionsPanel from './ActiveSessionsPanel';

export default function SecurityPrivacyCard() {
    const { user } = useAuth0();
    const [pwState, setPwState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
    const [pwError, setPwError] = useState<string | null>(null);
    const [sessionsOpen, setSessionsOpen] = useState(false);

    // Only users with an auth0 (username/password) connection can reset their password
    const isPasswordUser = user?.sub?.startsWith('auth0|') ?? false;

    const handleChangePassword = async () => {
        if (!user?.email || !isPasswordUser) return;
        setPwState('sending');
        setPwError(null);
        try {
            await requestPasswordChange(user.email, env.VITE_AUTH0_DOMAIN, env.VITE_AUTH0_CLIENT_ID);
            setPwState('sent');
        } catch (err) {
            setPwError(err instanceof Error ? err.message : 'Noe gikk galt');
            setPwState('error');
        }
    };

    return (
        <section
            className="rounded-2xl p-6 lg:col-start-2 lg:row-start-2"
            style={{ backgroundColor: 'var(--color-surface)' }}
        >
            <div className="flex items-center gap-3 mb-6">
                <Key size={24} style={{ color: 'var(--color-primary)' }} />
                <h3
                    className="text-xl font-semibold"
                    style={{ color: 'var(--color-text-primary)' }}
                >
                    Sikkerhet og personvern
                </h3>
            </div>

            <div className="space-y-4">
                <button
                    onClick={handleChangePassword}
                    disabled={!isPasswordUser || pwState === 'sending' || pwState === 'sent'}
                    className="w-full flex items-center justify-between p-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    style={{ backgroundColor: 'var(--color-background)' }}
                >
                    <div className="flex items-center gap-3">
                        {pwState === 'sending' ? (
                            <Loader size={20} className="animate-spin" style={{ color: 'var(--color-text-secondary)' }} />
                        ) : pwState === 'sent' ? (
                            <CheckCircle size={20} style={{ color: '#22c55e' }} />
                        ) : pwState === 'error' ? (
                            <AlertCircle size={20} style={{ color: '#ef4444' }} />
                        ) : (
                            <Key size={20} style={{ color: 'var(--color-text-secondary)' }} />
                        )}
                        <div className="text-left">
                            <p className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                                Endre passord
                            </p>
                            <p className="text-xs" style={{ color: pwState === 'sent' ? '#22c55e' : pwState === 'error' ? '#ef4444' : 'var(--color-text-secondary)' }}>
                                {pwState === 'sent'
                                    ? 'E-post for tilbakestilling er sendt'
                                    : pwState === 'error'
                                    ? pwError
                                    : !isPasswordUser
                                    ? 'Ikke tilgjengelig for sosiale kontoer'
                                    : 'Send tilbakestillingslenke til din e-post'}
                            </p>
                        </div>
                    </div>
                    {pwState === 'idle' && isPasswordUser && <span style={{ color: 'var(--color-text-secondary)' }}>→</span>}
                </button>

                <button
                    className="w-full flex items-center justify-between p-4 rounded-lg transition-colors"
                    style={{ backgroundColor: 'var(--color-background)' }}
                >
                    <div className="flex items-center gap-3">
                        <Smartphone size={20} style={{ color: 'var(--color-text-secondary)' }} />
                        <div className="text-left">
                            <p className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                                Tofaktorautentisering
                            </p>
                            <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                                Ikke aktivert
                            </p>
                        </div>
                    </div>
                    <span style={{ color: 'var(--color-text-secondary)' }}>→</span>
                </button>

                <div
                    className="rounded-lg overflow-hidden"
                    style={{ backgroundColor: 'var(--color-background)' }}
                >
                    <button
                        onClick={() => setSessionsOpen((o) => !o)}
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
                        {sessionsOpen
                            ? <ChevronUp size={18} style={{ color: 'var(--color-text-secondary)' }} />
                            : <ChevronDown size={18} style={{ color: 'var(--color-text-secondary)' }} />
                        }
                    </button>

                    {sessionsOpen && (
                        <div className="px-4 pb-4">
                            <ActiveSessionsPanel />
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
