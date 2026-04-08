/*
    * useRecipeIngredients.ts
    * Custom hook to fetch all ingredients for a specific recipe.
    * Returns the ingredient list, a loading state, and any error.
*/

import { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { AUTH0_AUDIENCE } from '../../config/auth';
import { fetchRecipeIngredients } from '../../api/recipes';
import type { RecipeIngredient } from '../../types';

interface UseRecipeIngredientsResult {
    ingredients: RecipeIngredient[];
    loading: boolean;
    error: string | null;
}

export function useRecipeIngredients(recipeId: number | null): UseRecipeIngredientsResult {
    const { getAccessTokenSilently, isAuthenticated } = useAuth0();
    const [ingredients, setIngredients] = useState<RecipeIngredient[]>([]);
    const [loading, setLoading] = useState(recipeId !== null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!isAuthenticated || recipeId === null) {
            setIngredients([]);
            return;
        }

        let cancelled = false;
        setLoading(true);
        setError(null);

        async function loadIngredients() {
            try {
                const token = await getAccessTokenSilently({
                    authorizationParams: {
                        audience: AUTH0_AUDIENCE,
                    },
                });

                const data = await fetchRecipeIngredients(recipeId!, token);

                if (!cancelled) setIngredients(data);
            } catch (err) {
                console.error('[useRecipeIngredients] Error:', err);
                if (!cancelled) setError(err instanceof Error ? err.message : 'Kunne ikke laste ingredienser');
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        loadIngredients();

        return () => { cancelled = true; };
    }, [isAuthenticated, getAccessTokenSilently, recipeId]);

    return { ingredients, loading, error };
}
