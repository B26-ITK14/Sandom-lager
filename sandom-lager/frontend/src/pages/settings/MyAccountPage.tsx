/*
    * MyAccountPage.tsx
    * Account settings page for managing personal information, security, preferences, and account options.
    * Author: Emil Berglund
*/


import { useAuth0 } from '@auth0/auth0-react';
import SettingsLayout from "../../components/settings/SettingsLayout";
import PersonalInfoCard from '../../components/settings/PersonalInfoCard';
import AccountDetailsCard from '../../components/settings/accountSettings/AccountDetailsCard';
import SecurityPrivacyCard from '../../components/settings/accountSettings/SecurityPrivacyCard';

import { updateName } from '../../api/user';
import { useUser } from '../../context/UserContext';
import { useUsername } from '../../hooks';

export default function MyAccountPage() {
    const username = useUsername();
    const { user, getAccessTokenSilently } = useAuth0();
    const { name: displayName, role, blocked, setName: setDisplayName } = useUser();


    const email = user?.email ?? 'N/A';
    const memberSince = user?.updated_at
        ? new Date(user.updated_at).toLocaleDateString('nb-NO', { month: 'long', year: 'numeric' })
        : 'N/A';

    const handleSavePersonalInfo = async (data: { name: string; username: string; location: string }) => {
        console.log('[MyAccountPage] handleSavePersonalInfo called with:', data);
        try {
            const token = await getAccessTokenSilently();
            await updateName(data.name, token);
            setDisplayName(data.name);
            console.log('[MyAccountPage] Name updated successfully →', data.name);
        } catch (err) {
            console.error('[MyAccountPage] Failed to update name:', err);
            throw err;
        }
    };

    return (
        <SettingsLayout title="Min konto">
            <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(340px,38%)] lg:items-stretch">
                <PersonalInfoCard
                    name={displayName}
                    username={username}
                    email={email}
                    onSave={handleSavePersonalInfo}
                />
                <AccountDetailsCard role={role} memberSince={memberSince} blocked={blocked} />
                <SecurityPrivacyCard />
            </div>
        </SettingsLayout>
    );
}
