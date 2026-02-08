import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Smartphone } from 'lucide-react';
import OnBoardingTitle from '../components/onBoarding/OnBoardingTitle';
import OnBoardingButton from '../components/onBoarding/OnBoardingButton';
import ToggleThemeButton from '../components/ToggleThemeButton';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
    const navigate = useNavigate();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Simple login logic - replace with actual authentication
        if (email && password) {
            navigate('/');
        }
    };

    return (
        <section
            className="min-h-screen flex items-center justify-center px-4 py-10 transition-colors"
            style={{ backgroundColor: 'var(--color-background)' }}
        >
            <ToggleThemeButton />
            <div
                className="w-full max-w-md rounded-2xl shadow-md transition-colors relative overflow-hidden"
                style={{ backgroundColor: 'var(--color-surface)' }}
            >
                <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
                    <div
                        className="absolute -right-10 top-10 h-48 w-48"
                        style={{
                            borderColor: 'color-mix(in srgb, var(--color-primary) 35%, transparent)',
                        }}
                    />
                    {/* TODO! Add decorative elements */}
                </div>

                <div className="relative p-8">
                    <OnBoardingTitle description="Lag en konto eller logg inn for å komme i gang" />

                    <div
                        className="mt-6 grid grid-cols-2 rounded-xl p-1"
                        style={{ backgroundColor: 'color-mix(in srgb, var(--color-border) 35%, transparent)' }}
                    >
                        <button
                            type="button"
                            onClick={() => setActiveTab('login')}
                            className="h-10 rounded-lg text-sm font-semibold transition-colors"
                            style={
                                activeTab === 'login'
                                    ? { backgroundColor: 'var(--color-surface)', color: 'var(--color-text-primary)' }
                                    : { backgroundColor: 'transparent', color: 'var(--color-text-secondary)' }
                            }
                        >
                            Logg inn
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('register')}
                            className="h-10 rounded-lg text-sm font-semibold transition-colors"
                            style={
                                activeTab === 'register'
                                    ? { backgroundColor: 'var(--color-surface)', color: 'var(--color-text-primary)' }
                                    : { backgroundColor: 'transparent', color: 'var(--color-text-secondary)' }
                            }
                        >
                            Registrer deg
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                        <div>
                            <label
                                htmlFor="email"
                                className="block text-sm font-medium mb-2"
                                style={{ color: 'var(--color-text-secondary)' }}
                            >
                                E-post
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full h-12 px-4 rounded-xl outline-none transition-colors"
                                style={{
                                    backgroundColor: 'var(--color-surface)',
                                    border: '1px solid color-mix(in srgb, var(--color-border) 60%, transparent)',
                                    color: 'var(--color-text-primary)',
                                }}
                                required
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="password"
                                className="block text-sm font-medium mb-2"
                                style={{ color: 'var(--color-text-secondary)' }}
                            >
                                Passord
                            </label>
                            <div
                                className="flex items-center h-12 rounded-xl px-4 gap-3"
                                style={{
                                    backgroundColor: 'var(--color-surface)',
                                    border: '1px solid color-mix(in srgb, var(--color-border) 60%, transparent)',
                                }}
                            >
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="flex-1 bg-transparent outline-none"
                                    style={{ color: 'var(--color-text-primary)' }}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((v) => !v)}
                                    className="p-1 rounded-md transition-colors"
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                    style={{ color: 'var(--color-text-secondary)' }}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                            <label className="inline-flex items-center gap-2 select-none" style={{ color: 'var(--color-text-secondary)' }}>
                                <input
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    className="h-4 w-4 rounded"
                                />
                                Husk meg
                            </label>

                            <button
                                type="button"
                                className="font-semibold transition-colors hover:text-var(--color-primary-hover) hover:underline cursor-pointer"
                                style={{ color: 'var(--color-primary)' }}
                                onClick={() => {
                                    // TODO: hook up forgot-password flow
                                }}
                            >
                                Glemt passord?
                            </button>
                        </div>

                        <OnBoardingButton
                            type="submit"
                            text={activeTab === 'register' ? 'Registrer deg' : 'Logg inn'}
                            variant="primary"
                            className="h-12 rounded-xl font-semibold"
                        />
                    </form>

                    <div className="mt-6 flex items-center gap-3">
                        <div className="h-px flex-1" style={{ backgroundColor: 'color-mix(in srgb, var(--color-border) 70%, transparent)' }} />
                        <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                            Eller
                        </span>
                        <div className="h-px flex-1" style={{ backgroundColor: 'color-mix(in srgb, var(--color-border) 70%, transparent)' }} />
                    </div>

                    <button
                        type="button"
                        className="mt-4 w-full h-12 rounded-xl inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
                        style={{
                            backgroundColor: 'var(--color-surface)',
                            border: '1px solid color-mix(in srgb, var(--color-border) 60%, transparent)',
                            color: 'var(--color-text-primary)',
                        }}
                        onClick={() => {
                            // TODO: alternative sign-in method
                        }}
                    >
                        <Smartphone size={18} />
                    </button>
                </div>
            </div>
        </section>
    );
}

