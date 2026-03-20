/*
    * UserContext.tsx
    * Provides authenticated user data (name, role) fetched once from the backend
    * after login. All components should read from this context instead of making
    * their own /api/me calls, to keep Auth0 API usage minimal.
    * Author: Emil Berglund
*/

/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { AUTH0_AUDIENCE } from '../config/auth';
import { fetchMe } from '../api/user';
import type { UserRole } from '../api/user';

interface UserContextValue {
    name: string;
    username: string | null;
    role: UserRole;
    blocked: boolean;
    profilePicture: string | null;
    loading: boolean;
    error: string | null;
    /** Optimistic local update — call after a successful name-change API call */
    setName: (name: string) => void;
    setUsername: (username: string | null) => void;
    setProfilePicture: (profilePicture: string | null) => void;
    /** Full re-fetch from the backend — use sparingly */
    refresh: () => void;
}

const UserContext = createContext<UserContextValue | null>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
    const { getAccessTokenSilently, isAuthenticated, isLoading: authLoading } = useAuth0();
    const [name, setName] = useState('');
    const [username, setUsername] = useState<string | null>(null);
    const [role, setRole] = useState<UserRole>(null);
    const [blocked, setBlocked] = useState(false);
    const [profilePicture, setProfilePicture] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    function load() {
        console.log('[UserContext] load() called — authLoading:', authLoading, 'isAuthenticated:', isAuthenticated);

        if (authLoading || !isAuthenticated) {
            console.log('[UserContext] Skipping fetch (not ready or not authenticated)');
            setLoading(false);
            return;
        }

        let cancelled = false;
        setLoading(true);
        console.log('[UserContext] Fetching /api/me ...');

        getAccessTokenSilently({ authorizationParams: { audience: AUTH0_AUDIENCE } })
            .then((token) => {
                console.log('[UserContext] Got access token, calling fetchMe');
                return fetchMe(token);
            })
            .then((data) => {
                if (!cancelled) {
                    console.log('[UserContext] fetchMe success →', { name: data.name, role: data.role, blocked: data.blocked, profilePicture: !!data.profilePicture });
                    setName(data.name);
                    setUsername(data.username);
                    setRole(data.role);
                    setBlocked(data.blocked);
                    setProfilePicture(data.profilePicture);
                    setLoading(false);
                }
            })
            .catch((err) => {
                console.error('[UserContext] fetchMe error:', err);
                if (!cancelled) {
                    setError(err instanceof Error ? err.message : 'Unknown error');
                    setLoading(false);
                }
            });

        return () => { cancelled = true; };
    }

    // Run exactly once after Auth0 finishes loading and user is authenticated.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => load(), [authLoading, isAuthenticated]);

    return (
        <UserContext.Provider value={{ name, username, role, blocked, profilePicture, loading, error, setName, setUsername, setProfilePicture, refresh: load }}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser(): UserContextValue {
    const ctx = useContext(UserContext);
    if (!ctx) throw new Error('useUser must be used within <UserProvider>');
    return ctx;
}
