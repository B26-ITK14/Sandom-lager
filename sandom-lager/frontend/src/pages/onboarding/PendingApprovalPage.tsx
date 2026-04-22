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
import { usePageMeta } from "../../hooks";
import {
    ACCESS_STATUS,
    ACCESS_STATUS_LABELS,
    ACCESS_STATUS_STYLES,
    type AccessStatus,
} from "../../constants/accessStatus";

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
    const [locationName, setLocationName] = useState<string>("Laster...");
    const [status, setStatus] = useState<AccessStatus | null>(null);

    useEffect(() => {
        async function loadStatus() {
            try {
                const token = await getAccessTokenSilently();
                const data = await fetchMyLocationAccess(token);
                if (data.length > 0) {
                    setLocationName(data[0].location_name);
                    setStatus(data[0].access_status);
                }
            } catch {
                setLocationName("Ukjent");
                setStatus(null);
            }
        }
        loadStatus();
    }, [getAccessTokenSilently]);

    const badgeStatus = status ?? ACCESS_STATUS.PENDING;
    const badgeStyle = ACCESS_STATUS_STYLES[badgeStatus];
    const statusLabel = status ? ACCESS_STATUS_LABELS[status] : "Ukjent";

    const infoRows = [
        { icon: User, label: "Navn", value: user?.name ?? "Ukjent" },
        { icon: MapPin, label: "Sted", value: locationName },
        { icon: Clock, label: "Tilgang", value: statusLabel },
    ];

    return (
        <main
            className="min-h-screen flex items-center justify-center px-4"
            style={{ backgroundColor: 'var(--color-background)' }}
        >
            <div className="w-full max-w-sm flex flex-col gap-6 animate-slide-in-left">
                <OnBoardingTitle description="Din konto er registrert og søknaden din er under behandling. Du vil bli varslet når kontoen din er godkjent." />

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
                            Tilgangssøknad
                        </h2>
                        <span
                            className="rounded-full px-3 py-1 text-xs font-medium"
                            style={{ backgroundColor: badgeStyle.bg, color: badgeStyle.text }}
                        >
                            {status ? ACCESS_STATUS_LABELS[status] : "Under behandling"}
                        </span>
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
                                        className="text-sm font-medium"
                                        style={{ color: 'var(--color-text-primary)' }}
                                    >
                                        {value}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <button
                    onClick={() => navigate(ROUTES.DASHBOARD.path)}
                    className="w-full rounded-xl border py-3 text-sm font-medium transition-colors duration-150"
                    style={{
                        borderColor: 'var(--color-border)',
                        color: 'var(--color-text-secondary)',
                        backgroundColor: 'transparent',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--color-secondary-surface)')}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                    Gå til innlogging
                </button>
            </div>
        </main>
    );
}