/*
    * UserContext.tsx
    * Provides global user information and state, such as name, username, role, profile picture, and location.
    * Fetches user data from the backend on app load and handles authentication errors globally.
*/

/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { AUTH0_AUDIENCE } from '../config/auth';
import { fetchMe } from '../api/user';
import { ApiError } from '../api/client';
import { useAuthError } from './useAuthError';
import type { UserRole } from '../api/user';

interface UserContextValue {
    name: string;
    username: string | null;
    role: UserRole;
    blocked: boolean;
    profilePicture: string | null;
    location: string | null;
    loading: boolean;
    error: string | null;
    /** Optimistic local update — call after a successful name-change API call */
    setName: (name: string) => void;
    setUsername: (username: string | null) => void;
    setProfilePicture: (profilePicture: string | null) => void;
    setLocation: (location: string | null) => void;
    /** Full re-fetch from the backend — use sparingly */
    refresh: () => void;
}

const UserContext = createContext<UserContextValue | null>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
    const { getAccessTokenSilently, isAuthenticated, isLoading: authLoading } = useAuth0();
    const { handleAuthError } = useAuthError();
    const [name, setName] = useState('');
    const [username, setUsername] = useState<string | null>(null);
    const [role, setRole] = useState<UserRole>(null);
    const [blocked, setBlocked] = useState(false);
    const [profilePicture, setProfilePicture] = useState<string | null>(null);
    const [location, setLocation] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    function load() {
        if (authLoading || !isAuthenticated) {
            setLoading(false);
            return;
        }

        let cancelled = false;
        setLoading(true);

        getAccessTokenSilently({ authorizationParams: { audience: AUTH0_AUDIENCE } })
            .then((token) => {
                return fetchMe(token);
            })
            .then((data) => {
                if (!cancelled) {
                    setName(data.name);
                    setUsername(data.username);
                    setRole(data.role);
                    setBlocked(data.blocked);
                    setProfilePicture(data.profilePicture);
                    setLocation(data.location);
                    setLoading(false);
                }
            })
            .catch((err) => {
                // Handle 401 (Unauthorized) errors
                if (err instanceof ApiError && err.status === 401) {
                    handleAuthError(401, err.detail || err.message);
                    return;
                }
                
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
        <UserContext.Provider value={{ name, username, role, blocked, profilePicture, location, loading, error, setName, setUsername, setProfilePicture, setLocation, refresh: load }}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser(): UserContextValue {
    const ctx = useContext(UserContext);
    if (!ctx) throw new Error('useUser must be used within <UserProvider>');
    return ctx;
}
