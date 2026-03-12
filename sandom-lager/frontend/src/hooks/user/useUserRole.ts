/*
    * useUserRole.ts
    * Custom hook to fetch the current user's role from the backend /api/me endpoint.
    * Returns the role string, a loading state, and any error.
    * Author: Emil Berglund
*/

import { useUser } from '../../context/UserContext';
import type { UserRole } from '../../api/user';

interface UseUserRoleResult {
    role: UserRole;
    loading: boolean;
    error: string | null;
}

/** Reads the current user's role from UserContext (no extra API call). */
export function useUserRole(): UseUserRoleResult {
    const { role, loading, error } = useUser();
    return { role, loading, error };
}
