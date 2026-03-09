/*
    * LogoutLoadingOverlay.tsx
    * A component that displays a full-screen loading overlay with a spinner and message during the logout process.
    * It is designed to provide feedback to the user while the application is logging them out, preventing any interaction until the process is complete.
*/

import LoadingSpinner from "../components/LoadingSpinner";

type LogoutLoadingOverlayProps = {
    isVisible: boolean;
};

export function LogoutLoadingOverlay({ isVisible }: LogoutLoadingOverlayProps) {
    if (!isVisible) {
        return null;
    }

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center"
            style={{ backgroundColor: "rgba(0, 0, 0, 0.45)" }}
            aria-live="polite"
            aria-busy="true"
        >
            <div
                className="rounded-xl"
                style={{
                    backgroundColor: "var(--color-surface)",
                    color: "var(--color-text-primary)",
                }}
            >
                <LoadingSpinner logout />
            </div>
        </div>
    );
}
