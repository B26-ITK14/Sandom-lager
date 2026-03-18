/*
    * AppInfoCard.tsx
    * Simple card displaying app information like name, version, and status.
    * Author: Emil Berglund
*/

import { useAppVersion } from '../../../hooks/version/appVersion';
import { useAppStability, stabilityLabels } from '../../../hooks/version/appStability';

export default function AppInfoCard() {
    const { display } = useAppVersion();
    const { status } = useAppStability();

    return (
        <section className="rounded-2xl p-6" style={{ backgroundColor: 'var(--color-surface)' }}>
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>Sandom Lager</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
                        Versjon: {display}
                    </p>
                </div>
                <span
                    className="px-2.5 py-1 rounded-full text-xs font-medium"
                    style={{
                        backgroundColor: 'var(--color-background)',
                        color: 'var(--color-text-secondary)',
                        border: '1px solid var(--color-border)',
                    }}
                >
                    {stabilityLabels[status]}
                </span>
            </div>
        </section>
    );
}
