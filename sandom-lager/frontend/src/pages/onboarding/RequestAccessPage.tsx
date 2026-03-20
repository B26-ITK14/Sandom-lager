/*
    * RequestAccessPage.tsx
    * Onboarding-side der bruker velger lokasjon og sender inn tilgangssøknad.
    * Vises etter registrering, før admin godkjenner tilgang.
    * Author: Khalid Osman
*/

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import LocationSelector, { type Location } from "../../components/onBoarding/LocationSelector";
import OnBoardingTitle from "../../components/onBoarding/OnBoardingTitle";
import { ROUTES } from "../../router/routes";
import { fetchLocations, requestLocationAccess } from "../../api/userLocations";

export default function RequestAccessPage() {
    const navigate = useNavigate();
    const { getAccessTokenSilently, isAuthenticated, isLoading } = useAuth0();
    const [locations, setLocations] = useState<Location[]>([]);
    const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!isAuthenticated || isLoading) return; 
        async function loadLocations() {
            try {
                const token = await getAccessTokenSilently();
                const data = await fetchLocations(token);
                setLocations(data.map((l: { id: number; name: string }) => ({
                    id: String(l.id),
                    name: l.name,
                })));
            } catch (err) {
                setError("Kunne ikke laste lokasjoner.");
            }
        }
        loadLocations();
    }, [getAccessTokenSilently, isAuthenticated, isLoading]); 

    async function handleSubmit() {
        if (!selectedLocation) {
            setError("Du må velge et sted før du kan sende søknad.");
            return;
        }
        setError(null);
        setIsSubmitting(true);
        try {
            const token = await getAccessTokenSilently();
            await requestLocationAccess(token, Number(selectedLocation));
            navigate(ROUTES.PENDING_APPROVAL.path);
        } catch {
            setError("Noe gikk galt. Prøv igjen.");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <main
            className="min-h-screen flex items-center justify-center px-4"
            style={{ backgroundColor: 'var(--color-background)' }}
        >
            <div className="w-full max-w-sm flex flex-col gap-6 animate-slide-in-left">
                <OnBoardingTitle description="Valgfritt sted avgjør tilgang til systemet. Du vil ikke få tilgang før søknaden er godkjent." />

                <section
                    className="rounded-2xl p-6"
                    style={{
                        backgroundColor: 'var(--color-surface)',
                        border: '1px solid var(--color-border)',
                    }}
                >
                    <h2
                        className="mb-5 text-base font-semibold"
                        style={{ color: 'var(--color-text-primary)' }}
                    >
                        Ny søknad
                    </h2>

                    <div className="mb-5">
                        <label
                            className="mb-1.5 block text-xs font-medium uppercase tracking-wide"
                            style={{ color: 'var(--color-text-secondary)' }}
                        >
                            Velg sted
                        </label>
                        <LocationSelector
                            locations={locations}
                            selectedId={selectedLocation}
                            onChange={setSelectedLocation}
                            disabled={isSubmitting}
                        />
                    </div>

                    {error && (
                        <p
                            className="mb-4 rounded-lg px-3 py-2 text-xs"
                            style={{
                                backgroundColor: '#FEE2E2',
                                color: 'var(--color-danger)',
                            }}
                        >
                            {error}
                        </p>
                    )}

                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting || !selectedLocation}
                        className="w-full rounded-xl py-3 text-sm font-semibold transition-all duration-150 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed mb-3"
                        style={{
                            backgroundColor: 'var(--color-primary)',
                            color: 'var(--color-on-primary)',
                        }}
                        onMouseEnter={e => {
                            if (!isSubmitting && selectedLocation)
                                e.currentTarget.style.backgroundColor = 'var(--color-primary-hover)';
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.backgroundColor = 'var(--color-primary)';
                        }}
                    >
                        {isSubmitting ? "Sender søknad..." : "Søk om tilgang"}
                    </button>

                    <button
                        onClick={() => navigate(ROUTES.DASHBOARD.path)}
                        disabled={isSubmitting}
                        className="w-full rounded-xl border py-3 text-sm font-medium transition-colors duration-150 disabled:opacity-50"
                        style={{
                            borderColor: 'var(--color-border)',
                            color: 'var(--color-text-secondary)',
                            backgroundColor: 'transparent',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--color-secondary-surface)')}
                        onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                        Avbryt
                    </button>
                </section>
            </div>
        </main>
    );
}