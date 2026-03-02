/*
    * useName.ts
    * Custom React hooks for retrieving and formatting user name information from Auth0 user data. 
    * These hooks provide a consistent way to access the user's username, first name, last name, and full name across the application.
    * Author: Emil Berglund
 */

import { useMemo } from 'react';
import { useAuth0 } from '@auth0/auth0-react';

/*
TODO: Update Auth0 to require firstname and lastname in login-process.
*/


/**
 * Hook to get the formatted username from Auth0 user data
 * Returns username with first letter capitalized and rest lowercase
 */
export function useUsername(): string {
    const { user } = useAuth0();
    
    const username = useMemo(() => {
        const rawUsername = 
            (user as Record<string, unknown>)?.[`https://sandom-lager.app/username`] as string | undefined 
            || user?.username 
            || user?.nickname 
            || 'Bruker';
        
        return rawUsername.charAt(0).toUpperCase() + rawUsername.slice(1).toLowerCase();
    }, [user]);

    return username;
}

/**
 * Hook to get the user's first name from Auth0 user data
 * Returns first name with first letter capitalized and rest lowercase
 */
export function useFirstName(): string {
    const { user } = useAuth0();
    
    const firstName = useMemo(() => {
        const rawFirstName = 
            user?.given_name 
            || user?.name?.split(' ')[0] 
            || user?.username 
            || user?.nickname 
            || 'Bruker';
        
        return rawFirstName.charAt(0).toUpperCase() + rawFirstName.slice(1).toLowerCase();
    }, [user]);

    return firstName;
}

/**
 * Hook to get the user's last name from Auth0 user data
 * Returns last name with first letter capitalized and rest lowercase
 */
export function useLastName(): string {
    const { user } = useAuth0();
    
    const lastName = useMemo(() => {
        const rawLastName = 
            user?.family_name 
            || user?.name?.split(' ').slice(1).join(' ') 
            || '';
        
        return rawLastName ? rawLastName.charAt(0).toUpperCase() + rawLastName.slice(1).toLowerCase() : '';
    }, [user]);

    return lastName;
}

/**
 * Hook to get the user's full name from Auth0 user data
 * Returns the full name or constructs it from first and last name
 */
export function useFullName(): string {
    const { user } = useAuth0();
    
    const fullName = useMemo(() => {
        if (user?.name) {
            return user.name;
        }
        
        const firstName = user?.given_name || user?.name?.split(' ')[0] || '';
        const lastName = user?.family_name || user?.name?.split(' ').slice(1).join(' ') || '';
        
        if (firstName && lastName) {
            return `${firstName} ${lastName}`;
        }
        
        return firstName || user?.username || user?.nickname || 'Bruker';
    }, [user]);

    return fullName;
}
