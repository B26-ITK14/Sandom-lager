/*
    * DeleteShoppingListButton.tsx
    * A button component for deleting the entire shopping list. When clicked, it opens a confirmation dialog to prevent accidental deletions.
    * Only users with the "admin" or "manager" role can delete the shopping list. If the user does not have permission, the dialog will inform them of this.
    * The component handles the deletion process by calling the clearShoppingList API function and provides feedback on success or failure.
    * Author: Andreas Skaarberg
*/


import { useState } from "react";
import { Trash2 } from "lucide-react";
import { useAuth0 } from "@auth0/auth0-react";
import { clearShoppingList } from "../../api";
import { useUser } from "../../context/UserContext";

interface Props {
    onDeleted?: () => void;
}

export default function DeleteShoppingListButton({ onDeleted }: Props) {
    const { role } = useUser();
    const { getAccessTokenSilently } = useAuth0();

    const [isOpen, setIsOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const canDeleteAll = role === "admin" || role === "manager";

    const handleConfirmDelete = async () => {
        if (!canDeleteAll) return;

        setIsDeleting(true);
        setError(null);

        try {
            const token = await getAccessTokenSilently();
            await clearShoppingList(token);
            setIsOpen(false);
            onDeleted?.();
        } catch {
            setError("Kunne ikke slette handlelisten");
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <>
            <button
                onClick={() => {
                    setError(null);
                    setIsOpen(true);
                }}
                className="flex items-center gap-2 py-2 px-4 rounded-md font-medium transition-all hover:shadow-md cursor-pointer"
                style={{
                    background: "var(--color-danger, #f44336)",
                    color: "white",
                }}
                title="Slett hele handlelisten"
            >
                <Trash2 size={20} />
                <span>Slett</span>
            </button>

            {isOpen && (
                <div
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="delete-shopping-list-title"
                    className="fixed inset-0 flex items-center justify-center z-50"
                    style={{ backgroundColor: "rgba(0, 0, 0, 0.35)" }}>
                    <div
                        className="w-full max-w-md rounded-xl p-6"
                        style={{
                            background: "var(--color-surface)",
                            border: "1px solid var(--color-border)",
                        }}>
                        <h2
                            id="delete-shopping-list-title"
                            className="text-xl font-medium"
                            style={{ color: "var(--color-text-primary)" }}>
                            Advarsel!
                        </h2>

                        <p className="mt-2 text-sm" style={{ color: "var(--color-text-secondary)" }}>
                            {canDeleteAll
                                ? "Hvis du sletter handlelisten må du velge oppskrifter på nytt for gjeldende handleliste."
                                : "Du har ikke rettigheter til å slette handlelisten."}
                        </p>

                        {error && (
                            <p className="mt-3 text-sm" style={{ color: "var(--color-error, #d32f2f)" }}>
                                {error}
                            </p>
                        )}

                        <footer className="mt-6 flex justify-end gap-3">
                            {canDeleteAll && (
                                <button
                                    onClick={handleConfirmDelete}
                                    disabled={isDeleting}
                                    className="py-2 px-4 rounded-md transition-opacity cursor-pointer disabled:cursor-not-allowed"
                                    style={{
                                        background: "#c62828",
                                        color: "#ffffff",
                                        opacity: isDeleting ? 0.6 : 1,
                                    }}>
                                    {isDeleting ? "Sletter..." : "Slett handleliste"}
                                </button>
                            )}

                            <button
                                onClick={() => setIsOpen(false)}
                                disabled={isDeleting}
                                className="py-2 px-4 rounded-md transition-opacity cursor-pointer disabled:cursor-not-allowed"
                                style={{
                                    background: "var(--color-primary)",
                                    color: "var(--color-on-primary)",
                                    opacity: isDeleting ? 0.6 : 1,
                                }}>
                                Avbryt
                            </button>
                        </footer>
                    </div>
                </div>
            )}
        </>
    );
}
