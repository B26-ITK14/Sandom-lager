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