/*
    * useUserRole.ts
    * Custom hook to fetch the current user's role from the backend /api/me endpoint.
    * Returns the role string, a loading state, and any error.
    * Author: Emil Berglund
*/

import { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { AUTH0_AUDIENCE } from '../../config/auth';
import { fetchCurrentUserRole, type UserRole } from '../../api/user';

interface UseUserRoleResult {
    role: UserRole;
    loading: boolean;
    error: string | null;
}

export function useUserRole(): UseUserRoleResult {
    const { getAccessTokenSilently, isAuthenticated } = useAuth0();
    const [role, setRole] = useState<UserRole>(null);
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
                        audience: AUTH0_AUDIENCE,
                    },
                });

                const userRole = await fetchCurrentUserRole(token);

                if (!cancelled) setRole(userRole);
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
