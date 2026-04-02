/*
* FavProductBtn.tsx
* A button component for marking a product as a favorite in the storage page.
*/

import { Star } from "lucide-react";

type FavProductBtnProps = {
    name: string;
    onClick?: () => void;
    disabled?: boolean;
    isSaved?: boolean;
}

export default function FavProductBtn({ 
    name, 
    onClick, 
    disabled = false, 
    isSaved = false 
}: FavProductBtnProps) {
    return(
        <button
            type="button"
            className="grid h-11 w-11 place-items-center rounded-full transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
            aria-label={`Marker ${name} som favoritt`}
            onClick={onClick}
            disabled={disabled}
        >
            {isSaved ? 
            <Star size={20} style={{ fill: "#f2cf8e", color: "#f2cf8e" }} /> : 
            <Star size={20} style={{ fill: "none", color: "#f2cf8e" }} />}
        </button>
    )
}