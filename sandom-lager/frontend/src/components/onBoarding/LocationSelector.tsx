/*
    * LocationSelector.tsx
    * Dropdown-komponent for å velge lokasjon (Sandom / Tomasgården)
    * Brukes i RequestAccessPage under onboarding-flyten.
    * Author: Khalid Osman
*/

import { ChevronDown } from "lucide-react";

export interface Location {
    id: string;
    name: string;
}

interface LocationSelectorProps {
    locations: Location[];
    selectedId: string | null;
    onChange: (id: string) => void;
    disabled?: boolean;
}

export default function LocationSelector({
    locations,
    selectedId,
    onChange,
    disabled = false,
}: LocationSelectorProps) {
    return (
        <div className="relative w-full">
            <select
                value={selectedId ?? ""}
                onChange={(e) => onChange(e.target.value)}
                disabled={disabled}
                className="w-full appearance-none rounded-xl border px-4 py-3 pr-10 text-sm font-medium focus:outline-none focus:ring-2 transition-all duration-200"
                style={{
                    backgroundColor: 'var(--color-surface)',
                    borderColor: 'var(--color-border)',
                    color: selectedId ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                    opacity: disabled ? 0.5 : 1,
                    cursor: disabled ? 'not-allowed' : 'pointer',
                }}
            >
                <option value="" disabled>
                    Velg et sted...
                </option>
                {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                        {loc.name}
                    </option>
                ))}
            </select>

            <div
                className="pointer-events-none absolute inset-y-0 right-3 flex items-center"
                style={{ color: 'var(--color-text-secondary)' }}
            >
                <ChevronDown size={16} />
            </div>
        </div>
    );
}