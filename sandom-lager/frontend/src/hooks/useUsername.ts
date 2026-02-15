import { useMemo } from 'react';
import { useAuth0 } from '@auth0/auth0-react';

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
