/*
    * SelectedRecipesContext.tsx
    * Provides a global set of selected recipe IDs that can be read and modified from any page
    * For example, RecipesPage selects recipes, ShoppingListPage uses them.
*/

/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

interface SelectedRecipesContextType {
    selectedIds: Set<number>;
    toggleSelected: (id: number) => void;
    clearSelected: () => void;
}

const SelectedRecipesContext = createContext<SelectedRecipesContextType | undefined>(undefined);

export function SelectedRecipesProvider({ children }: { children: ReactNode }) {
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

    function toggleSelected(id: number) {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    }

    function clearSelected() {
        setSelectedIds(new Set());
    }

    return (
        <SelectedRecipesContext.Provider value={{ selectedIds, toggleSelected, clearSelected }}>
            {children}
        </SelectedRecipesContext.Provider>
    );
}

export function useSelectedRecipes(): SelectedRecipesContextType {
    const context = useContext(SelectedRecipesContext);
    if (context === undefined) {
        throw new Error("useSelectedRecipes must be used within a SelectedRecipesProvider");
    }
    return context;
}
