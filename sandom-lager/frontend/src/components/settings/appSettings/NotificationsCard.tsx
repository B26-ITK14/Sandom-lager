/*
    * NotificationsCard.tsx
    * Settings card for notification preferences.
    * Author: Emil Berglund
    TODO: Implement actual notification logic and integration with the backend to save user preferences.
*/

import { useState } from 'react';
import { Bell, BellOff } from 'lucide-react';
import { SectionCard, SettingRow, Toggle, Divider } from './primitives';
import { readPref, savePref } from './utils';

export default function NotificationsCard() {
    const [notifyInventory, setNotifyInventory] = useState<boolean>(() => readPref('app:notifyInventory', true));
    const [notifyRecipes, setNotifyRecipes] = useState<boolean>(() => readPref('app:notifyRecipes', true));
    const [notifySystem, setNotifySystem] = useState<boolean>(() => readPref('app:notifySystem', true));

    const handle = (setter: (v: boolean) => void, key: string) => (v: boolean) => {
        setter(v);
        savePref(key, v);
    };

    return (
        <SectionCard
            title="Varsler"
            icon={notifySystem ? <Bell size={22} /> : <BellOff size={22} />}
        >
            <SettingRow label="Lagerbeholdning" description="Varsle når ingredienser er i ferd med å gå tomt">
                <Toggle checked={notifyInventory} onChange={handle(setNotifyInventory, 'app:notifyInventory')} />
            </SettingRow>
            <Divider />
            <SettingRow label="Oppskrifter" description="Varsle om nye eller oppdaterte oppskrifter">
                <Toggle checked={notifyRecipes} onChange={handle(setNotifyRecipes, 'app:notifyRecipes')} />
            </SettingRow>
            <Divider />
            <SettingRow label="Systemvarsler" description="Generelle varsler om appoppdateringer og vedlikehold">
                <Toggle checked={notifySystem} onChange={handle(setNotifySystem, 'app:notifySystem')} />
            </SettingRow>
        </SectionCard>
    );
}
