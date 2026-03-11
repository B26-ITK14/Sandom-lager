/*
    * AppearanceCard.tsx
    * Settings card for appearance options like theme and font size.
    * Author: Emil Berglund
 */

import { useState } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';
import { SectionCard, SettingRow, SettingSelect, Divider } from './primitives';
import { readPref, savePref } from './utils';
import type { FontSize } from './utils';

type ThemePreference = 'light' | 'dark' | 'system';

const THEME_OPTIONS: { value: ThemePreference; label: string; icon: React.ReactNode }[] = [
    { value: 'light', label: 'Lys', icon: <Sun size={16} /> },
    { value: 'dark', label: 'Mørk', icon: <Moon size={16} /> },
    { value: 'system', label: 'System', icon: <Monitor size={16} /> },
];

const FONT_SIZE_OPTIONS: { value: FontSize; label: string }[] = [
    { value: 'small', label: 'Liten' },
    { value: 'medium', label: 'Normal' },
    { value: 'large', label: 'Stor' },
];

export default function AppearanceCard() {
    const { preference, setPreference } = useTheme();
    const [fontSize, setFontSize] = useState<FontSize>(() => readPref('app:fontSize', 'medium'));

    const handleFontSize = (v: FontSize) => {
        setFontSize(v);
        savePref('app:fontSize', v);
        const sizes: Record<FontSize, string> = { small: '87.5%', medium: '100%', large: '112.5%' };
        document.documentElement.style.fontSize = sizes[v];
    };

    return (
        <SectionCard title="Utseende" icon={<Sun size={22} />}>
            <SettingRow label="Tema" description="Velg mellom lys, mørk eller systemstandard">
                <div className="flex gap-2">
                    {THEME_OPTIONS.map((opt) => (
                        <button
                            key={opt.value}
                            onClick={() => setPreference(opt.value)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer"
                            style={{
                                backgroundColor: preference === opt.value ? 'var(--color-primary)' : 'var(--color-background)',
                                color: preference === opt.value ? '#fff' : 'var(--color-text-secondary)',
                                border: '1px solid var(--color-border)',
                            }}
                        >
                            {opt.icon}
                            {opt.label}
                        </button>
                    ))}
                </div>
            </SettingRow>
            <Divider />
            <SettingRow label="Tekststørrelse" description="Påvirker tekststørrelsen i hele appen">
                <SettingSelect<FontSize>
                    value={fontSize}
                    onChange={handleFontSize}
                    options={FONT_SIZE_OPTIONS}
                />
            </SettingRow>
        </SectionCard>
    );
}
