/*
    * ApplicationsHistorySection.tsx
    * Presentational section for rendering the user's previous applications.
    * Displays application location, submission date, and current status with appropriate styling.
    * Is used within the MyApplicationsPage.tsx component in the My Applications section of the account settings page.
    * Author: Emil Berglund
*/

import { formatRequestedAt, statusLabel, statusStyle } from "./utils";
import type { MyApplication } from "./types";

interface ApplicationsHistorySectionProps {
    pageLoading: boolean;
    applications: MyApplication[];
}

export default function ApplicationsHistorySection({
    pageLoading,
    applications,
}: ApplicationsHistorySectionProps) {
    return (
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
                                            Sendt: {formatRequestedAt(application.requestedAt)}
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
    );
}
