/* 
    * useInventory.ts
    * Custom React hook for fetching and managing inventory data from the backend API, with integrated Auth0 authentication handling.
    * This hook abstracts away the complexities of token retrieval and error management, 
    * providing a simple interface for components to access inventory data along with loading and error states.
    * Author: Ida Tollaksen
 */

import { useAuth0 } from "@auth0/auth0-react";
import { useCallback, useEffect, useState } from "react";
import { fetchInventory } from "../../api/storage";
import type { InventoryItem } from "../../types";
import { useApiAccessToken } from "../useApiAccessToken";

export function useInventory() {
    const {
        isAuthenticated,
        isLoading: authLoading,
    } = useAuth0();
    const { getApiAccessToken } = useApiAccessToken();

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

                const token = await getApiAccessToken();

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
        getApiAccessToken,
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
