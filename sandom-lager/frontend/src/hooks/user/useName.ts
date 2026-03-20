/*
    * useName.ts
    * Custom React hooks for retrieving and formatting user name information from Auth0 user data. 
    * These hooks provide a consistent way to access the user's username and full name across the application.
    * Author: Emil Berglund
 */

import { useMemo } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useUser } from '../../context/UserContext';

/*
 * Hook to get the formatted username from Auth0 user data
 * Returns username with first letter capitalized and rest lowercase
 */
export function useUppercaseUsername(): string {
    const { user } = useAuth0();
    const { username: contextUsername } = useUser();
    
    const username = useMemo(() => {
        const rawUsername =
            contextUsername
            ||
            (user as Record<string, unknown>)?.[`https://sandom-lager.app/username`] as string | undefined 
            || user?.username 
            || user?.nickname 
            || 'Bruker';
        
        return rawUsername.charAt(0).toUpperCase() + rawUsername.slice(1).toLowerCase();
    }, [contextUsername, user]);
    return username;
}

/*
    * Hook to get the username from Auth0 user data
    * Returns the username or nickname, or a default value if not available
    * Checks for a custom claim first, then falls back to standard Auth0 fields
 */
export function useUsername(): string {
    const { user } = useAuth0();
    const { username: contextUsername } = useUser();
    
    const username = useMemo(() => {
        const rawUsername =
            contextUsername
            ||
            (user as Record<string, unknown>)?.[`https://sandom-lager.app/username`] as string | undefined 
            || user?.username 
            || user?.nickname 
            || 'Bruker';
        
        return rawUsername;
    }, [contextUsername, user]);
    return username;
}

/**
 * Hook to get the user's full name from Auth0 user data.
 */
export function useFullName(): string {
    const { user } = useAuth0();

    return useMemo(() => (user?.name ?? '').trim(), [user]);
}
