import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { Moon, Sun } from 'lucide-react';
import { useUsername } from '../hooks/useUsername';
import Layout from '../components/Layout';


export default function HomePage() {
    const navigate = useNavigate();
    const { theme, toggleTheme } = useTheme();
    const username = useUsername();

    const handleLogout = () => {
        navigate('/login');
    };

    return (
        <Layout currentPage="Dashboard">
            <section className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-normal">Velkommen!</h1>
                <div className="flex gap-3">
                    <button
                        onClick={toggleTheme}
                        className="py-2 px-4 rounded-md transition-colors flex items-center gap-2"
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
                    <button
                        onClick={handleLogout}
                        className="py-2 px-4 rounded-md transition-colors"
                        style={{ backgroundColor: 'var(--color-danger)', color: 'var(--color-on-danger)' }}
                    >
                        Logout
                    </button>
                </div>
            </section>
            <p style={{ color: 'var(--color-text-secondary)' }}>
                Dette er hovedapplikasjonen. Du er logget inn som: <strong>{username}</strong>
            </p>
        </Layout>
    );
}
