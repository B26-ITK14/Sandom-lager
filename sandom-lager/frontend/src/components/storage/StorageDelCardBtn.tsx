/*
 * StorageDelCardBtn.tsx
* A delete button component for inventory items in the storage page.
 */

import { Trash2 } from "lucide-react";

type StorageDelCardBtnProps = {
    name: string;
    onClick?: () => void;
    disabled?: boolean;
};

export default function StorageDelCardBtn({
    name,
    onClick,
    disabled = false,
}: StorageDelCardBtnProps) {
    return(
        <button
            type="button"
            className="grid h-11 w-11 place-items-center rounded-full cursor-pointer transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
            style={{ backgroundColor: "var(--color-danger, #dc2626)", color: "#ffffff" }}
            aria-label={`Slett ${name}`}
            onClick={onClick}
            disabled={disabled}
        >
            <Trash2 size={20} />
        </button>
    )
}