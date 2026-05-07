/*
    * SettingsPage.tsx
    * The main settings page component that displays user information and navigation options for account management, application settings, and support.
    * It also includes a logout option that triggers the logout process and shows a loading overlay during the operation.
    * Author: Emil Berglund
 */

import Layout from "../components/Layout";
import UserHeader from "../components/settings/SettingsUserHeader";
import SettingsNavItem from "../components/settings/SettingsNavItem";
import { ROUTES } from "../router/routes";
import { LogoutLoadingOverlay, useAppLogout } from "../auth";
import { useUserRole, usePageMeta } from "../hooks";

export default function SettingsPage() {
    usePageMeta({
        title: "Settings - Sandom Lager",
        description: "Manage your account settings, preferences, and personal information",
        keywords: "settings, account, preferences, security, profile",
        ogTitle: "Settings - Sandom Lager",
        ogDescription: "Manage your account settings",
    });
    const { logoutUser, isLoggingOut } = useAppLogout();
    const { role } = useUserRole();   

    const handleLogout = () => {
        void logoutUser();
    };

    return (
        <Layout>
            {/* User profile header */}
            <UserHeader />

            {role === 'admin' && (
                <SettingsNavItem title="Admin Panel" description="Administrer søknader" url="/admin" figureType="security" />
            )}
            <SettingsNavItem title="Min konto" description="Gjør endringer for kontoen din" url={ROUTES.SETTINGS_ACCOUNT.path} figureType="account" />
            <SettingsNavItem title="Mine søknader" description="Se og administrer dine søknader" url={ROUTES.SETTINGS_APPLICATIONS.path} figureType="notification" />
            <SettingsNavItem title="App innstillinger" description="Tilpass appen etter dine preferanser" url={ROUTES.SETTINGS_APP_SETTINGS.path} figureType="security" />
            <SettingsNavItem title="Logg ut" description="Logg ut av alle aktive økter" url="#" figureType="logout" onClick={handleLogout} />

            <div className="flex items-center gap-3">
                <h2 className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>Mer</h2>
                <div
                    className="h-px flex-1"
                    style={{ backgroundColor: 'var(--color-border-primary, var(--color-text-secondary))' }}
                />
            </div>

            <SettingsNavItem title="Om Sandom Lager" url={ROUTES.SETTINGS_ABOUT.path} figureType="about" style={{ marginTop: '0.6rem' }} />

            {/* Overlay shown during logout */}
            <LogoutLoadingOverlay isVisible={isLoggingOut} />
        </Layout>
    )
}