/*
    * useAuthError.ts
    * Custom hook for accessing the AuthError context.
    * Author: Emil Berglund
*/

import { useContext } from 'react';
import { AuthErrorContext } from './AuthErrorContext';

export function useAuthError() {
    const context = useContext(AuthErrorContext);
    if (!context) {
        throw new Error('useAuthError must be used within AuthErrorProvider');
    }
    return context;
}
