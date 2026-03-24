/*
    * AuthErrorContext.tsx
    * A context provider that handles authentication errors globally.
    * When a 401 (Unauthorized) error occurs, it automatically logs out the user and redirects to the login page.
    * Author: Emil Berglund
*/

import React, { createContext, useContext, useCallback, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppLogout } from '../auth/useAppLogout';

interface AuthErrorContextType {
    handleAuthError: (status: number, errorMessage?: string) => void;
}

const AuthErrorContext = createContext<AuthErrorContextType | undefined>(undefined);

export function AuthErrorProvider({ children }: { children: ReactNode }) {
    const navigate = useNavigate();
    const { logoutUser } = useAppLogout();

    const handleAuthError = useCallback((status: number, errorMessage?: string) => {
        if (status === 401) {
            console.warn('[AuthError] Unauthorized (401) - Session expired or invalid credentials. Forcing logout.');
            if (errorMessage) {
                console.warn(`[AuthError] Details: ${errorMessage}`);
            }
            
            // Logout user and redirect to login
            void logoutUser();
            navigate('/login', { replace: true });
        }
    }, [logoutUser, navigate]);

    return (
        <AuthErrorContext.Provider value={{ handleAuthError }}>
            {children}
        </AuthErrorContext.Provider>
    );
}

export function useAuthError() {
    const context = useContext(AuthErrorContext);
    if (!context) {
        throw new Error('useAuthError must be used within AuthErrorProvider');
    }
    return context;
}
