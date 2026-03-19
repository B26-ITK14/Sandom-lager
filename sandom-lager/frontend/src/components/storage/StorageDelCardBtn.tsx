import { Trash2 } from "lucide-react";
import { useUser } from "../../context/UserContext";

type StorageDelCardBtnProps = {
    name: string;
    onClick?: () => void;
    disabled?: boolean;
};

const DELETE_ALLOWED_ROLES = ["admin"];

export default function StorageDelCardBtn({
    name,
    onClick,
    disabled = false,
}: StorageDelCardBtnProps) {
    const { role, loading } = useUser();

    if (loading) {
        return null;
    }

    if (!role || !DELETE_ALLOWED_ROLES.includes(role)) {
        return null;
    }

    return(
        <button
            type="button"
            className="grid h-11 w-11 place-items-center rounded-full transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
            style={{ backgroundColor: "#ee9da1", color: "#000" }}
            aria-label={`Slett ${name}`}
            onClick={onClick}
            disabled={disabled}
        >
            <Trash2 size={20} />
        </button>
    )
}