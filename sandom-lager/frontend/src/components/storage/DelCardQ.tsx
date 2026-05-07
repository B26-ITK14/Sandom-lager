/**
 * DelCardQ.tsx
 * A confirmation card component for deleting an inventory item.
 * Displays the item name and asks the user to confirm or cancel the deletion.
 */

type DelCardQProps = {
    name: string;
    onConfirm: () => void;
    onCancel: () => void;
    disabled?: boolean;
};

export default function DelCardQ({
    name,
    onConfirm,
    onCancel,
    disabled = false,
}: DelCardQProps) {
    return(
        <article
            className="rounded-2xl border px-4 py-4 shadow-lg"
            style={{
                borderColor: "var(--color-border)",
                backgroundColor: "var(--color-surface)",
            }}
            role="dialog"
            aria-modal="true"
            aria-label={`Bekreft sletting av ${name}`}
        >
            <p className="text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>
                Slett {name} fra lageret?
            </p>
            <p className="mt-1 text-xs" style={{ color: "var(--color-text-secondary)" }}>
                Denne handlingen kan ikke angres.
            </p>

            <section className="mt-4 flex justify-end gap-2">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={disabled}
                    className="rounded-md border px-3 py-1.5 text-xs font-semibold cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                    style={{
                        borderColor: "var(--color-border)",
                        color: "var(--color-text-primary)",
                        backgroundColor: "var(--color-secondary-surface)",
                    }}
                >
                    Avbryt
                </button>
                <button
                    type="button"
                    onClick={onConfirm}
                    disabled={disabled}
                    className="rounded-md px-3 py-1.5 text-xs font-semibold cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                    style={{
                        backgroundColor: "var(--color-danger, #dc2626)",
                        color: "#ffffff",
                    }}
                >
                    Slett vare
                </button>
            </section>
        </article>
    )
}