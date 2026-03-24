/*
    * useAuthenticatedFetch.ts
    * A custom hook that wraps API calls and automatically handles 401 (Unauthorized) errors
    * by triggering a force logout and session reset.
    * Use this hook instead of apiFetchJson directly to ensure consistent auth error handling.
    * Author: Emil Berglund
*/

import { useCallback } from 'react';
import { apiFetchJson, ApiError } from '../api/client';
import { useAuthError } from '../context/useAuthError';

export function useAuthenticatedFetch() {
    const { handleAuthError } = useAuthError();

    const fetchJson = useCallback(
        async <T,>(path: string, init?: RequestInit): Promise<T> => {
            try {
                return await apiFetchJson<T>(path, init);
            } catch (error) {
                if (error instanceof ApiError && error.status === 401) {
                    handleAuthError(401, error.detail || error.message);
                }
                throw error;
            }
        },
        [handleAuthError]
    );

    return { fetchJson };
}
