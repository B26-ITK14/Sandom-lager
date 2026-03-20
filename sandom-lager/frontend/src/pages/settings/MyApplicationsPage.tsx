/*
    * MyApplicationsPage.tsx
    * Page for managing user's applications to access different locations. Users can view the status of their applications and submit new ones. 
    * Author: Emil Berglund
    TODO: Fetch access status from DB
    TODO: Move functions to API file
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import SettingsLayout from "../../components/settings/SettingsLayout";
import {
    fetchLocations,
    fetchMyLocationAccess,
    requestLocationAccess,
} from "../../api/userLocations";

type AccessStatus = "pending" | "approved" | "denied";

type MyApplication = {
    id: string;
    locationId: number;
    locationName: string;
    accessStatus: AccessStatus;
};

type LocationOption = {
    id: number;
    name: string;
};

function statusLabel(status: AccessStatus): string {
    if (status === "approved") return "Godkjent";
    if (status === "denied") return "Avslått";
    return "Under behandling";
}

function statusStyle(status: AccessStatus): { bg: string; text: string } {
    if (status === "approved") return { bg: "#DCFCE7", text: "#166534" };
    if (status === "denied") return { bg: "#FEE2E2", text: "#991B1B" };
    return { bg: "#FEF9C3", text: "#854D0E" };
}

export default function MyApplicationsPage() {
    const { getAccessTokenSilently, isAuthenticated, isLoading } = useAuth0();
    const [locations, setLocations] = useState<LocationOption[]>([]);
    const [applications, setApplications] = useState<MyApplication[]>([]);
    const [selectedLocation, setSelectedLocation] = useState<string>("");
    const [pageLoading, setPageLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const unavailableLocationIds = useMemo(() => {
        return new Set(
            applications
                .filter((app) => app.accessStatus === "pending" || app.accessStatus === "approved")
                .map((app) => app.locationId)
        );
    }, [applications]);

    const loadData = useCallback(async () => {
        if (!isAuthenticated || isLoading) return;
        setError(null);

        try {
            const token = await getAccessTokenSilently();
            const [locationData, applicationData] = await Promise.all([
                fetchLocations(token),
                fetchMyLocationAccess(token),
            ]);

            const mappedLocations: LocationOption[] = (locationData as Array<{ id: number; name: string }>).map(
                (location) => ({
                    id: location.id,
                    name: location.name,
                })
            );

            const mappedApplications: MyApplication[] = (
                applicationData as Array<{
                    id: number;
                    location_id?: number;
                    name?: string;
                    location_name?: string;
                    access_status: AccessStatus;
                }>
            ).map((application, index) => {
                const locationId = Number(application.location_id ?? application.id);
                const locationName = application.location_name ?? application.name ?? `Lokasjon ${locationId}`;

                return {
                    id: `${locationId}-${index}-${application.access_status}`,
                    locationId,
                    locationName,
                    accessStatus: application.access_status,
                };
            });

            setLocations(mappedLocations);
            setApplications(mappedApplications);
        } catch {
            setError("Kunne ikke laste søknadene dine.");
        } finally {
            setPageLoading(false);
        }
    }, [getAccessTokenSilently, isAuthenticated, isLoading]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    async function handleCreateApplication() {
        if (!selectedLocation) {
            setError("Velg et sted før du sender søknad.");
            return;
        }

        setError(null);
        setSuccess(null);
        setIsSubmitting(true);

        try {
            const token = await getAccessTokenSilently();
            await requestLocationAccess(token, Number(selectedLocation));
            setSuccess("Søknaden er sendt.");
            await loadData();
            setSelectedLocation("");
        } catch {
            setError("Kunne ikke sende søknad. Du har kanskje allerede søkt for denne lokasjonen.");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <SettingsLayout title="Mine søknader">
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
                <section
                    className="rounded-2xl p-5"
                    style={{
                        backgroundColor: "var(--color-surface)",
                        border: "1px solid var(--color-border)",
                    }}
                >
                    <div className="mb-4">
                        <h2 className="text-lg font-semibold" style={{ color: "var(--color-text-primary)" }}>
                            Tidligere søknader
                        </h2>
                        <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                            Her ser du status på alle søknadene dine.
                        </p>
                    </div>

                    {pageLoading ? (
                        <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                            Laster søknader...
                        </p>
                    ) : applications.length === 0 ? (
                        <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                            Du har ikke sendt noen søknader enda.
                        </p>
                    ) : (
                        <div className="space-y-3">
                            {applications.map((application) => {
                                const statusColors = statusStyle(application.accessStatus);
                                return (
                                    <article
                                        key={application.id}
                                        className="rounded-xl border p-4"
                                        style={{ borderColor: "var(--color-border)" }}
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <h3
                                                    className="text-sm font-semibold"
                                                    style={{ color: "var(--color-text-primary)" }}
                                                >
                                                    {application.locationName}
                                                </h3>
                                                <p
                                                    className="mt-1 text-xs"
                                                    style={{ color: "var(--color-text-secondary)" }}
                                                >
                                                    Lokasjon-ID: {application.locationId}
                                                </p>
                                            </div>

                                            <span
                                                className="rounded-full px-3 py-1 text-xs font-semibold"
                                                style={{
                                                    backgroundColor: statusColors.bg,
                                                    color: statusColors.text,
                                                }}
                                            >
                                                {statusLabel(application.accessStatus)}
                                            </span>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    )}
                </section>

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
                        <select
                            id="new-location-application"
                            value={selectedLocation}
                            onChange={(event) => setSelectedLocation(event.target.value)}
                            disabled={isSubmitting || pageLoading}
                            className="w-full rounded-xl border px-3 py-2.5 text-sm"
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
                        onClick={handleCreateApplication}
                        disabled={isSubmitting || !selectedLocation}
                        className="mt-4 w-full rounded-xl py-2.5 text-sm font-semibold transition-all duration-150 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                        style={{
                            backgroundColor: "var(--color-primary)",
                            color: "var(--color-on-primary)",
                        }}
                    >
                        {isSubmitting ? "Sender søknad..." : "Send ny søknad"}
                    </button>
                </section>
            </div>
        </SettingsLayout>
    );
}
