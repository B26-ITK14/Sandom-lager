/*
    * NewApplicationSection.tsx
    * Presentational section for creating a new location access application.
*/

import { ChevronDown } from "lucide-react";
import type { LocationOption } from "./types";

interface NewApplicationSectionProps {
    selectedLocation: string;
    setSelectedLocation: (value: string) => void;
    isSubmitting: boolean;
    pageLoading: boolean;
    locations: LocationOption[];
    unavailableLocationIds: Set<number>;
    error: string | null;
    success: string | null;
    onCreateApplication: () => void;
}

export default function NewApplicationSection({
    selectedLocation,
    setSelectedLocation,
    isSubmitting,
    pageLoading,
    locations,
    unavailableLocationIds,
    error,
    success,
    onCreateApplication,
}: NewApplicationSectionProps) {
    return (
        <section
            className="rounded-2xl p-5"
            style={{
                backgroundColor: "var(--color-surface)",
                border: "1px solid var(--color-border)",
            }}
        >
            <h2 className="text-base font-semibold" style={{ color: "var(--color-text-primary)" }}>
                Ny søknad
            </h2>

            <div className="mt-4">
                <label
                    htmlFor="new-location-application"
                    className="mb-1.5 block text-xs font-medium uppercase tracking-wide"
                    style={{ color: "var(--color-text-secondary)" }}
                >
                    Velg sted
                </label>
                <div className="relative">
                    <select
                        id="new-location-application"
                        value={selectedLocation}
                        onChange={(event) => setSelectedLocation(event.target.value)}
                        disabled={isSubmitting || pageLoading}
                        className="w-full appearance-none rounded-xl border px-3 py-2.5 pr-10 text-sm"
                        style={{
                            borderColor: "var(--color-border)",
                            color: "var(--color-text-primary)",
                            backgroundColor: "var(--color-background)",
                        }}
                    >
                        <option value="">Velg lokasjon...</option>
                        {locations.map((location) => {
                            const unavailable = unavailableLocationIds.has(location.id);
                            return (
                                <option key={location.id} value={location.id} disabled={unavailable}>
                                    {location.name}
                                    {unavailable ? " (allerede søkt/godkjent)" : ""}
                                </option>
                            );
                        })}
                    </select>

                    <span
                        className="pointer-events-none absolute inset-y-0 right-3 flex items-center"
                        style={{ color: "var(--color-text-secondary)" }}
                        aria-hidden="true"
                    >
                        <ChevronDown size={16} />
                    </span>
                </div>
            </div>

            {error && (
                <p
                    className="mt-4 rounded-lg px-3 py-2 text-xs"
                    style={{ backgroundColor: "#FEE2E2", color: "var(--color-danger)" }}
                >
                    {error}
                </p>
            )}

            {success && (
                <p
                    className="mt-4 rounded-lg px-3 py-2 text-xs"
                    style={{ backgroundColor: "#DCFCE7", color: "#166534" }}
                >
                    {success}
                </p>
            )}

            <button
                onClick={onCreateApplication}
                disabled={isSubmitting || !selectedLocation}
                className="mt-4 w-full rounded-xl py-2.5 text-sm font-semibold transition-all duration-150 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                style={{
                    backgroundColor: "var(--color-primary)",
                    color: "var(--color-on-primary)",
                }}
            >
                {isSubmitting ? "Sender søknad..." : "Send ny søknad"}
            </button>
        </section>
    );
}
