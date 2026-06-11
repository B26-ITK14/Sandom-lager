/*
    * DemoOverlay.tsx
    * Floating control bar shown while demo mode is running. Displays the current page caption,
    * progress, and playback controls (previous, pause/play, next, stop).
    * Author: Emil Berglund
*/

import { Play, Pause, SkipBack, SkipForward, X, Sparkles } from 'lucide-react';
import { useDemoMode } from '../../context/DemoModeContext';

export default function DemoOverlay() {
    const { isRunning, isPaused, stepIndex, steps, currentStep, next, prev, stop, togglePause } = useDemoMode();

    if (!isRunning || !currentStep) return null;

    const progress = ((stepIndex + 1) / steps.length) * 100;

    return (
        <div
            className="fixed bottom-0 left-0 right-0 z-[60] flex justify-center px-4 pb-4 pointer-events-none animate-fade-in"
            aria-live="polite"
        >
            <section
                className="pointer-events-auto w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden"
                style={{ backgroundColor: 'var(--color-surface)' }}
                role="region"
                aria-label="Demo-modus"
            >
                {/* Progress bar */}
                <div className="h-1 w-full" style={{ backgroundColor: 'var(--color-background)' }}>
                    <div
                        className="h-full transition-all duration-500 ease-out"
                        style={{ width: `${progress}%`, backgroundColor: 'var(--color-primary)' }}
                    />
                </div>

                <div className="flex items-center gap-4 p-4">
                    {/* Caption */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <Sparkles size={16} style={{ color: 'var(--color-primary)' }} />
                            <span
                                className="text-xs font-bold uppercase tracking-wide"
                                style={{ color: 'var(--color-primary)' }}
                            >
                                Demo · {stepIndex + 1}/{steps.length}
                            </span>
                        </div>
                        <p className="font-bold text-base truncate" style={{ color: 'var(--color-text-primary)' }}>
                            {currentStep.title}
                        </p>
                        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                            {currentStep.description}
                        </p>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center gap-1 shrink-0">
                        <button
                            type="button"
                            onClick={prev}
                            disabled={stepIndex === 0}
                            className="p-2 rounded-full hover:opacity-70 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                            style={{ color: 'var(--color-text-primary)' }}
                            aria-label="Forrige"
                        >
                            <SkipBack size={20} />
                        </button>
                        <button
                            type="button"
                            onClick={togglePause}
                            className="p-2 rounded-full hover:opacity-70 cursor-pointer"
                            style={{ color: 'var(--color-text-primary)' }}
                            aria-label={isPaused ? 'Spill av' : 'Pause'}
                        >
                            {isPaused ? <Play size={20} /> : <Pause size={20} />}
                        </button>
                        <button
                            type="button"
                            onClick={next}
                            className="p-2 rounded-full hover:opacity-70 cursor-pointer"
                            style={{ color: 'var(--color-text-primary)' }}
                            aria-label="Neste"
                        >
                            <SkipForward size={20} />
                        </button>
                        <button
                            type="button"
                            onClick={stop}
                            className="p-2 rounded-full hover:opacity-70 cursor-pointer ml-1"
                            style={{ color: 'var(--color-danger)' }}
                            aria-label="Avslutt demo"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
}
