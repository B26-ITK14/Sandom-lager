/*
    * LoadingSpinner.tsx
    * A simple loading spinner component that displays a centered spinner animation, used to indicate loading states in the application.
    * Author: Emil Berglund
*/

import { Loader2 } from "lucide-react";

type LoadingSpinnerProps = {
    logout?: boolean;
};

export default function LoadingSpinner({ logout = false }: LoadingSpinnerProps) {
    if (logout) {
        return (
            <div className="flex items-center gap-3 rounded-xl px-5 py-4">
                <Loader2
                    className="w-5 h-5 animate-spin"
                    style={{ color: 'var(--color-text-primary)' }}
                />
                <span className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                    Logger ut...
                </span>
            </div>
        );
    }

    return (
        <div 
            className="min-h-screen flex items-center justify-center" 
            style={{ backgroundColor: 'var(--color-background)' }}
        >
            <Loader2 
                className="w-12 h-12 animate-spin" 
                style={{ color: 'var(--color-text-primary)' }} 
            />
        </div>
    );
}
