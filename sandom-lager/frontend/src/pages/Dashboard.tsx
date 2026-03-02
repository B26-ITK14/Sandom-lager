/*
    * Dashboard.tsx
 */

import { useTheme } from '../context/ThemeContext';
import { Moon, Sun } from 'lucide-react';
import { useUsername } from '../hooks/useName';
import Layout from '../components/Layout';
import { useAuth0 } from '@auth0/auth0-react';
import { useEffect } from 'react';


export default function HomePage() {
    const { theme, toggleTheme } = useTheme();
    const username = useUsername();
    const { getAccessTokenSilently, isAuthenticated } = useAuth0();

    // Debugging: Log access token to verify Auth0 integration
    useEffect(() => {
        async function debugToken() {
            try {
                const token = await getAccessTokenSilently();
                console.log("ACCESS TOKEN:", token);
            } catch (error) {
                console.error("Error fetching access token:", error);
            }
        }
        if (isAuthenticated) {
            debugToken();
        }
    }, [getAccessTokenSilently, isAuthenticated]);

    return (
        <Layout>
            <section className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-normal">Velkommen!</h1>
                <div className="flex gap-3">
                    <button
                        onClick={toggleTheme}
                        className="py-2 px-4 rounded-md transition-colors flex items-center gap-2 cursor-pointer"
                        aria-label="Toggle theme"
                        style={{
                            backgroundColor: 'var(--color-background)',
                            color: 'var(--color-text-primary)',
                            border: '1px solid var(--color-border)',
                        }}
                    >
                        {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                        {theme === 'light' ? 'Dark' : 'Light'}
                    </button>
                </div>
            </section>
            <p style={{ color: 'var(--color-text-secondary)' }}>
                Dette er hovedapplikasjonen. Du er logget inn som: <strong>{username}</strong>
            </p>


        </Layout>
    );
}
