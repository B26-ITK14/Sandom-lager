/*
    * ProfilePictureSection.tsx
    * Displays the user's profile picture with an optional camera button when in edit mode.
    * Author: Emil Berglund
*/

import { Camera } from 'lucide-react';

interface ProfilePictureSectionProps {
    isEditing: boolean;
}

export default function ProfilePictureSection({ isEditing }: ProfilePictureSectionProps) {
    return (
        <div className="flex items-center gap-4 pb-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
            <div className="relative">
                <img
                    src="/src/assets/temp_EmilB04.png"
                    alt="Profile"
                    className="w-20 h-20 rounded-full object-cover"
                />
                {isEditing && (
                    <button
                        className="absolute bottom-0 right-0 p-1.5 rounded-full"
                        style={{ backgroundColor: 'var(--color-primary)' }}
                    >
                        <Camera size={14} style={{ color: 'var(--color-surface)' }} />
                    </button>
                )}
            </div>
            <div>
                <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                    Profilbilde
                </p>
                <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                    JPG, PNG eller GIF (maks 5MB)
                </p>
            </div>
        </div>
    );
}
