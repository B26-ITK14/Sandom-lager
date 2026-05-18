/*
    * AboutSandomLagerPage.tsx
    * About page with basic information about Sandom Lager.
    * Includes app version and last updated info using custom hooks.
    * Author: Emil Berglund
*/

import SettingsLayout from "../../components/settings/SettingsLayout";
import { usePageMeta } from "../../hooks";
import { useAppLastUpdated, useAppVersion } from "../../hooks";

export default function AboutSandomLagerPage() {
    usePageMeta({
        title: "About Sandom Lager",
        description: "Learn more about Sandom Lager, version information, and app details",
        keywords: "about, info, version, sandom lager",
        ogTitle: "About Sandom Lager",
        ogDescription: "About the Sandom Lager app",
    });
    const appVersion = useAppVersion();
    const appLastUpdated = useAppLastUpdated();

    return (
        <SettingsLayout title="Om Sandom Lager">
            <div className="mx-auto max-w-5xl space-y-6">
                <section
                    className="rounded-2xl p-5"
                    style={{
                        backgroundColor: "var(--color-surface)",
                        border: "1px solid var(--color-border)",
                    }}
                >
                    <h2 className="text-lg font-semibold" style={{ color: "var(--color-text-primary)" }}>
                        Om appen
                    </h2>
                    <p className="mt-2 text-sm" style={{ color: "var(--color-text-secondary)" }}>
                        Sandom Lager er utviklet for enkel håndtering av lagerbeholdning, handlelister og tilgangsstyring
                        på tvers av lokasjoner.
                    </p>
                </section>

                <section
                    className="rounded-2xl p-5"
                    style={{
                        backgroundColor: "var(--color-surface)",
                        border: "1px solid var(--color-border)",
                    }}
                >
                    <h2 className="text-lg font-semibold" style={{ color: "var(--color-text-primary)" }}>
                        Versjon og informasjon
                    </h2>
                    <dl className="mt-4 space-y-2 text-sm" style={{ color: "var(--color-text-secondary)" }}>
                        <div className="flex items-center justify-between gap-4">
                            <dt>Appversjon</dt>
                            <dd className="font-medium" style={{ color: "var(--color-text-primary)" }}>{appVersion.display}</dd>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                            <dt>Sist oppdatert</dt>
                            <dd className="font-medium" style={{ color: "var(--color-text-primary)" }}>{appLastUpdated.display}</dd>
                        </div>
                    </dl>
                </section>
            </div>
        </SettingsLayout>
    );
}
