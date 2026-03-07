/*
    * useUserRole.ts
    * Custom hook to fetch the current user's role from the backend /api/me endpoint.
    * Returns the role string, a loading state, and any error.
    * Author: Emil Berglund
*/

import { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';

type Role = 'admin' | 'manager' | 'user' | null;

interface UseUserRoleResult {
    role: Role;
    loading: boolean;
    error: string | null;
}

export function useUserRole(): UseUserRoleResult {
    const { getAccessTokenSilently, isAuthenticated } = useAuth0();
    const [role, setRole] = useState<Role>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!isAuthenticated) {
            setLoading(false);
            return;
        }

        let cancelled = false;

        async function fetchRole() {
            try {
                const token = await getAccessTokenSilently({
                    authorizationParams: {
                        audience: 'https://sandom-api',
                    },
                });

                const response = await fetch('/api/me', {
                    headers: { Authorization: `Bearer ${token}` },
                });


                if (!response.ok) throw new Error(`Feil ved henting av rolle (${response.status})`);

                const data = await response.json();

                if (!cancelled) setRole(data.role ?? null);
            } catch (err) {
                console.error('[useUserRole] Error:', err);
                if (!cancelled) setError(err instanceof Error ? err.message : 'Ukjent feil');
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        fetchRole();
        return () => { cancelled = true; };
    }, [isAuthenticated, getAccessTokenSilently]);

    return { role, loading, error };
}
