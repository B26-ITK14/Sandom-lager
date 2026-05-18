/*
    * useRecipes.ts
    * Custom hook to fetch all recipes from the backend API.
    * Returns the recipes array, a loading state, any error, and a refresh function.
    * The refresh function can be called to re-fetch the recipes, which is useful after creating/updating/deleting a recipe to ensure the UI shows the latest data.
    * Author: Sebastian Thomsen
*/

import { useCallback, useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { AUTH0_AUDIENCE } from '../../config/auth';
import { fetchRecipes } from '../../api/recipes';
import type { Recipe } from '../../types';

interface UseRecipesResult {
    recipes: Recipe[];
    loading: boolean;
    error: string | null;
    refresh: () => void;
}

export function useRecipes(): UseRecipesResult {
    const { getAccessTokenSilently, isAuthenticated } = useAuth0();
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [version, setVersion] = useState(0);

    const refresh = useCallback(() => setVersion((v) => v + 1), []);

    useEffect(() => {
        if (!isAuthenticated) {
            setLoading(false);
            return;
        }

        let cancelled = false;

        async function loadRecipes() {
            setLoading(true);
            setError(null);
            try {
                const token = await getAccessTokenSilently({
                    authorizationParams: {
                        audience: AUTH0_AUDIENCE,
                    },
                });

                const data = await fetchRecipes(token);

                if (!cancelled) setRecipes(data);
            } catch (err) {
                if (!cancelled) setError(err instanceof Error ? err.message : 'Kunne ikke laste oppskrifter');
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        loadRecipes();

        return () => { cancelled = true; };
    }, [isAuthenticated, getAccessTokenSilently, version]);

    return { recipes, loading, error, refresh };
}
