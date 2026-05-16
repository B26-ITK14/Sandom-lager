/*
    * AccessibilityCard.tsx
    * Settings card for accessibility options like reduced motion and high contrast mode.
    * Allows users to toggle accessibility features that enhance usability for those with specific needs.
    * Applies changes immediately and saves preferences to local storage for persistence.
    * Is used within the AppSettingsPage.tsx component on the application settings page.
    * Author: Emil Berglund
*/

import { useState } from 'react';
import { Accessibility } from 'lucide-react';
import { SectionCard, SettingRow, Toggle, Divider } from './primitives';
import { readPref, savePref } from './utils';

export default function AccessibilityCard() {
    const [reducedMotion, setReducedMotion] = useState<boolean>(() => readPref('app:reducedMotion', false));
    const [highContrast, setHighContrast] = useState<boolean>(() => readPref('app:highContrast', false));

    const handleReducedMotion = (v: boolean) => {
        setReducedMotion(v);
        savePref('app:reducedMotion', v);
        document.documentElement.classList.toggle('reduce-motion', v);
        document.documentElement.style.setProperty('--transition-duration', v ? '0ms' : '200ms');
    };

    const handleHighContrast = (v: boolean) => {
        setHighContrast(v);
        savePref('app:highContrast', v);
        document.documentElement.classList.toggle('high-contrast', v);
    };

    return (
        <SectionCard title="Tilgjengelighet" icon={<Accessibility size={22} />}>
            <SettingRow label="Redusert bevegelse" description="Skru av animasjoner og overganger">
                <Toggle ariaLabel="Slå av eller på redusert bevegelse" checked={reducedMotion} onChange={handleReducedMotion} />
            </SettingRow>
            <Divider />
            <SettingRow label="Høy kontrast" description="Øk kontrasten for bedre lesbarhet">
                <Toggle ariaLabel="Slå av eller på høy kontrast" checked={highContrast} onChange={handleHighContrast} />
            </SettingRow>
        </SectionCard>
    );
}
