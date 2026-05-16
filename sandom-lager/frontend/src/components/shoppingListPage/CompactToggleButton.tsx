/*
    * CompactToggleButton.tsx
    * A toggle button for switching between compact and detailed views of the shopping list.
    * Displays an icon and label indicating the current view mode, and calls the onChange callback with the new mode when clicked.
    * Author: Emil Berglund
*/

import { List, ListCollapse } from "lucide-react";

interface Props {
    isCompact: boolean;
    onChange: (compact: boolean) => void;
}

export default function CompactToggleButton({ isCompact, onChange }: Props) {
    return (
        <button
            onClick={() => onChange(!isCompact)}
            className="flex items-center gap-2 py-2 px-4 rounded-md font-medium transition-all border hover:shadow-md cursor-pointer"
            style={{
                background: "var(--color-secondary-surface)",
                borderColor: "var(--color-border)",
                color: "var(--color-text-primary)",
            }}
            title={isCompact ? "Bytt til detaljert visning" : "Bytt til kompakt visning"}
        >
            {isCompact ? <List size={20} /> : <ListCollapse size={20} />}
            <span>{isCompact ? "Detaljert" : "Kompakt"}</span>
        </button>
    );
}
