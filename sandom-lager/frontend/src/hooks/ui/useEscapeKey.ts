/*
    * useEscapeKey.ts
    * Custom React hook for handling Escape key presses.
    * This hook adds a keydown event listener to the window and checks if the pressed key is "Escape". If it is, it calls the provided onEscape callback.
    * The hook also accepts an optional "enabled" parameter to allow conditional activation of the Escape key handling.
    * This is useful for components like modals or dropdowns that should close when the user presses the Escape key.
    * Author: Emil Berglund
*/

import { useEffect } from "react";

export function useEscapeKey(onEscape: () => void, enabled = true): void {
    useEffect(() => {
        if (!enabled) {
            return;
        }

        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === "Escape") {
                onEscape();
            }
        }

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [enabled, onEscape]);
}
