import { Plus } from "lucide-react";

interface Props {
    onClick: () => void;
    disabled?: boolean;
}

export default function AddItemButton({ onClick, disabled = false }: Props) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className="flex items-center gap-2 py-2 px-4 rounded-md font-medium transition-all hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            style={{
                background: "var(--color-success, #4caf50)",
                color: "white",
            }}
            title="Legg til en ny vare i handlelisten"
        >
            <Plus size={20} />
            <span>Legg til vare</span>
        </button>
    );
}
