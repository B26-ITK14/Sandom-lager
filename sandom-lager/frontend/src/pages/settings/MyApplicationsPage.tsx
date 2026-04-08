/*
    * MyApplicationsPage.tsx
    * Page for managing user's applications to access different locations. Users can view the status of their applications and submit new ones. 
    * Author: Emil Berglund
    TODO: Fetch access status from DB
    TODO: Move functions to API file
    TODO: Make global file for status labels
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import SettingsLayout from "../../components/settings/SettingsLayout";
import ApplicationsHistorySection from "../../components/settings/myApplications/ApplicationsHistorySection";
import NewApplicationSection from "../../components/settings/myApplications/NewApplicationSection";
import type {
    AccessStatus,
    LocationOption,
    MyApplication,
} from "../../components/settings/myApplications/types";
import {
    fetchLocations,
    fetchMyLocationAccess,
    requestLocationAccess,
} from "../../api/userLocations";
import { ACCESS_STATUS } from "../../constants/accessStatus";

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
                .filter((app) => app.accessStatus === ACCESS_STATUS.PENDING || app.accessStatus === ACCESS_STATUS.APPROVED)
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
                    created_at?: string;
                }>
            ).map((application, index) => {
                const locationId = Number(application.location_id ?? application.id);
                const locationName = application.location_name ?? application.name ?? `Lokasjon ${locationId}`;

                return {
                    id: `${locationId}-${index}-${application.access_status}`,
                    locationId,
                    locationName,
                    accessStatus: application.access_status,
                    requestedAt: application.created_at ?? null,
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
            <div className="mx-auto grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
                <ApplicationsHistorySection
                    pageLoading={pageLoading}
                    applications={applications}
                />

                <NewApplicationSection
                    selectedLocation={selectedLocation}
                    setSelectedLocation={setSelectedLocation}
                    isSubmitting={isSubmitting}
                    pageLoading={pageLoading}
                    locations={locations}
                    unavailableLocationIds={unavailableLocationIds}
                    error={error}
                    success={success}
                    onCreateApplication={handleCreateApplication}
                />
            </div>
        </SettingsLayout>
    );
}
