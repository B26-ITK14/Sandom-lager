import { Trash2 } from "lucide-react";

type StorageDelCardBtnProps = {
    name: string;
}

export default function StorageDelCardBtn({ name }: StorageDelCardBtnProps) {
    return(
        <button
            type="button"
            className="grid h-11 w-11 place-items-center rounded-full"
            style={{ backgroundColor: "#ee9da1", color: "#000" }}
            aria-label={`Slett ${name}`}
        >
            <Trash2 size={20} />
        </button>
    )
}