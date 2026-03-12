/*
    * SecurityPrivacyCard.tsx
    * Card component for managing security and privacy settings like password changes, 2FA, and active sessions.
    * Author: Emil Berglund
*/

import { Key } from 'lucide-react';
import PasswordChangeButton from './PasswordChangeButton';
import TwoFactorAuthButton from './TwoFactorAuthButton';
import ActiveSessionsToggle from './ActiveSessionsToggle';

export default function SecurityPrivacyCard() {
    return (
        <section
            className="rounded-2xl p-6 lg:col-start-2 lg:row-start-2"
            style={{ backgroundColor: 'var(--color-surface)' }}
        >
            <div className="flex items-center gap-3 mb-6">
                <Key size={24} style={{ color: 'var(--color-primary)' }} />
                <h3
                    className="text-xl font-semibold"
                    style={{ color: 'var(--color-text-primary)' }}
                >
                    Sikkerhet og personvern
                </h3>
            </div>

            <div className="space-y-4">
                <PasswordChangeButton />
                <TwoFactorAuthButton />
                <ActiveSessionsToggle />
            </div>
        </section>
    );
}

