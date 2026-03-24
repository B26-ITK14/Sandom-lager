/*
    * SettingsUserHeader.tsx
    * A user profile header component for the settings page, displaying the user's profile picture, name, and an option to edit the profile. 
    * It also includes a styled divider for visual separation.
    * Author: Emil Berglund
*/

import { MapPin } from 'lucide-react';
import { useAuth0 } from '@auth0/auth0-react';
import { useUser } from '../../context/UserContext';
import { useUserRole } from '../../hooks';
import { useUppercaseUsername } from '../../hooks/user/useName';

export default function SettingsUserHeader() {
    const userName = useUppercaseUsername();
    const { user } = useAuth0();
    const { profilePicture } = useUser();
    const { role, loading: roleLoading } = useUserRole();
    const imageSrc = profilePicture || user?.picture || 'src/assets/temp_EmilB04.png';

    const email = user?.email ?? 'ukjent@epost.no';
    const memberSince = user?.updated_at
        ? new Date(user.updated_at).toLocaleDateString('nb-NO', { month: 'long', year: 'numeric' })
        : 'ukjent';

    return (
        <>
            {/* Profile section */}
            <section className="flex flex-col items-center gap-4 ">
                {/* Profile picture */}
                <figure 
                    className="overflow-hidden rounded-2xl p-1.5"
                    style={{
                        background: 'linear-gradient(var(--color-surface), var(--color-surface)) padding-box, linear-gradient(135deg, var(--color-primary-gradient-from), var(--color-primary-gradient-to)) border-box',
                        border: '2px solid transparent',
                    }}
                >
                    <img
                        src={imageSrc}
                        alt="Profile Picture"
                        className="w-24 h-24 rounded-2xl object-cover"
                    />
                </figure>

                {/* User name */}
                <h2
                    className="text-2xl font-semibold"
                    style={{ color: 'var(--color-text-primary)' }}
                >
                    {userName}
                </h2>

                {/* Email */}
                <p className="text-sm -mt-3" style={{ color: 'var(--color-text-secondary)' }}>
                    {email}
                </p>

                {/* Account status + role badges */}
                <div className="flex items-center gap-2">
                    <span
                        className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium"
                        style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-primary)' }}
                    >
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                        Aktiv
                    </span>
                    {!roleLoading && role && (
                        // Only show role badge if role is loaded and exists
                        <span
                            className="px-3 py-1 rounded-full text-xs font-medium capitalize"
                            style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text-secondary)' }}
                        >
                            {role}
                        </span>
                    )}
                </div>

                {/* TODO: Location */}
                <p className="flex items-center gap-1 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                    <MapPin size={14} />
                    Tomasgården, Kornsjø
                </p>

                {/* Member since */}
                <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                    Medlem siden {memberSince}
                </p>

                {/* Divider */}
                <div
                    className="w-full max-w-sm h-0.75 rounded-full"
                    style={{
                        backgroundColor: 'var(--color-primary)',
                        boxShadow: '0 4px 6px -1px var(--color-text-secondary), 0 2px 4px -1px var(--color-text-secondary)'
                    }}
                />
            </section>
        </>
    );
}
