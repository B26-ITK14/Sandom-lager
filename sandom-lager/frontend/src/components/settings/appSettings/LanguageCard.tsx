/*
    * LanguageCard.tsx
    * Settings card for language and region preferences.
    * Author: Emil Berglund
*/

import { useEffect, useState } from 'react';
import { Globe } from 'lucide-react';
import { SectionCard, SettingRow, SettingSelect } from './primitives';
import { readPref, savePref } from './utils';
import type { Language } from './utils';

const LANGUAGE_OPTIONS: { value: Language; label: string }[] = [
    { value: 'nb', label: 'Norsk (Bokmål)' },
];

const DEFAULT_LANGUAGE: Language = 'nb';

function isSupportedLanguage(value: Language) {
    return LANGUAGE_OPTIONS.some((option) => option.value === value);
}

let googleTranslateScriptPromise: Promise<void> | null = null;

type GoogleTranslateWindow = Window &
    typeof globalThis & {
        google?: {
            translate?: {
                TranslateElement?: new (
                    options: { pageLanguage: string; autoDisplay: boolean },
                    elementId: string,
                ) => unknown;
            };
        };
        googleTranslateElementInit?: () => void;
    };

function loadGoogleTranslateScript() {
    if (typeof window === 'undefined') {
        return Promise.resolve();
    }

    const globalWindow = window as GoogleTranslateWindow;

    if (globalWindow.google?.translate?.TranslateElement) {
        return Promise.resolve();
    }

    if (!googleTranslateScriptPromise) {
        googleTranslateScriptPromise = new Promise((resolve, reject) => {
            const existingScript = document.querySelector<HTMLScriptElement>('#google-translate-script');

            if (existingScript) {
                existingScript.addEventListener('load', () => resolve(), { once: true });
                existingScript.addEventListener('error', () => reject(new Error('Failed to load Google Translate')), { once: true });
                return;
            }

            globalWindow.googleTranslateElementInit = () => resolve();

            const script = document.createElement('script');
            script.id = 'google-translate-script';
            script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
            script.async = true;
            script.onerror = () => reject(new Error('Failed to load Google Translate'));
            document.head.appendChild(script);
        });
    }

    return googleTranslateScriptPromise;
}

