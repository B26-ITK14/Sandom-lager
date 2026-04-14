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
        <article className="rounded-xl border px-4 py-3" style={{ borderColor: "#d4d6db", backgroundColor: "#f8fafc" }}>
            <p className="text-sm font-semibold" style={{ color: "#253042" }}>
                Slett {name} fra lageret?
            </p>
            <p className="mt-1 text-xs" style={{ color: "#5f6470" }}>
                Denne handlingen kan ikke angres.
            </p>

            <section className="mt-3 flex gap-2">
                <button
                    type="button"
                    onClick={onConfirm}
                    disabled={disabled}
                    className="rounded-md px-3 py-1 text-xs font-semibold cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                    style={{ backgroundColor: "#ee9da1", color: "#111" }}
                >
                    Ja, slett
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={disabled}
                    className="rounded-md border px-3 py-1 text-xs font-semibold cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                    style={{ borderColor: "#c7c8cb", color: "#4c5561", backgroundColor: "#f7f7f8" }}
                >
                    Nei
                </button>
            </section>
        </article>
    )
}