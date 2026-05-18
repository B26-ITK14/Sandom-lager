/*
    * EmptyShoppingList.tsx
    * A presentational component that renders a message indicating that the shopping list is empty, along with instructions on how to add items.
    * Used in the ShoppingListPage when there are no items in the shopping list to provide a user-friendly message and guidance.
    * Author: Andreas Skaarberg
*/

export function EmptyShoppingList() {
    return (
        <section
            aria-label="Tom handleliste"
            className="rounded-xl p-6"
            style={{
                background: "var(--color-surface)",
                border: "1px solid var(--color-border)",
            }}>

            <p style={{ color: "var(--color-text-primary)" }}>
                Handlelisten er tom.
            </p>
            <p className="mt-1"
                style={{ color: "var(--color-text-secondary)" }}>
                Velg oppskrifter eller legg til varer manuelt for å fylle handlelisten.
            </p>
        </section>
    );
}