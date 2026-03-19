import { Check, Pencil } from "lucide-react";
import { useUser } from "../../context/UserContext";

type StorageEditCardBtnProps = {
    name: string;
    onClick?: () => void;
    disabled?: boolean;
    isSaving?: boolean;
};

const EDIT_ALLOWED_ROLES = ["admin", "manager"];

export default function StorageEditCardBtn({
    name,
    onClick,
    disabled = false,
    isSaving = false,
}: StorageEditCardBtnProps) {
    const { role, loading } = useUser();

    if (loading) {
        return null;
    }

    if (!role || !EDIT_ALLOWED_ROLES.includes(role)) {
        return null;
    }

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