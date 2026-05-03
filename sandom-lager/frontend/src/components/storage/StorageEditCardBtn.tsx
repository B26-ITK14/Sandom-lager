/**
* StorageEditCardBtn.tsx
* A button component for editing or saving changes to an inventory item.
*/

import { Check, Pencil, X } from "lucide-react";

type StorageEditCardBtnProps = {
    name: string;
    onClick?: () => void;
    disabled?: boolean;
    variant?: "edit" | "confirm" | "cancel";
};

export default function StorageEditCardBtn({
    name,
    onClick,
    disabled = false,
    variant = "edit",
}: StorageEditCardBtnProps) {
    const buttonStyle =
        variant === "confirm"
            ? { backgroundColor: "var(--color-success, #16a34a)", color: "#ffffff", border: "none" }
            : variant === "cancel"
                ? { backgroundColor: "var(--color-danger, #dc2626)", color: "#ffffff", border: "none" }
                : {
                    backgroundColor: "var(--color-secondary-surface)",
                    color: "var(--color-text-primary)",
                    border: "1px solid var(--color-border)",
                };

    const label =
        variant === "confirm"
            ? `Bekreft endringer for ${name}`
            : variant === "cancel"
                ? `Avbryt redigering av ${name}`
                : `Rediger ${name}`;

    return(
        <button
            type="button"
            className="grid h-11 w-11 place-items-center rounded-full cursor-pointer transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
            style={buttonStyle}
            aria-label={label}
            onClick={onClick}
            disabled={disabled}
        >
            {variant === "confirm" ? <Check size={20} /> : variant === "cancel" ? <X size={20} /> : <Pencil size={20} />}
        </button>
    )
}