
/*
    * UserHeader.tsx
    * A user profile header component for the settings page, displaying the user's profile picture, name, and an option to edit the profile. 
    * It also includes a styled divider for visual separation.
    * Author: Emil Berglund
*/

import { Pencil } from 'lucide-react';
import { useUsername } from '../../hooks/useName';

export default function UserHeader() {
    const userName = useUsername();
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
                        src="src/assets/temp_EmilB04.png"
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

                {/* Divider */}
                <div
                    className="w-full max-w-sm h-0.75 rounded-full"
                    style={{
                        backgroundColor: 'var(--color-primary)',
                        boxShadow: '0 4px 6px -1px var(--color-text-secondary), 0 2px 4px -1px var(--color-text-secondary)'
                    }}
                />

                {/* Edit profile button */}
                <button
                    className="flex items-center gap-2 mt-1 text-base cursor-pointer"
                    style={{ color: 'var(--color-text-secondary)' }}
                >
                    Rediger profil <Pencil size={16} />
                </button>
            </section>
        </>
    );
}
