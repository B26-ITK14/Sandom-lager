/*
    * AppSettingsPage.tsx
    * Main settings page for app-related preferences like appearance, language, notifications, and accessibility.
    * Author: Emil Berglund
*/

import SettingsLayout from "../../components/settings/SettingsLayout";
import AppearanceCard from '../../components/settings/appSettings/AppearanceCard';
import LanguageCard from '../../components/settings/appSettings/LanguageCard';
import NotificationsCard from '../../components/settings/appSettings/NotificationsCard';
import AccessibilityCard from '../../components/settings/appSettings/AccessibilityCard';
import AppInfoCard from '../../components/settings/appSettings/AppInfoCard';
import { usePageMeta } from "../../hooks";

export default function AppSettingsPage() {
    usePageMeta({
        title: "App Settings - Sandom Lager",
        description: "Customize app appearance, theme, font size, and accessibility preferences",
        keywords: "settings, theme, accessibility, preferences",
        ogTitle: "App Settings - Sandom Lager",
        ogDescription: "Customize your app experience",
    });
    return (
        <SettingsLayout title="App innstillinger">
            <div className="mx-auto max-w-6xl space-y-6">
                <AppearanceCard />
                <LanguageCard />
                <NotificationsCard />
                <AccessibilityCard />
                <AppInfoCard />
            </div>
        </SettingsLayout>
    );
}

