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
