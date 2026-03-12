/*
    * EditableField.tsx
    * Generic field component that renders a text input in edit mode and a plain value in view mode.
    * Author: Emil Berglund
*/

import type { ReactNode } from 'react';

interface EditableFieldProps {
    label: ReactNode;
    value: string;
    editedValue: string;
    onChange: (value: string) => void;
    isEditing: boolean;
    error?: string;
    type?: string;
}

export default function EditableField({
    label,
    value,
    editedValue,
    onChange,
    isEditing,
    error,
    type = 'text',
}: EditableFieldProps) {
    return (
        <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                {label}
            </label>
            {isEditing ? (
                <>
                    <input
                        type={type}
                        value={editedValue}
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
                </>
            ) : (
                <p className="px-4 py-2" style={{ color: 'var(--color-text-secondary)' }}>
                    {value}
                </p>
            )}
        </div>
    );
}