export default function LanguageCard() {
    const [language, setLanguage] = useState<Language>(() => {
        const savedLanguage = readPref<Language>('app:language', DEFAULT_LANGUAGE);

        return isSupportedLanguage(savedLanguage) ? savedLanguage : DEFAULT_LANGUAGE;
    });
    const [isTranslateOpen, setIsTranslateOpen] = useState(false);
    const [isTranslateReady, setIsTranslateReady] = useState(false);

    const handleLanguage = (v: Language) => {
        setLanguage(v);
        savePref('app:language', v);
        document.documentElement.lang = 'nb-NO';
    };

    const toggleTranslatePopup = () => {
        setIsTranslateReady(false);
        setIsTranslateOpen((current) => !current);
    };

    const closeTranslatePopup = () => {
        setIsTranslateReady(false);
        setIsTranslateOpen(false);
    };

    const reloadPage = () => {
        window.location.reload();
    };

    useEffect(() => {
        document.documentElement.lang = 'nb-NO';
    }, []);

    useEffect(() => {
        if (!isTranslateOpen) {
            return;
        }

        let cancelled = false;

        const initializeTranslateWidget = () => {
            const globalWindow = window as GoogleTranslateWindow;
            const container = document.getElementById('google-translate-element');

            if (!container || !globalWindow.google?.translate?.TranslateElement) {
                return false;
            }

            if (container.hasChildNodes()) {
                setIsTranslateReady(true);
                return true;
            }

            new globalWindow.google.translate.TranslateElement(
                { pageLanguage: 'nb', autoDisplay: false },
                'google-translate-element',
            );

            setTimeout(() => {
                if (!cancelled) {
                    const readyContainer = document.getElementById('google-translate-element');
                    setIsTranslateReady(Boolean(readyContainer?.hasChildNodes()));
                }
            }, 300);

            return true;
        };

        void loadGoogleTranslateScript()
            .then(() => {
                if (cancelled) {
                    return;
                }

                initializeTranslateWidget();
                window.setTimeout(() => {
                    if (!cancelled) {
                        initializeTranslateWidget();
                    }
                }, 250);
            })
            .catch(() => {
                if (!cancelled) {
                    setIsTranslateOpen(false);
                }
            });

        return () => {
            cancelled = true;
        };
    }, [isTranslateOpen]);

    return (
        <SectionCard title="Språk og region" icon={<Globe size={22} />}>
            <SettingRow label="Språk" description="Velg visningsspråk for appen">
                <SettingSelect<Language>
                    value={language}
                    onChange={handleLanguage}
                    options={LANGUAGE_OPTIONS}
                />
            </SettingRow>
            <SettingRow
                label="Google Translate"
                description="Åpne en innebygd oversettelses-popup for andre språk"
            >
                <div className="relative flex flex-col items-end gap-3 sm:items-start">
                    <button
                        type="button"
                        className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg cursor-pointer"
                        style={{
                            background: 'linear-gradient(135deg, var(--color-primary-gradient-from), var(--color-primary-gradient-to))',
                            color: 'var(--color-on-primary)',
                        }}
                        onClick={toggleTranslatePopup}
                        aria-expanded={isTranslateOpen}
                        aria-controls="google-translate-popup"
                    >
                        <span className="inline-block h-2 w-2 rounded-full bg-current opacity-70" />
                        {isTranslateOpen ? 'Lukk oversettelse' : 'Åpne Google Translate'}
                    </button>
                    {isTranslateOpen && (
                        <div
                            id="google-translate-popup"
                            className="translate-popup-panel fixed inset-x-3 bottom-3 z-50 w-[calc(100vw-1.5rem)] max-h-[min(72vh,34rem)] overflow-y-auto rounded-[1.5rem] border p-4 shadow-2xl backdrop-blur-md sm:absolute sm:left-auto sm:right-0 sm:top-[calc(100%+0.75rem)] sm:bottom-auto sm:w-[24rem] sm:max-h-none"
                            style={{
                                backgroundColor: 'color-mix(in srgb, var(--color-surface) 92%, transparent)',
                                borderColor: 'color-mix(in srgb, var(--color-border) 72%, transparent)',
                                boxShadow: '0 24px 80px rgba(0, 0, 0, 0.22)',
                            }}
                        >
                            <div className="mb-4 flex items-start justify-between gap-3">
                                <div>
                                    <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                                        Oversett denne appen
                                    </p>
                                    <p className="mt-1 text-xs leading-5" style={{ color: 'var(--color-text-secondary)' }}>
                                        Velg språk i Google Translate-widgeten under.
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    className="rounded-full px-2.5 py-1 text-xs font-medium transition-opacity hover:opacity-75 cursor-pointer"
                                    style={{
                                        backgroundColor: 'var(--color-secondary-surface)',
                                        color: 'var(--color-text-primary)',
                                    }}
                                    onClick={closeTranslatePopup}
                                    aria-label="Lukk Google Translate"
                                >
                                    Lukk
                                </button>
                            </div>
                            <div className="translate-widget-shell rounded-2xl border p-3 sm:p-4">
                                {!isTranslateReady && (
                                    <div
                                        className="mb-3 rounded-xl border px-3 py-2 text-sm"
                                        style={{
                                            backgroundColor: 'var(--color-secondary-surface)',
                                            borderColor: 'var(--color-border)',
                                            color: 'var(--color-text-secondary)',
                                        }}
                                    >
                                        <div className="flex items-center justify-between gap-3">
                                            <span>Laster Google Translate...</span>
                                            <button
                                                type="button"
                                                className="shrink-0 rounded-full px-3 py-1 text-xs font-semibold transition-opacity hover:opacity-80 cursor-pointer"
                                                style={{
                                                    backgroundColor: 'var(--color-primary)',
                                                    color: 'var(--color-on-primary)',
                                                }}
                                                onClick={reloadPage}
                                                aria-label="Last inn siden på nytt for å prøve Google Translate igjen"
                                            >
                                                Prøv igjen
                                            </button>
                                        </div>
                                    </div>
                                )}
                                <div id="google-translate-element" className="translate-element-host" />
                            </div>
                        </div>
                    )}
                </div>
            </SettingRow>
        </SectionCard>
    );
}
