/*
    * DemoModeContext.tsx
    * Provides an automated "demo mode" guided tour that iterates through the main pages
    * of the app, showcasing each page and its key functions. Only available while the user
    * is logged in. Toggle with the keyboard shortcut Ctrl/Cmd + Shift + D, or via start()/stop().
    * Author: Emil Berglund
*/

/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { ROUTES } from '../router/routes';

/** A UI action a demo step can trigger via a window CustomEvent (handled by HeaderSection). */
export type DemoAction =
    | 'open-nav'
    | 'close-nav'
    | 'open-notifications'
    | 'close-notifications';

export interface DemoStep {
    /** Route to navigate to when the step begins. */
    route?: string;
    /** Optional UI action to dispatch when the step begins. */
    action?: DemoAction;
    title: string;
    description: string;
    /** How long the step is shown before auto-advancing (ms). */
    duration: number;
}

/** Custom event name used to drive header flyouts from the demo. */
export const DEMO_ACTION_EVENT = 'demo:action';

/** The scripted tour: one entry per page / function to showcase. */
const DEMO_SCRIPT: DemoStep[] = [
    {
        route: ROUTES.DASHBOARD.path,
        title: 'Dashbord',
        description: 'Startsiden gir deg en rask oversikt over lageret og snarveier til de viktigste funksjonene.',
        duration: 6000,
    },
    {
        action: 'open-nav',
        title: 'Navigasjonsmeny',
        description: 'Hovedmenyen sklir inn fra venstre med profil, lokasjon og lenker til alle sidene.',
        duration: 6000,
    },
    {
        action: 'close-nav',
        route: ROUTES.STORAGE.path,
        title: 'Lager',
        description: 'Her ser du hele varebeholdningen. Søk, filtrer og hold oversikt over hva som er på lager.',
        duration: 7000,
    },
    {
        route: ROUTES.RECIPES.path,
        title: 'Oppskrifter',
        description: 'Bla i oppskrifter, filtrer på kategori og allergener, og legg til nye oppskrifter med bilde.',
        duration: 7000,
    },
    {
        route: ROUTES.SHOPPING_LIST.path,
        title: 'Handleliste',
        description: 'Samle varer du trenger å kjøpe inn. Kryss av, legg til og rydd opp i listen.',
        duration: 7000,
    },
    {
        action: 'open-notifications',
        title: 'Varsler',
        description: 'Varselsenteret viser tilgangsforespørsler og oppdateringer. Marker som lest eller slett.',
        duration: 6000,
    },
    {
        action: 'close-notifications',
        route: ROUTES.SETTINGS.path,
        title: 'Innstillinger',
        description: 'Innstillingssenteret samler kontoen din, søknader, app-innstillinger og info om appen.',
        duration: 6000,
    },
    {
        route: ROUTES.SETTINGS_ACCOUNT.path,
        title: 'Min konto',
        description: 'Endre navn, brukernavn og profilbilde for kontoen din.',
        duration: 6000,
    },
    {
        route: ROUTES.SETTINGS_APP_SETTINGS.path,
        title: 'App-innstillinger',
        description: 'Bytt tema, og juster tilgjengelighet som redusert bevegelse og høy kontrast.',
        duration: 6000,
    },
    {
        route: ROUTES.SETTINGS_ABOUT.path,
        title: 'Om Sandom Lager',
        description: 'Les om appen, versjon og hvem som står bak. Det var hele omvisningen!',
        duration: 6000,
    },
];

interface DemoModeContextValue {
    isRunning: boolean;
    isPaused: boolean;
    stepIndex: number;
    steps: DemoStep[];
    currentStep: DemoStep | null;
    start: () => void;
    stop: () => void;
    next: () => void;
    prev: () => void;
    togglePause: () => void;
}

const DemoModeContext = createContext<DemoModeContextValue | null>(null);

