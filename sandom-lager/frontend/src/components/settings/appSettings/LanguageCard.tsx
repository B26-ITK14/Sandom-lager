/*
    * LanguageCard.tsx
    * Settings card for language and region preferences.
    * Author: Emil Berglund
    TODO: Implement actual i18n support and region-specific formatting based on the selected language.
*/

import { useState } from 'react';
import { Globe } from 'lucide-react';
import { SectionCard, SettingRow, SettingSelect } from './primitives';
import { readPref, savePref } from './utils';
import type { Language } from './utils';

const LANGUAGE_OPTIONS: { value: Language; label: string }[] = [
    { value: 'nb', label: 'Norsk (Bokmål)' },
    { value: 'en', label: 'English' },
];

export default function LanguageCard() {
    const [language, setLanguage] = useState<Language>(() => readPref('app:language', 'nb'));

    const handleLanguage = (v: Language) => {
        setLanguage(v);
        savePref('app:language', v);
        document.documentElement.lang = v;
    };

    return (
        <SectionCard title="Språk og region" icon={<Globe size={22} />}>
            <SettingRow label="Språk" description="Velg visningsspråk for appen">
                <SettingSelect<Language>
                    value={language}
                    onChange={handleLanguage}
                    options={LANGUAGE_OPTIONS}
                />
            </SettingRow>
        </SectionCard>
    );
}
