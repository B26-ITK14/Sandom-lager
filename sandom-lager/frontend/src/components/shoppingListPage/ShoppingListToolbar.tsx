export default function ShoppingListToolbar() {
    return (
        <header className="flex items-center justify-between gap-4">
            <hgroup>
                <h1 className="text-xl font-semibold" style={{ color: "var(--color-text-primary)" }}>
                    Handlelisten
                </h1>
                <p className="mt-1 text-sm"
                    style={{ color: "var(--color-text-secondary)" }}>
                    Juster mengde eller legg til varer manuelt.
                </p>
            </hgroup>
        </header>
    );
}