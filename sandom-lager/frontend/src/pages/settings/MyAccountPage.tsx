/*
    * MyAccountPage.tsx
    * Account settings page for managing personal information, security, preferences, and account options.
    * Includes sections for personal info (name, username, email, profile picture), account details (role, member since, blocked status), and security/privacy settings (password changes, active sessions).
    * Utilizes the PersonalInfoCard, AccountDetailsCard, and SecurityPrivacyCard components to organize settings into clear sections.
    * Author: Emil Berglund
*/


import { useAuth0 } from '@auth0/auth0-react';
import SettingsLayout from "../../components/settings/SettingsLayout";
import PersonalInfoCard from '../../components/settings/accountSettings/PersonalInfoCard';
import AccountDetailsCard from '../../components/settings/accountSettings/AccountDetailsCard';
import SecurityPrivacyCard from '../../components/settings/accountSettings/SecurityPrivacyCard';
import { usePageMeta } from '../../hooks';

import { updateName, updateUsername } from '../../api/user';
import { useUser } from '../../context/UserContext';
import { useUsername } from '../../hooks';

export default function MyAccountPage() {
    usePageMeta({
        title: "My Account - Sandom Lager",
        description: "Manage your personal information, security settings, and account preferences",
        keywords: "account, profile, personal info, security",
        ogTitle: "My Account - Sandom Lager",
        ogDescription: "Manage your account settings",
    });
    const username = useUsername();
    const { user, getAccessTokenSilently } = useAuth0();
    const {
        name: displayName,
        username: persistedUsername,
        role,
        blocked,
        profilePicture,
        location,
        setName: setDisplayName,
        setUsername,
        setProfilePicture,
    } = useUser();

    const displayUsername = persistedUsername ?? username;


    const email = user?.email ?? 'N/A';
    const memberSince = user?.updated_at
        ? new Date(user.updated_at).toLocaleDateString('nb-NO', { month: 'long', year: 'numeric' })
        : 'N/A';

    const handleSavePersonalInfo = async (data: { name: string; username: string; location: string }) => {
        try {
            const token = await getAccessTokenSilently();
            const trimmedName = data.name.trim();
            const trimmedUsername = data.username.trim();
            const currentPersistedUsername = (persistedUsername ?? '').trim();

            if (trimmedName !== displayName.trim()) {
                await updateName(trimmedName, token);
                setDisplayName(trimmedName);
            }

            if (trimmedUsername !== currentPersistedUsername) {
                const savedUsername = await updateUsername(trimmedUsername, token);
                setUsername(savedUsername);
            }
        } catch {
            throw new Error('Kunne ikke oppdatere profil');
        }
    };

    return (
        <SettingsLayout title="Min konto">
            <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(340px,38%)] lg:items-stretch">
                <PersonalInfoCard
                    name={displayName}
                    username={displayUsername}
                    email={email}
                    profilePicture={profilePicture || null}
                    location={location ?? 'N/A'}
                    onProfilePictureSave={setProfilePicture}
                    onSave={handleSavePersonalInfo}
                />
                <AccountDetailsCard role={role} memberSince={memberSince} blocked={blocked} />
                <SecurityPrivacyCard />
            </div>
        </SettingsLayout>
    );
}
