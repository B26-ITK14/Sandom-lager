/*
    * AdminPage.tsx
    * Admin-panel for håndtering av brukertilgangssøknader.
    * Admin kan godkjenne eller avslå søknader per lokasjon.
    * Author: Khalid Osman
*/

import { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useUserRole } from "../hooks/user/useUserRole";
import { CheckCircle, XCircle, Clock } from "lucide-react";
import PendingCard, { type AccessRequest } from "../components/onBoarding/PendingCard";
import type { UserLocationResponse } from "../types";
import SettingsLayout from "../components/settings/SettingsLayout";

type FilterTab = "all" | "pending" | "approved" | "denied";

const TAB_LABELS: Record<FilterTab, string> = {
    all: "Alle",
    pending: "Venter",
    approved: "Godkjent",
    denied: "Avslått",
};

const statCards = [
    { tab: "pending" as FilterTab, label: "Venter", icon: Clock, color: "#A16207" },
    { tab: "approved" as FilterTab, label: "Godkjent", icon: CheckCircle, color: "#15803D" },
    { tab: "denied" as FilterTab, label: "Avslått", icon: XCircle, color: "#B91C1C" },
];

export default function AdminPage() {
    const { role, loading: roleLoading } = useUserRole();
    const { getAccessTokenSilently } = useAuth0();
    const [requests, setRequests] = useState<AccessRequest[]>([]);
    const [activeTab, setActiveTab] = useState<FilterTab>("pending");
    const [loadingId, setLoadingId] = useState<string | null>(null);
    const [pageLoading, setPageLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (roleLoading || role !== "admin") return;

        async function fetchRequests() {
            try {
                const token = await getAccessTokenSilently();
                const res = await fetch("/api/user-locations", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!res.ok) throw new Error("Feil ved henting av søknader");
                const data: UserLocationResponse[] = await res.json(); // ← ENDRET: any → UserLocationResponse[]

                const mapped: AccessRequest[] = data.map((r: UserLocationResponse) => ({ // ← ENDRET: any → UserLocationResponse
                    id: String(r.id),
                    userName: r.user_name,
                    email: r.email,
                    locationName: r.location_name,
                    requestedAt: r.created_at,
                    status: r.access_status,
                }));
                setRequests(mapped);
            } catch {
                setError("Kunne ikke laste søknader.");
            } finally {
                setPageLoading(false);
            }
        }

        fetchRequests();
    }, [roleLoading, role, getAccessTokenSilently]);

    if (roleLoading) {
        return (
            <main className="min-h-screen flex items-center justify-center"
                style={{ backgroundColor: 'var(--color-background)' }}>
                <p style={{ color: 'var(--color-text-secondary)' }}>Laster...</p>
            </main>
        );
    }

    if (role !== "admin") {
        return (
            <main className="min-h-screen flex items-center justify-center"
                style={{ backgroundColor: 'var(--color-background)' }}>
                <p style={{ color: 'var(--color-danger)' }}>Du har ikke tilgang til denne siden.</p>
            </main>
        );
    }

    const pendingCount = requests.filter((r) => r.status === "pending").length;
    const filtered = requests.filter((r) => activeTab === "all" ? true : r.status === activeTab);

    async function handleApprove(id: string) {
        setLoadingId(id);
        try {
            const token = await getAccessTokenSilently();
            const res = await fetch(`/api/user-locations/${id}/approve`, {
                method: "PATCH",
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error("Godkjenning feilet");
            setRequests((prev) => prev.map((r) => r.id === id ? { ...r, status: "approved" } : r));
        } catch {
            setError("Kunne ikke godkjenne søknaden.");
        } finally {
            setLoadingId(null);
        }
    }

    async function handleDeny(id: string) {
        setLoadingId(id);
        try {
            const token = await getAccessTokenSilently();
            const res = await fetch(`/api/user-locations/${id}/deny`, {
                method: "PATCH",
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error("Avslag feilet");
            setRequests((prev) => prev.map((r) => r.id === id ? { ...r, status: "denied" } : r));
        } catch {
            setError("Kunne ikke avslå søknaden.");
        } finally {
            setLoadingId(null);
        }
    }

    return (
        <SettingsLayout notifications={true} backMenu={false}>
            {error && (
                <div className="mb-4 rounded-xl p-3 text-sm"
                    style={{ backgroundColor: 'var(--color-danger-surface)', color: 'var(--color-danger)' }}>
                    {error}
                </div>
            )}

            <div className="mx-auto max-w-2xl">
                {/* Stat Cards */}
                <div className="mb-6 grid grid-cols-3 gap-3">
                    {statCards.map(({ tab, label, icon: Icon, color }) => (
                        <div key={tab} className="rounded-2xl p-4 text-center"
                            style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                            <div className="flex items-center justify-center gap-1.5 mb-1">
                                <Icon size={14} style={{ color }} />
                                <span className="text-xs font-medium uppercase tracking-wide" style={{ color }}>
                                    {label}
                                </span>
                            </div>
                            <p className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                                {requests.filter((r) => r.status === tab).length}
                            </p>
                        </div>
                    ))}
                </div>
                
                {/* Filter Tabs */}
                <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
                    {(["pending", "approved", "denied", "all"] as FilterTab[]).map((tab) => (
                        <button key={tab} onClick={() => setActiveTab(tab)}
                            className="shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition-all duration-150 cursor-pointer"
                            style={activeTab === tab
                                ? { backgroundColor: 'var(--color-primary)', color: 'var(--color-on-primary)' }
                                : { backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text-secondary)' }
                            }>
                            {TAB_LABELS[tab]}
                            {tab === "pending" && pendingCount > 0 && (
                                <span className="ml-1.5 inline-flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold"
                                    style={{ backgroundColor: 'var(--color-danger)', color: 'var(--color-on-danger)' }}>
                                    {pendingCount}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {pageLoading ? (
                    <p className="text-center text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                        Laster søknader...
                    </p>
                ) : filtered.length === 0 ? (
                    <div className="rounded-2xl p-10 text-center text-sm"
                        style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text-secondary)' }}>
                        Ingen søknader i denne kategorien.
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filtered.map((request) => (
                            <PendingCard key={request.id} request={request}
                                onApprove={handleApprove} onDeny={handleDeny}
                                isLoading={loadingId === request.id} />
                        ))}
                    </div>
                )}
            </div>
        </SettingsLayout>
    );
}