function dispatchAction(action: DemoAction) {
    window.dispatchEvent(new CustomEvent<DemoAction>(DEMO_ACTION_EVENT, { detail: action }));
}

export function DemoModeProvider({ children }: { children: React.ReactNode }) {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth0();
    const [isRunning, setIsRunning] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [stepIndex, setStepIndex] = useState(0);
    const timerRef = useRef<number | null>(null);

    const steps = DEMO_SCRIPT;
    const currentStep = isRunning ? steps[stepIndex] ?? null : null;

    const clearTimer = useCallback(() => {
        if (timerRef.current !== null) {
            window.clearTimeout(timerRef.current);
            timerRef.current = null;
        }
    }, []);

    const stop = useCallback(() => {
        clearTimer();
        // Make sure no flyout is left open when the tour ends.
        dispatchAction('close-nav');
        dispatchAction('close-notifications');
        setIsRunning(false);
        setIsPaused(false);
        setStepIndex(0);
    }, [clearTimer]);

    const start = useCallback(() => {
        setStepIndex(0);
        setIsPaused(false);
        setIsRunning(true);
    }, []);

    const goTo = useCallback((index: number) => {
        if (index < 0) return;
        if (index >= steps.length) {
            stop();
            navigate(ROUTES.DASHBOARD.path);
            return;
        }
        setStepIndex(index);
    }, [steps.length, stop, navigate]);

    const next = useCallback(() => goTo(stepIndex + 1), [goTo, stepIndex]);
    const prev = useCallback(() => goTo(stepIndex - 1), [goTo, stepIndex]);
    const togglePause = useCallback(() => setIsPaused((p) => !p), []);

    // Run side effects (navigation + actions) whenever the active step changes.
    useEffect(() => {
        if (!isRunning) return;
        const step = steps[stepIndex];
        if (!step) return;
        if (step.action) dispatchAction(step.action);
        if (step.route) navigate(step.route);
    }, [isRunning, stepIndex, steps, navigate]);

    // Auto-advance timer.
    useEffect(() => {
        clearTimer();
        if (!isRunning || isPaused) return;
        const step = steps[stepIndex];
        if (!step) return;
        timerRef.current = window.setTimeout(() => {
            goTo(stepIndex + 1);
        }, step.duration);
        return clearTimer;
    }, [isRunning, isPaused, stepIndex, steps, goTo, clearTimer]);

    // Stop the tour if the user logs out mid-demo (sync with external auth state).
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- reacting to external auth change
        if (!isAuthenticated && isRunning) stop();
    }, [isAuthenticated, isRunning, stop]);

    // Keyboard shortcut: Ctrl/Cmd + Shift + D. Only when logged in.
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (!(e.shiftKey && (e.ctrlKey || e.metaKey))) return;
            if (e.key.toLowerCase() !== 'd') return;
            // Ignore while typing in a field.
            const target = e.target as HTMLElement | null;
            if (target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return;
            if (!isAuthenticated) return;
            e.preventDefault();
            setIsRunning((running) => {
                if (running) {
                    clearTimer();
                    dispatchAction('close-nav');
                    dispatchAction('close-notifications');
                    setIsPaused(false);
                    setStepIndex(0);
                    return false;
                }
                setIsPaused(false);
                setStepIndex(0);
                return true;
            });
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [isAuthenticated, clearTimer]);

    const value = useMemo<DemoModeContextValue>(() => ({
        isRunning,
        isPaused,
        stepIndex,
        steps,
        currentStep,
        start,
        stop,
        next,
        prev,
        togglePause,
    }), [isRunning, isPaused, stepIndex, steps, currentStep, start, stop, next, prev, togglePause]);

    return <DemoModeContext.Provider value={value}>{children}</DemoModeContext.Provider>;
}

export function useDemoMode(): DemoModeContextValue {
    const ctx = useContext(DemoModeContext);
    if (!ctx) throw new Error('useDemoMode must be used within a DemoModeProvider');
    return ctx;
}
