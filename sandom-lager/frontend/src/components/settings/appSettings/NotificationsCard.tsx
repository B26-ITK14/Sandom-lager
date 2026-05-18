/*
    * NotificationsCard.tsx
    * Settings card for notification preferences.
    * Allows users to toggle notifications for inventory, recipes, and system alerts.
    * Saves preferences to local storage and updates server-side settings via API calls.
    * Provides error handling and feedback for failed updates.
    * Is used within the AppSettingsPage.tsx component on the application settings page.
    * Author: Emil Berglund
*/

import { useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Bell, BellOff } from 'lucide-react';
import { SectionCard, SettingRow, Toggle, Divider } from './primitives';
import { readPref, savePref } from './utils';
import { updateNotificationPreferences } from '../../../api/user';

export default function NotificationsCard() {
    const { getAccessTokenSilently } = useAuth0();
    const [notifyInventory, setNotifyInventory] = useState<boolean>(() => readPref('app:notifyInventory', true));
    const [notifyRecipes, setNotifyRecipes] = useState<boolean>(() => readPref('app:notifyRecipes', true));
    const [notifySystem, setNotifySystem] = useState<boolean>(() => readPref('app:notifySystem', true));
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handle = async (setter: (v: boolean) => void, key: string, value: boolean) => {
        setter(value);
        savePref(key, value);
        setError(null);
        setLoading(true);

        try {
            const token = await getAccessTokenSilently();
            const preferences: Record<string, boolean> = {};

            if (key === 'app:notifyInventory') {
                preferences.notifyInventory = value;
            } else if (key === 'app:notifyRecipes') {
                preferences.notifyRecipes = value;
            } else if (key === 'app:notifySystem') {
                preferences.notifySystem = value;
            }

            await updateNotificationPreferences(preferences, token);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Kunne ikke lagre preferanser';
            setError(message);
            // Revert local state on error
            setter(!value);
            savePref(key, !value);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SectionCard
            title="Varsler"
            icon={notifySystem ? <Bell size={22} /> : <BellOff size={22} />}
        >
            {error && <div style={{ color: '#dc2626', marginBottom: '12px', fontSize: '14px' }}>{error}</div>}
            <SettingRow label="Lagerbeholdning" description="Varsle når ingredienser er i ferd med å gå tomt">
                <Toggle
                    ariaLabel="Varsle om lav lagerbeholdning"
                    checked={notifyInventory}
                    onChange={(v) => { void handle(setNotifyInventory, 'app:notifyInventory', v); }}
                    disabled={loading}
                />
            </SettingRow>
            <Divider />
            <SettingRow label="Oppskrifter" description="Varsle om nye eller oppdaterte oppskrifter">
                <Toggle
                    ariaLabel="Varsle om oppskriftsoppdateringer"
                    checked={notifyRecipes}
                    onChange={(v) => { void handle(setNotifyRecipes, 'app:notifyRecipes', v); }}
                    disabled={loading}
                />
            </SettingRow>
            <Divider />
            <SettingRow label="Systemvarsler" description="Generelle varsler om appoppdateringer og vedlikehold">
                <Toggle
                    ariaLabel="Varsle om systemoppdateringer"
                    checked={notifySystem}
                    onChange={(v) => { void handle(setNotifySystem, 'app:notifySystem', v); }}
                    disabled={loading}
                />
            </SettingRow>
        </SectionCard>
    );
}
