/*
    * useAuthError.ts
    * Custom hook for accessing the AuthError context.
    * This hook provides a convenient way for components to access the authentication error handling logic defined in AuthErrorContext.
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
