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
            type="button"
            onClick={() => onChange(!isCompact)}
            aria-label={isCompact ? "Bytt til detaljert visning" : "Bytt til kompakt visning"}
            className="flex items-center justify-center w-11 h-11 rounded-full shrink-0 transition-colors cursor-pointer"
            style={{
                backgroundColor: isCompact ? "var(--color-primary)" : "var(--color-surface)",
                color: isCompact ? "var(--color-on-primary)" : "var(--color-text-primary)",
                border: "1px solid var(--color-border)",
            }}
            title={isCompact ? "Bytt til detaljert visning" : "Bytt til kompakt visning"}
        >
            {isCompact ? <List size={20} /> : <ListCollapse size={20} />}
        </button>
    );
}
