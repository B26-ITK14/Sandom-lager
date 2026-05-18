/*
    * EmailField.tsx
    * Email field with edit support for password-based accounts and a pending-verification notice.
    * Social/federated accounts see a read-only message instead.
    * Used by PersonalInfoSection.tsx in the account settings page.
    * Author: Emil Berglund
*/

import type { ReactNode } from 'react';

interface EmailFieldProps {
    label: ReactNode;
    displayEmail: string;
    editedEmail: string;
    onChange: (email: string) => void;
    isEditing: boolean;
    isPasswordUser: boolean;
    originalEmail: string;
    error?: string;
    inputName?: string;
    inputId?: string;
    autoComplete?: string;
}

export default function EmailField({
    label,
    displayEmail,
    editedEmail,
    onChange,
    isEditing,
    isPasswordUser,
    originalEmail,
    error,
    inputName,
    inputId,
    autoComplete,
}: EmailFieldProps) {
    return (
        <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                {label}
            </label>
            {isEditing && isPasswordUser ? (
                <div>
                    <input
                        id={inputId}
                        name={inputName}
                        type="email"
                        autoComplete={autoComplete}
                        value={editedEmail}
                        onChange={(e) => onChange(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg"
                        style={{
                            backgroundColor: 'var(--color-background)',
                            color: 'var(--color-text-primary)',
                            border: error ? '1px solid #ef4444' : '1px solid var(--color-border)',
                        }}
                    />
                    {error && (
                        <p className="text-xs mt-1 px-1" style={{ color: '#ef4444' }}>{error}</p>
                    )}
                </div>
            ) : (
                <div>
                    <p className="px-4 py-2" style={{ color: 'var(--color-text-secondary)' }}>
                        {displayEmail}
                    </p>
                    {displayEmail !== originalEmail && (
                        <p className="text-xs px-4" style={{ color: '#f59e0b' }}>Ikke bekreftet – sjekk innboksen din</p>
                    )}
                    {!isPasswordUser && (
                        <p className="text-xs mt-1 px-4" style={{ color: 'var(--color-text-secondary)' }}>
                            E-postadressen administreres av din innloggingsleverandør
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}
