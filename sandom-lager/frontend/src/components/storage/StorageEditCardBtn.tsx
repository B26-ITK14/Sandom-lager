/**
* StorageEditCardBtn.tsx
* A button component for editing or saving changes to an inventory item.
*/

import { Check, Pencil } from "lucide-react";

type StorageEditCardBtnProps = {
    name: string;
    onClick?: () => void;
    disabled?: boolean;
    isSaving?: boolean;
};

export default function StorageEditCardBtn({
    name,
    onClick,
    disabled = false,
    isSaving = false,
}: StorageEditCardBtnProps) {
    return(
        <button
            type="button"
            className="grid h-11 w-11 place-items-center rounded-full transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
            style={{ backgroundColor: "#f2cf8e", color: "#000" }}
            aria-label={isSaving ? `Lagre endringer for ${name}` : `Rediger ${name}`}
            onClick={onClick}
            disabled={disabled}
        >
            {isSaving ? <Check size={20} /> : <Pencil size={20} />}
        </button>
    )
}