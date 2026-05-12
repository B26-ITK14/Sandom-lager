/*
    * primitives.tsx
    * Reusable UI components for the app settings page, such as SectionCard, SettingRow, Toggle, and SettingSelect.
    * Author: Emil Berglund
*/

import type { ReactNode } from 'react';
export type { FontSize, Language } from './utils';

export function SectionCard({ title, icon, children }: { title: string; icon: ReactNode; children: ReactNode }) {
    return (
        <section className="rounded-2xl p-6" style={{ backgroundColor: 'var(--color-surface)' }}>
            <div className="flex items-center gap-3 mb-5">
                <span style={{ color: 'var(--color-primary)' }}>{icon}</span>
                <h3 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>{title}</h3>
            </div>
            <div className="space-y-5">{children}</div>
        </section>
    );
}

export function SettingRow({ label, description, children }: { label: string; description?: string; children: ReactNode }) {
    return (
        <div className="flex items-center justify-between gap-4">
            <div>
                <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>{label}</p>
                {description && (
                    <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>{description}</p>
                )}
            </div>
            {children}
        </div>
    );
}

export function Divider() {
    return <div className="border-t" style={{ borderColor: 'var(--color-border)' }} />;
}

export function Toggle({ checked, onChange, ariaLabel, disabled }: { checked: boolean; onChange: (v: boolean) => void; ariaLabel?: string; disabled?: boolean }) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            aria-label={ariaLabel ?? 'Bytt innstilling'}
            aria-disabled={disabled}
            disabled={disabled}
            onClick={() => { if (!disabled) onChange(!checked); }}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full transition-colors duration-200 ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
            style={{ backgroundColor: checked ? 'var(--color-primary)' : 'var(--color-border)' }}
        >
            <span
                className="inline-block h-5 w-5 rounded-full bg-white shadow transform transition-transform duration-200 mt-0.5"
                style={{ marginLeft: checked ? '22px' : '2px' }}
            />
        </button>
    );
}

export function SettingSelect<T extends string>({ value, options, onChange }: {
    value: T;
    options: { value: T; label: string }[];
    onChange: (v: T) => void;
}) {
    return (
        <select
            value={value}
            onChange={(e) => onChange(e.target.value as T)}
            className="px-3 py-1.5 rounded-lg text-sm cursor-pointer"
            style={{
                backgroundColor: 'var(--color-background)',
                color: 'var(--color-text-primary)',
                border: '1px solid var(--color-border)',
            }}
        >
            {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
    );
}
