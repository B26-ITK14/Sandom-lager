/*
    * SettingsPage.tsx
 */

import Layout from "../components/Layout";
import UserHeader from "../components/settings/SettingsUserHeader";
import SettingsNavItem from "../components/settings/SettingsNavItem";
import { ROUTES } from "../routes";

export default function SettingsPage() {

    return (
        <Layout>
            {/* User profile header */}
            <UserHeader />

            {/* Settings navigation */}
            <SettingsNavItem title="Min konto" description="Gjør endringer for kontoen din" url={ROUTES.SETTINGS_ACCOUNT.path} figureType="account" />
            <SettingsNavItem title="Mine søknader" description="Se og administrer dine søknader" url={ROUTES.SETTINGS_APPLICATIONS.path} figureType="notification" />
            <SettingsNavItem title="App innstillinger" description="Tilpass appen etter dine preferanser" url={ROUTES.SETTINGS_APP_SETTINGS.path} figureType="security" />
            <SettingsNavItem title="Logg ut" description="Logg ut av alle aktive økter" url="#" figureType="logout" />
            
            <div className="flex items-center gap-3">
                <h2 className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>Mer</h2>
                <div
                    className="h-px flex-1"
                    style={{ backgroundColor: 'var(--color-border-primary, var(--color-text-secondary))' }}
                />
            </div>

            <SettingsNavItem title="Hjelp og støtte" url="#" figureType="help" style={{marginBottom: '0.6rem'}} />
            <SettingsNavItem title="Om Sandom Lager" url="#" figureType="about" style={{marginTop: '0.6rem'}} />
        </Layout>
    )
}