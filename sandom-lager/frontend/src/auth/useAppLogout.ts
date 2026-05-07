/*
    * useAppLogout.ts
    * A custom React hook that provides a logout function for the application, which clears client-side storage and logs the user out using Auth0.
    * It also manages a loading state to indicate when the logout process is in progress, allowing components to display a loading overlay if needed.
*/

import { useAuth0 } from "@auth0/auth0-react";
import { useCallback, useState } from "react";

function clearClientStorage() {
    localStorage.clear();
    sessionStorage.clear();
}

export function useAppLogout(onBeforeRedirect?: () => void) {
    const { logout } = useAuth0();
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const logoutUser = useCallback(async () => {
        setIsLoggingOut(true);

        onBeforeRedirect?.();
        clearClientStorage();

        try {
            await logout({
                logoutParams: {
                    returnTo: window.location.origin,
                },
            });
        } catch {
            setIsLoggingOut(false);
        }
    }, [logout, onBeforeRedirect]);

    return { logoutUser, isLoggingOut };
}
