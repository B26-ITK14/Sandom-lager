/*
    * AccessibilityCard.tsx
    * Settings card for accessibility options like reduced motion and high contrast mode.
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
                <Toggle checked={reducedMotion} onChange={handleReducedMotion} />
            </SettingRow>
            <Divider />
            <SettingRow label="Høy kontrast" description="Øk kontrasten for bedre lesbarhet">
                <Toggle checked={highContrast} onChange={handleHighContrast} />
            </SettingRow>
        </SectionCard>
    );
}
