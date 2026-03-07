/*
    * LoadingSpinner.tsx
    * A simple loading spinner component that displays a centered spinner animation, used to indicate loading states in the application.
    * Author: Emil Berglund
*/

import { Loader2 } from "lucide-react";

export default function LoadingSpinner() {
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
