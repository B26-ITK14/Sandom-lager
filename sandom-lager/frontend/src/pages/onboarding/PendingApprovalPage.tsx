/*
    * PendingApprovalPage.tsx
    * Ventescreen som vises etter at bruker har sendt tilgangssøknad.
    * Brukeren ser status og kan ikke bruke appen før admin godkjenner.
    * Author: Khalid Osman
*/

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { User, MapPin, Clock } from "lucide-react";
import OnBoardingTitle from "../../components/onBoarding/OnBoardingTitle";
import { ROUTES } from "../../router/routes";
import { fetchMyLocationAccess } from "../../api/userLocations";
import { LogoutLoadingOverlay, useAppLogout } from "../../auth";
import { usePageMeta } from "../../hooks";
import type { UserLocationResponse } from "../../types";
import {
    ACCESS_STATUS,
    ACCESS_STATUS_LABELS,
    ACCESS_STATUS_STYLES,
} from "../../constants/accessStatus"
const ACCESS_STATUS_CONST = ACCESS_STATUS;

export default function PendingApprovalPage() {
    usePageMeta({
        title: "Pending Approval - Sandom Lager",
        description: "Your access request is pending admin approval",
        keywords: "pending approval, waiting, access request",
        ogTitle: "Pending Approval - Sandom Lager",
        ogDescription: "Waiting for access approval",
    });
    const navigate = useNavigate();
    const { getAccessTokenSilently, user } = useAuth0();
    const { logoutUser, isLoggingOut } = useAppLogout();
    const [applications, setApplications] = useState<UserLocationResponse[]>([]);
    const [isCheckingStatus, setIsCheckingStatus] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadStatus() {
            try {
                const token = await getAccessTokenSilently();
                const data = await fetchMyLocationAccess(token);
                setApplications(data);
            } catch {
                setApplications([]);
            }
        }
        loadStatus();
    }, [getAccessTokenSilently]);

    const hasApprovedApplication = applications.some((application) => application.access_status === ACCESS_STATUS.APPROVED);

    async function handleCheckStatus() {
        setError(null);
        setIsCheckingStatus(true);
        try {
            const token = await getAccessTokenSilently();
            const data = await fetchMyLocationAccess(token);
            setApplications(data);

            // If there is approved access, navigate to dashboard
            if (data && data.length > 0 && data.some((item) => item.access_status === ACCESS_STATUS_CONST.APPROVED)) {
                navigate(ROUTES.DASHBOARD.path, { replace: true });
            } else if (data && data.length > 0) {
                // Show pending/denied status
                const isPending = data.some((item) => item.access_status === ACCESS_STATUS_CONST.PENDING);
                setError(isPending ? "Søknaden din venter på godkjenning." : "Søknaden din ble avslått.");
            } else {
                setError("Du har ingen aktive søknader.");
            }
        } catch {
            setError("Kunne ikke sjekke status. Prøv igjen.");
        } finally {
            setIsCheckingStatus(false);
        }
    }

    const infoRows = [
        { icon: User, label: "Navn", value: user?.name ?? "Ukjent" },
        {
            icon: MapPin,
            label: "Sted",
            value: applications.length > 0
                ? `${applications.length} søknad${applications.length === 1 ? "" : "er"}`
                : "Ukjent",
        },
        {
            icon: Clock,
            label: "Tilgang",
            value: applications.length > 0
                ? `${applications.filter((application) => application.access_status === ACCESS_STATUS.PENDING).length} venter`
                : "Ukjent",
        },
    ];

    return (
        <main
            className="min-h-screen flex items-center justify-center px-4"
            style={{ backgroundColor: 'var(--color-background)' }}
        >
            <div className="w-full max-w-sm flex flex-col gap-6 animate-slide-in-left">
                <OnBoardingTitle description="Din konto og søknad er registrert. Du vil kunne bruke appen etter at admin har godkjent." />

                <section
                    className="rounded-2xl p-6"
                    style={{
                        backgroundColor: 'var(--color-surface)',
                        border: '1px solid var(--color-border)',
                    }}
                >
                    <div className="flex items-center justify-between mb-5">
                        <h2
                            className="text-base font-semibold"
                            style={{ color: 'var(--color-text-primary)' }}
                        >
                            Tilgangssøknad:
                        </h2>
                    </div>

                    <div className="space-y-4">
                        {infoRows.map(({ icon: Icon, label, value }) => (
                            <div key={label} className="flex items-center gap-3">
                                <div
                                    className="flex h-8 w-8 items-center justify-center rounded-full shrink-0"
                                    style={{
                                        backgroundColor: 'var(--color-secondary-surface)',
                                        color: 'var(--color-primary)',
                                    }}
                                >
                                    <Icon size={14} />
                                </div>
                                <div>
                                    <p
                                        className="text-xs uppercase tracking-wide"
                                        style={{ color: 'var(--color-text-secondary)' }}
                                    >
                                        {label}
                                    </p>
                                    <p
                                        className="text-sm font-medium rounded py-1"
                                        style={{ color: 'var(--color-text-primary)' }}
                                    >
                                        {value}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <section
                    className="rounded-2xl p-6"
                    style={{
                        backgroundColor: 'var(--color-surface)',
                        border: '1px solid var(--color-border)',
                    }}
                >
                    <h3
                        className="mb-4 text-sm font-semibold"
                        style={{ color: 'var(--color-text-primary)' }}
                    >
                        Alle søknader
                    </h3>

                    {applications.length === 0 ? (
                        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                            Ingen aktive søknader.
                        </p>
                    ) : (
                        <div className="space-y-3">
                            {applications.map((application) => {
                                const statusStyle = ACCESS_STATUS_STYLES[application.access_status];

                                return (
                                    <div
                                        key={application.id}
                                        className="rounded-xl border px-4 py-3"
                                        style={{
                                            borderColor: 'var(--color-border)',
                                            backgroundColor: 'var(--color-background)',
                                        }}
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <p
                                                    className="text-sm font-medium"
                                                    style={{ color: 'var(--color-text-primary)' }}
                                                >
                                                    {application.location_name}
                                                </p>
                                                <p
                                                    className="text-xs mt-1"
                                                    style={{ color: 'var(--color-text-secondary)' }}
                                                >
                                                    {application.email}
                                                </p>
                                            </div>

                                            <span
                                                className="rounded-full px-2 py-1 text-xs font-semibold"
                                                style={{
                                                    backgroundColor: statusStyle.bg,
                                                    color: statusStyle.text,
                                                }}
                                            >
                                                {ACCESS_STATUS_LABELS[application.access_status]}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </section>

                {error && (
                    <p
                        className="mb-4 rounded-lg px-3 py-2 text-xs"
                        style={{
                            backgroundColor: '#FEE2E2',
                            color: 'var(--color-danger)',
                        }}
                    >
                        {error}
                    </p>
                )}

                <section className="flex flex-col gap-3">
                    <button
                        onClick={() => navigate(ROUTES.DASHBOARD.path)}
                        disabled={!hasApprovedApplication}
                        className="w-full rounded-xl border py-3 text-sm font-medium transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        style={{
                            borderColor: hasApprovedApplication ? 'var(--color-primary)' : 'var(--color-border)',
                            color: hasApprovedApplication ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                            backgroundColor: 'transparent',
                        }}
                        onMouseEnter={e => {
                            if (hasApprovedApplication) {
                                e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.08)';
                            }
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                    >
                        Gå til applikasjonen
                    </button>

                    {/*Check Status button */}
                    <button
                        onClick={handleCheckStatus}
                        disabled={isCheckingStatus}
                        className="w-full rounded-xl py-3 text-sm font-semibold transition-all duration-150 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        style={{
                            backgroundColor: 'var(--color-surface)',
                            color: 'var(--color-primary)',
                            border: '1px solid var(--color-primary)',
                        }}
                        onMouseEnter={e => {
                            if (!isCheckingStatus)
                                e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.08)';
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.backgroundColor = 'var(--color-surface)';
                        }}
                    >
                        {isCheckingStatus ? "Sjekker status..." : "Sjekk Status"}
                    </button>

                    <button
                        onClick={() => {
                            void logoutUser();
                        }}
                        disabled={isLoggingOut}
                        className="w-full rounded-xl border py-3 text-sm font-medium transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        style={{
                            borderColor: 'var(--color-danger, #dc2626)',
                            color: 'var(--color-danger, #dc2626)',
                            backgroundColor: 'transparent',
                        }}
                        onMouseEnter={e => {
                            if (!isLoggingOut) e.currentTarget.style.backgroundColor = 'var(--color-danger-soft, rgba(220, 38, 38, 0.12))';
                        }}
                        onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                        Logg ut
                    </button>
                </section>
            </div>

            <LogoutLoadingOverlay isVisible={isLoggingOut} />
        </main>
    );
}