
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
            <section className="flex flex-col items-center gap-4 mt-8">
                {/* Profile picture */}
                <figure className="w-32 h-32 flex items-center justify-center">
                    <img
                        src="src/assets/temp_EmilB04.png"
                        alt="Profile Picture"
                        className="w-full h-full object-cover"
                    />
                </figure>

                {/* User name */}
                <h2
                    className="text-2xl font-semibold mt-1"
                    style={{ color: 'var(--color-text-primary)' }}
                >
                    {userName}
                </h2>

                {/* Divider */}
                <div
                    className="w-full max-w-sm h-0.75 mt-1 rounded-full"
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
