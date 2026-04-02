/* 
    useInventory.ts
    Custom React hook for fetching and managing inventory data from the backend API, with integrated Auth0 authentication handling.
    This hook abstracts away the complexities of token retrieval and error management, 
    providing a simple interface for components to access inventory data along with loading and error states.
 */

import { useAuth0 } from "@auth0/auth0-react";
import { useCallback, useEffect, useState } from "react";
import { fetchInventory } from "../../api/storage";
import { AUTH0_AUDIENCE } from "../../config/auth";
import type { InventoryItem } from "../../types";

type Auth0ErrorShape = { error?: string; message?: string };

function isAuth0Error(error: unknown): error is Auth0ErrorShape {
    return typeof error === "object" && error !== null;
}

export function useInventory() {
    const {
        getAccessTokenSilently,
        getAccessTokenWithPopup,
        isAuthenticated,
        isLoading: authLoading,
    } = useAuth0();

    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [reloadKey, setReloadKey] = useState(0);

    const refresh = useCallback(() => {
        setReloadKey((key) => key + 1);
    }, []);

    useEffect(() => {
        if (authLoading) {
            return;
        }

        if (!isAuthenticated) {
            setInventory([]);
            setErrorMessage(null);
            setIsLoading(false);
            return;
        }

        let cancelled = false;

        async function loadInventory() {
            try {
                setIsLoading(true);
                setErrorMessage(null);

                let token: string;

                try {
                    token = await getAccessTokenSilently({
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
                            throw new Error("Kunne ikke hente tilgang til lagerdata.");
                        }

                        token = popupToken;
                    } else {
                        throw error;
                    }
                }

                const data = await fetchInventory(token);

                if (cancelled) {
                    return;
                }

                setInventory(data);
            } catch (error) {
                if (cancelled) {
                    return;
                }

                setInventory([]);
                setErrorMessage(
                    error instanceof Error ? error.message : "Kunne ikke hente lagerdata."
                );
            } finally {
                if (!cancelled) {
                    setIsLoading(false);
                }
            }
        }

        void loadInventory();

        return () => {
            cancelled = true;
        };
    }, [
        authLoading,
        getAccessTokenSilently,
        getAccessTokenWithPopup,
        isAuthenticated,
        reloadKey,
    ]);

    return {
        inventory,
        isLoading: authLoading || isLoading,
        errorMessage,
        refresh,
    };
}
