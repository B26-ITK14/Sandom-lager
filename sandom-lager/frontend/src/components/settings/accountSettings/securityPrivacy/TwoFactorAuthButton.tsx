/*
    * TwoFactorAuthButton.tsx
    * Placeholder button for two-factor authentication settings.
    * TODO: Implement actual 2FA setup and management flow, possibly integrating with Auth0's Guardian or a custom solution.
    * Author: Emil Berglund
*/

import { Smartphone } from 'lucide-react';

export default function TwoFactorAuthButton() {
    return (
        <button
            className="w-full flex items-center justify-between p-4 rounded-lg transition-colors"
            style={{ backgroundColor: 'var(--color-background)' }}
        >
            <div className="flex items-center gap-3">
                <Smartphone size={20} style={{ color: 'var(--color-text-secondary)' }} />
                <div className="text-left">
                    <p className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                        Tofaktorautentisering
                    </p>
                    <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                        Ikke aktivert
                    </p>
                </div>
            </div>
            <span style={{ color: 'var(--color-text-secondary)' }}>→</span>
        </button>
    );
}
