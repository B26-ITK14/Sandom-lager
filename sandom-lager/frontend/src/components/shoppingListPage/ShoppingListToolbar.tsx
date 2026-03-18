interface Props {
    onAddItem: () => void;
}

export default function ShoppingListToolbar({ onAddItem }: Props) {
    return (
        <header className="flex items-center justify-between gap-4">
            <div>
                <p className="mt-1 text-sm"
                    style={{ color: "var(--color-text-secondary)" }}>
                    Juster mengde eller legg til varer manuelt.
                </p>
            </div>

            <button
                onClick={onAddItem}
                className="mt-4 py-2 px-4 rounded-md transition-colors"
                style={{
                    background: "var(--color-primary)",
                    color: "var(--color-on-primary)",
                }}
                >
                 + Legg til vare
                </button>
        </header>
    );
}