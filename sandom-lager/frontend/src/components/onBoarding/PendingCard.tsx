/*
    * PendingCard.tsx
    * A card component for displaying pending access requests, showing user information, request details, and action buttons for approval or denial.
    * Is used in the AccessRequestsPage to render each pending access request in a user-friendly format.
    * Author: Khalid Osman
*/

import { User, MapPin, Clock } from "lucide-react";
import {
    ACCESS_STATUS,
    ACCESS_STATUS_LABELS,
    ACCESS_STATUS_STYLES,
    type AccessStatus,
} from "../../constants/accessStatus";

export type ApplicationStatus = AccessStatus;

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
    onRevoke?: (id: string) => void;
    onBlock?: (id: string) => void;
    isLoading?: boolean;
}

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
    onRevoke,
    onBlock,
    isLoading = false,
}: PendingCardProps) {
    const statusLabel = request.status === ACCESS_STATUS.PENDING ? "Venter" : ACCESS_STATUS_LABELS[request.status];
    const statusStyle = ACCESS_STATUS_STYLES[request.status];

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
                    style={{ backgroundColor: statusStyle.bg, color: statusStyle.text }}
                >
                    {statusLabel}
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
            {request.status === ACCESS_STATUS.PENDING && (
                <div className="flex gap-2">
                    <button
                        onClick={() => onApprove(request.id)}
                        disabled={isLoading}
                        className="flex-1 rounded-xl px-4 py-2 text-xs font-semibold transition-all duration-150 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
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
                        className="flex-1 rounded-xl border px-4 py-2 text-xs font-semibold transition-all duration-150 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
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
            {/* Knapper – approved */}
            {request.status === ACCESS_STATUS.APPROVED && (
                <div className="flex gap-2">
                    <button
                        onClick={() => onRevoke?.(request.id)}
                        disabled={isLoading}
                        className="flex-1 rounded-xl border px-4 py-2 text-xs font-semibold transition-all duration-150 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        style={{ borderColor: 'var(--color-danger)', color: 'var(--color-danger)', backgroundColor: 'transparent' }}
                    >
                        Fjern tilgang
                    </button>
                    <button
                        onClick={() => onBlock?.(request.id)}
                        disabled={isLoading}
                        className="flex-1 rounded-xl px-4 py-2 text-xs font-semibold transition-all duration-150 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        style={{ backgroundColor: '#7F1D1D', color: '#FEE2E2' }}
                    >
                        Blokker bruker
                    </button>
                </div>
            )}
        </article>
    );
}