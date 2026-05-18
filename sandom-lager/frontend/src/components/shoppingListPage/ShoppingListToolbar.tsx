/*
    * ShoppingListToolbar.tsx
    * The toolbar component for the shopping list page. It provides instructions to the user on how to adjust quantities or add items manually to the shopping list.
    * This component is used at the top of the ShoppingListPage to guide users on how to interact with their shopping list.
    * Author: Andreas Skaarberg
*/

export default function ShoppingListToolbar() {
    return (
        <header className="flex items-center justify-between gap-4">
            <hgroup>
                <p className="mt-1 text-sm"
                    style={{ color: "var(--color-text-secondary)" }}>
                    Juster mengde eller legg til varer manuelt.
                </p>
            </hgroup>
        </header>
    );
}