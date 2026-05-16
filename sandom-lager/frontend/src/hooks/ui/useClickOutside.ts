/*
    * useClickOutside.ts
    * Custom React hook for detecting clicks outside a specified element.
    * This hook adds a pointerdown event listener to the document and checks if the click target is outside the referenced element. If it is, it calls the provided onOutsideClick callback.
    * The hook also accepts an optional "enabled" parameter to allow conditional activation of the click outside detection.
    * This is useful for components like dropdowns or modals that should close when the user clicks outside of them.
    * Author: Emil Berglund
 */

import { useEffect } from "react";
import type { RefObject } from "react";

export function useClickOutside<T extends HTMLElement>(
    ref: RefObject<T | null>,
    onOutsideClick: () => void,
    enabled = true
): void {
    useEffect(() => {
        if (!enabled) {
            return;
        }

        function handlePointerDown(event: PointerEvent) {
            const target = event.target;
            if (!(target instanceof Node)) {
                return;
            }

            if (!ref.current) {
                return;
            }

            if (!ref.current.contains(target)) {
                onOutsideClick();
            }
        }

        document.addEventListener("pointerdown", handlePointerDown);
        return () => document.removeEventListener("pointerdown", handlePointerDown);
    }, [enabled, onOutsideClick, ref]);
}
