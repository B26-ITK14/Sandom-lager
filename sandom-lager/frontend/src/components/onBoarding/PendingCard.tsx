/*
    * PendingCard.tsx
    * Viser én tilgangssøknad i admin-panelet.
    * Admin kan godkjenne eller avslå søknaden direkte fra kortet.
    * Author: Khalid Osman
*/

import { User, MapPin, Clock } from "lucide-react";

export type ApplicationStatus = "pending" | "approved" | "denied";

export interface AccessRequest {
    id: string;
    userName: string;
    email: string;
    locationName: string;
    requestedAt: string;
    status: ApplicationStatus;
}

interface PendingCardProps {
    request: AccessRequest;
    onApprove: (id: string) => void;
    onDeny: (id: string) => void;
    isLoading?: boolean;
}

const statusConfig: Record<ApplicationStatus, { label: string; bg: string; color: string }> = {
    pending: {
        label: "Venter",
        bg: "#FEF9C3",
        color: "#A16207",
    },
    approved: {
        label: "Godkjent",
        bg: "#DCFCE7",
        color: "#15803D",
    },
    denied: {
        label: "Avslått",
        bg: "#FEE2E2",
        color: "#B91C1C",
    },
};

function formatDate(iso: string): string {
    return new Intl.DateTimeFormat("nb-NO", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(new Date(iso));
}

export default function PendingCard({
    request,
    onApprove,
    onDeny,
    isLoading = false,
}: PendingCardProps) {
    const status = statusConfig[request.status];

    return (
        <article
            className="rounded-2xl p-5 transition-shadow duration-200 hover:shadow-md"
            style={{
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
            }}
        >
            {/* Header */}
            <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                    <div
                        className="flex h-10 w-10 items-center justify-center rounded-full shrink-0"
                        style={{ backgroundColor: 'var(--color-secondary-surface)', color: 'var(--color-primary)' }}
                    >
                        <User size={18} />
                    </div>
                    <div>
                        <p
                            className="text-sm font-semibold leading-tight"
                            style={{ color: 'var(--color-text-primary)' }}
                        >
                            {request.userName}
                        </p>
                        <p
                            className="text-xs"
                            style={{ color: 'var(--color-text-secondary)' }}
                        >
                            {request.email}
                        </p>
                    </div>
                </div>
                <span
                    className="shrink-0 rounded-full px-3 py-1 text-xs font-medium"
                    style={{ backgroundColor: status.bg, color: status.color }}
                >
                    {status.label}
                </span>
            </div>

            {/* Info */}
            <div className="space-y-1.5 mb-5">
                <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                    <MapPin size={13} className="shrink-0" />
                    <span>{request.locationName}</span>
                </div>
                <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                    <Clock size={13} className="shrink-0" />
                    <span>{formatDate(request.requestedAt)}</span>
                </div>
            </div>

            {/* Knapper – kun for pending */}
            {request.status === "pending" && (
                <div className="flex gap-2">
                    <button
                        onClick={() => onApprove(request.id)}
                        disabled={isLoading}
                        className="flex-1 rounded-xl px-4 py-2 text-xs font-semibold transition-all duration-150 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{
                            backgroundColor: 'var(--color-primary)',
                            color: 'var(--color-on-primary)',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--color-primary-hover)')}
                        onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'var(--color-primary)')}
                    >
                        Godkjenn
                    </button>
                    <button
                        onClick={() => onDeny(request.id)}
                        disabled={isLoading}
                        className="flex-1 rounded-xl border px-4 py-2 text-xs font-semibold transition-all duration-150 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{
                            borderColor: 'var(--color-danger)',
                            color: 'var(--color-danger)',
                            backgroundColor: 'transparent',
                        }}
                    >
                        Avslå
                    </button>
                </div>
            )}
        </article>
    );
}