/*
    * ActiveSessionsPanel.tsx
    * Component for displaying and managing active user sessions, including device info and session revocation.
    * Used in the Security & Privacy section of the account settings page.
    * Author: Emil Berglund
*/

import { useEffect, useState, useCallback } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { X, Loader, AlertCircle, RefreshCw } from 'lucide-react';
import { AUTH0_AUDIENCE } from '../../../../config/auth';
import { fetchSessions, revokeOtherSessions, revokeSession, type Auth0Session } from '../../../../api/user';
import { parseUserAgent, getDeviceIcon, formatRelative } from './sessionUtils';

export default function ActiveSessionsPanel() {
    const { getAccessTokenSilently } = useAuth0();
    const [sessions, setSessions] = useState<Auth0Session[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const [revoking, setRevoking] = useState<Set<string>>(new Set());
    const [revokingOthers, setRevokingOthers] = useState(false);

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        setMessage(null);
        try {
            const token = await getAccessTokenSilently({ authorizationParams: { audience: AUTH0_AUDIENCE } });
            const data = await fetchSessions(token);
            // Sort most-recently-active first
            setSessions(data.sort((a, b) =>
                new Date(b.last_interaction_at ?? b.updated_at).getTime() -
                new Date(a.last_interaction_at ?? a.updated_at).getTime()
            ));
        } catch {
            setError('Kunne ikke laste sesjoner');
        } finally {
            setLoading(false);
        }
    }, [getAccessTokenSilently]);

    useEffect(() => { load(); }, [load]);

    const handleRevoke = async (sessionId: string) => {
        setError(null);
        setMessage(null);
        setRevoking((prev) => new Set(prev).add(sessionId));
        try {
            const token = await getAccessTokenSilently({ authorizationParams: { audience: AUTH0_AUDIENCE } });
            await revokeSession(sessionId, token);
            setSessions((prev) => prev.filter((s) => s.id !== sessionId));
            setMessage('Sesjonen ble avsluttet');
        } catch {
            setError('Kunne ikke avslutte sesjonen');
        } finally {
            setRevoking((prev) => { const next = new Set(prev); next.delete(sessionId); return next; });
        }
    };

    const handleRevokeOthers = async () => {
        setError(null);
        setMessage(null);
        setRevokingOthers(true);
        try {
            const token = await getAccessTokenSilently({ authorizationParams: { audience: AUTH0_AUDIENCE } });
            const revoked = await revokeOtherSessions(token);
            setSessions((prev) => prev.filter((s) => s.is_current));
            setMessage(revoked > 0 ? `Avsluttet ${revoked} andre sesjon(er)` : 'Ingen andre sesjoner å avslutte');
        } catch {
            setError('Kunne ikke avslutte andre sesjoner');
        } finally {
            setRevokingOthers(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center py-6">
                <Loader size={20} className="animate-spin" style={{ color: 'var(--color-text-secondary)' }} />
            </div>
        );
    }

    if (error) {
        return (
            <div
                className="flex items-center gap-2 p-3 rounded-lg text-sm"
                style={{ backgroundColor: 'var(--color-background)', color: '#ef4444' }}
            >
                <AlertCircle size={16} />
                <span className="flex-1">{error}</span>
                <button onClick={load} className="cursor-pointer" title="Prøv igjen">
                    <RefreshCw size={16} />
                </button>
            </div>
        );
    }

    if (sessions.length === 0) {
        return (
            <p className="text-sm py-2 px-1" style={{ color: 'var(--color-text-secondary)' }}>
                Ingen aktive sesjoner funnet
            </p>
        );
    }

    return (
        <div className="space-y-2 mt-1">
            <div className="flex justify-end">
                <button
                    onClick={() => { void handleRevokeOthers(); }}
                    disabled={revokingOthers}
                    className="text-xs px-2.5 py-1.5 rounded-md cursor-pointer disabled:opacity-60"
                    style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text-primary)' }}
                >
                    {revokingOthers ? 'Avslutter ...' : 'Logg ut alle andre enheter'}
                </button>
            </div>

            {message && (
                <div className="text-xs p-2 rounded-md" style={{ backgroundColor: '#dcfce7', color: '#166534' }}>
                    {message}
                </div>
            )}

            {error && (
                <div className="text-xs p-2 rounded-md" style={{ backgroundColor: '#fee2e2', color: '#991b1b' }}>
                    {error}
                </div>
            )}

            {sessions.map((session, index) => {
                const ua = session.device?.last_user_agent;
                const { browser, os } = parseUserAgent(ua);
                const DeviceIcon = getDeviceIcon(ua);
                const isRevoking = revoking.has(session.id);
                const isNewest = index === 0;
                const isCurrentDevice = !!session.is_current;

                return (
                    <div
                        key={session.id}
                        className="flex items-start justify-between gap-3 p-3 rounded-lg"
                        style={{ backgroundColor: 'var(--color-background)' }}
                    >
                        <div className="flex items-start gap-3">
                            <DeviceIcon size={18} className="mt-0.5 shrink-0" style={{ color: 'var(--color-text-secondary)' }} />
                            <div>
                                <div className="flex items-center gap-2">
                                    <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                                        {browser} · {os}
                                    </p>
                                    {isCurrentDevice && (
                                        <span
                                            className="text-xs px-1.5 py-0.5 rounded-full font-medium"
                                            style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-surface)' }}
                                        >
                                            Denne enheten
                                        </span>
                                    )}
                                    {isNewest && !isCurrentDevice && (
                                        <span
                                            className="text-xs px-1.5 py-0.5 rounded-full font-medium"
                                            style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-surface)' }}
                                        >
                                            Siste aktive
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
                                    {session.device?.last_ip ?? 'Ukjent IP'}
                                    {' · '}
                                    {formatRelative(session.last_interaction_at ?? session.updated_at)}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => handleRevoke(session.id)}
                            disabled={isRevoking || isCurrentDevice}
                            className="shrink-0 p-1 rounded cursor-pointer disabled:opacity-50"
                            title={isCurrentDevice ? 'Kan ikke avslutte nåværende sesjon herfra' : 'Avslutt sesjon'}
                            style={{ color: 'var(--color-text-secondary)' }}
                        >
                            {isRevoking
                                ? <Loader size={15} className="animate-spin" />
                                : <X size={15} />
                            }
                        </button>
                    </div>
                );
            })}
        </div>
    );
}
