/*
    * AdminPage.tsx
    * Admin-panel for håndtering av brukertilgangssøknader.
    * Admin kan godkjenne eller avslå søknader per lokasjon.
    * Author: Khalid Osman
*/

import { useState } from "react";
import { useUserRole } from "../hooks/user/useUserRole";
import { Users, CheckCircle, XCircle, Clock } from "lucide-react";
import PendingCard, { type AccessRequest } from "../components/onBoarding/PendingCard";

// TODO: Bytt ut med API-kall når backend er klar
const MOCK_REQUESTS: AccessRequest[] = [
    {
        id: "1",
        userName: "Test Bruker",
        email: "test@epost.no",
        locationName: "Tomasgården",
        requestedAt: new Date(Date.now() - 1000 * 60 * 3).toISOString(),
        status: "pending",
    },
    {
        id: "2",
        userName: "Kari Nordmann",
        email: "kari@sandom.no",
        locationName: "Sandom Retreatsenter",
        requestedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        status: "pending",
    },
    {
        id: "3",
        userName: "Ola Hansen",
        email: "ola@epost.no",
        locationName: "Tomasgården",
        requestedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        status: "approved",
    },
];

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
    const [requests, setRequests] = useState<AccessRequest[]>(MOCK_REQUESTS);
    const [activeTab, setActiveTab] = useState<FilterTab>("pending");
    const [loadingId, setLoadingId] = useState<string | null>(null);

    if (roleLoading) {
        return (
            <main
                className="min-h-screen flex items-center justify-center"
                style={{ backgroundColor: 'var(--color-background)' }}
            >
                <p style={{ color: 'var(--color-text-secondary)' }}>Laster...</p>
            </main>
        );
    }

    if (role !== "admin") {
        return (
            <main
                className="min-h-screen flex items-center justify-center"
                style={{ backgroundColor: 'var(--color-background)' }}
            >
                <p style={{ color: 'var(--color-danger)' }}>Du har ikke tilgang til denne siden.</p>
            </main>
        );
    }

    const pendingCount = requests.filter((r) => r.status === "pending").length;
    const filtered = requests.filter((r) => activeTab === "all" ? true : r.status === activeTab);

    async function handleApprove(id: string) {
        setLoadingId(id);
        try {
            // TODO: await api.patch(`/user-locations/${id}`, { status: "approved" });
            await new Promise((res) => setTimeout(res, 600));
            setRequests((prev) => prev.map((r) => r.id === id ? { ...r, status: "approved" } : r));
        } finally {
            setLoadingId(null);
        }
    }

    async function handleDeny(id: string) {
        setLoadingId(id);
        try {
            // TODO: await api.patch(`/user-locations/${id}`, { status: "denied" });
            await new Promise((res) => setTimeout(res, 600));
            setRequests((prev) => prev.map((r) => r.id === id ? { ...r, status: "denied" } : r));
        } finally {
            setLoadingId(null);
        }
    }

    return (
        <main
            className="min-h-screen px-4 py-8"
            style={{ backgroundColor: 'var(--color-background)' }}
        >
            <div className="mx-auto max-w-2xl">

                {/* Overskrift */}
                <header className="mb-6 flex items-center gap-3">
                    <div
                        className="flex h-10 w-10 items-center justify-center rounded-full"
                        style={{ backgroundColor: 'var(--color-secondary-surface)', color: 'var(--color-primary)' }}
                    >
                        <Users size={20} />
                    </div>
                    <div>
                        <h1
                            className="text-xl font-bold"
                            style={{ color: 'var(--color-header-text-primary)' }}
                        >
                            Tilgangssøknader
                        </h1>
                        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                            Administrer brukertilganger for Sandom og Tomasgården
                        </p>
                    </div>
                </header>

                {/* Statistikk-kort */}
                <div className="mb-6 grid grid-cols-3 gap-3">
                    {statCards.map(({ tab, label, icon: Icon, color }) => (
                        <div
                            key={tab}
                            className="rounded-2xl p-4 text-center"
                            style={{
                                backgroundColor: 'var(--color-surface)',
                                border: '1px solid var(--color-border)',
                            }}
                        >
                            <div className="flex items-center justify-center gap-1.5 mb-1">
                                <Icon size={14} style={{ color }} />
                                <span className="text-xs font-medium uppercase tracking-wide" style={{ color }}>
                                    {label}
                                </span>
                            </div>
                            <p
                                className="text-2xl font-bold"
                                style={{ color: 'var(--color-text-primary)' }}
                            >
                                {requests.filter((r) => r.status === tab).length}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Filter-tabs */}
                <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
                    {(["pending", "approved", "denied", "all"] as FilterTab[]).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            
                            className="shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition-all duration-150 cursor-pointer"
                            style={
                                activeTab === tab
                                    ? {
                                        backgroundColor: 'var(--color-primary)',
                                        color: 'var(--color-on-primary)',
                                    }
                                    : {
                                        backgroundColor: 'var(--color-surface)',
                                        border: '1px solid var(--color-border)',
                                        color: 'var(--color-text-secondary)',
                                    }
                            }
                        >
                            {TAB_LABELS[tab]}
                            {tab === "pending" && pendingCount > 0 && (
                                <span
                                    className="ml-1.5 inline-flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold"
                                    style={{
                                        backgroundColor: 'var(--color-danger)',
                                        color: 'var(--color-on-danger)',
                                    }}
                                >
                                    {pendingCount}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Liste */}
                {filtered.length === 0 ? (
                    <div
                        className="rounded-2xl p-10 text-center text-sm"
                        style={{
                            backgroundColor: 'var(--color-surface)',
                            border: '1px solid var(--color-border)',
                            color: 'var(--color-text-secondary)',
                        }}
                    >
                        Ingen søknader i denne kategorien.
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filtered.map((request) => (
                            <PendingCard
                                key={request.id}
                                request={request}
                                onApprove={handleApprove}
                                onDeny={handleDeny}
                                isLoading={loadingId === request.id}
                            />
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}