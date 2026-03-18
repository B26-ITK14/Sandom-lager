interface Props {
        isOpen: boolean;
        onClose: () => void;
}

export default function AddShoppingItemModal({ isOpen, onClose }: Props) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50"
            style={{ backgroundColor: "rgba(0, 0, 0, 0.35)" }}>

            <div className="w-full max-w-md rounded-xl p-6"
                style={{
                    background: "var(--color-surface)",
                    border: "1px solid var(--color-border)",
                }}>

                <h2
                    className="text-xl font-medium"
                    style={{ color: "var(--color-text-primary)" }}>
                    Legg til vare
                </h2>

                <p className="mt-2 text-sm"
                    style={{ color: "var(--color-text-secondary)" }}>
                    Legg til en ny vare i handlelisten din. (Denne funksjonen er under utvikling.)
                </p>

                <div className="mt-6 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="py-2 px-4 rounded-md"
                        style={{
                            background: "var(--color-secondary-surface)",
                            border: "1px solid var(--color-border)",
                            color: "var(--color-text-primary)",
                        }}>
                        Avbryt
                    </button>
                    <button
                        className="py-2 px-4 rounded-md"
                        style={{
                            background: "var(--color-primary)",
                            color: "var(--color-on-primary)",
                        }}>
                        Lagre
                    </button>
                </div>
            </div>
        </div>
    )
}