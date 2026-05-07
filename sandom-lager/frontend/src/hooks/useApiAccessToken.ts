/* useApiAccessToken.ts 
* Custom React hook for retrieving an API access token from Auth0, with built-in handling for 
* token retrieval errors that may require user interaction like consent or login
*/

import { useAuth0 } from "@auth0/auth0-react";
import { useCallback } from "react";
import { AUTH0_AUDIENCE } from "../config/auth";

type Auth0ErrorShape = { error?: string; message?: string };

function isAuth0Error(error: unknown): error is Auth0ErrorShape {
    return typeof error === "object" && error !== null;
}

export function useApiAccessToken() {
    const { getAccessTokenSilently, getAccessTokenWithPopup } = useAuth0();

    const getApiAccessToken = useCallback(async (): Promise<string> => {
        try {
            return await getAccessTokenSilently({
                authorizationParams: { audience: AUTH0_AUDIENCE },
            });
        } catch (error) {
            if (
                isAuth0Error(error) &&
                (error.error === "consent_required" || error.error === "login_required")
            ) {
                const popupToken = await getAccessTokenWithPopup({
                    authorizationParams: { audience: AUTH0_AUDIENCE },
                });

                if (!popupToken) {
                    throw new Error("Kunne ikke hente tilgangstoken.");
                }

                return popupToken;
            }

            throw error;
        }
    }, [getAccessTokenSilently, getAccessTokenWithPopup]);

    return { getApiAccessToken };
}
