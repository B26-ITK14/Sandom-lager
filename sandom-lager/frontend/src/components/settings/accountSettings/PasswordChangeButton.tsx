/*
    * PasswordChangeButton.tsx
    * Button + confirmation overlay for sending a password reset email via Auth0.
    * Author: Emil Berglund
*/

import { useState } from 'react';
import { Key, Loader, CheckCircle, AlertCircle, X } from 'lucide-react';
import { useAuth0 } from '@auth0/auth0-react';
import { env } from '../../../config/env';
import { requestPasswordChange } from '../../../api/user';

export default function PasswordChangeButton() {
    const { user } = useAuth0();
    const isPasswordUser = user?.sub?.startsWith('auth0|') ?? false;

    const [pwState, setPwState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
    const [pwError, setPwError] = useState<string | null>(null);
    const [confirmOpen, setConfirmOpen] = useState(false);

    const handleChangePassword = async () => {
        if (!user?.email || !isPasswordUser) return;
        setConfirmOpen(false);
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
        <>
            {/* Confirmation overlay */}
            {confirmOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div
                        className="relative rounded-2xl p-6 w-full max-w-sm shadow-xl mx-4"
                        style={{ backgroundColor: 'var(--color-surface)' }}
                    >
                        <button
                            onClick={() => setConfirmOpen(false)}
                            className="absolute top-4 right-4 p-1 rounded cursor-pointer"
                            style={{ color: 'var(--color-text-secondary)' }}
                        >
                            <X size={18} />
                        </button>
                        <div className="flex items-center gap-3 mb-3">
                            <Key size={22} style={{ color: 'var(--color-primary)' }} />
                            <h4 className="font-semibold text-lg" style={{ color: 'var(--color-text-primary)' }}>
                                Endre passord
                            </h4>
                        </div>
                        <p className="text-sm mb-5" style={{ color: 'var(--color-text-secondary)' }}>
                            En tilbakestillingslenke vil bli sendt til{' '}
                            <strong style={{ color: 'var(--color-text-primary)' }}>{user?.email}</strong>. Er du sikker?
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setConfirmOpen(false)}
                                className="flex-1 py-2 rounded-lg text-sm font-medium cursor-pointer"
                                style={{ backgroundColor: 'var(--color-background)', color: 'var(--color-text-primary)' }}
                            >
                                Avbryt
                            </button>
                            <button
                                onClick={handleChangePassword}
                                className="flex-1 py-2 rounded-lg text-sm font-medium cursor-pointer"
                                style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-surface)' }}
                            >
                                Send lenke
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <button
                onClick={() => setConfirmOpen(true)}
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
                        <p className="text-xs" style={{
                            color: pwState === 'sent' ? '#22c55e'
                                : pwState === 'error' ? '#ef4444'
                                : 'var(--color-text-secondary)'
                        }}>
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
                {pwState === 'idle' && isPasswordUser && (
                    <span style={{ color: 'var(--color-text-secondary)' }}>→</span>
                )}
            </button>
        </>
    );
}
