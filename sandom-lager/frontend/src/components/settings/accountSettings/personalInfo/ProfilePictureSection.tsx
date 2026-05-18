/*
    * ProfilePictureSection.tsx
    * Displays the user's profile picture with an optional camera button when in edit mode.
    * Is used within the PersonalInfoSection.tsx component on the account settings page.
    * Author: Emil Berglund
*/

import type { ChangeEventHandler } from 'react';
import { Camera, User } from 'lucide-react';

interface ProfilePictureSectionProps {
    imageSrc: string | null;
    isEditing: boolean;
    error?: string;
    onFileChange: ChangeEventHandler<HTMLInputElement>;
}

export default function ProfilePictureSection({ imageSrc, isEditing, error, onFileChange }: ProfilePictureSectionProps) {
    return (
        <div className="flex items-center gap-4 pb-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
            <div className="relative">
                {imageSrc ? (
                    <img
                        src={imageSrc}
                        alt="Profile"
                        className="w-20 h-20 rounded-full object-cover"
                    />
                ) : (
                    <div
                        className="w-20 h-20 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: 'var(--color-background)', color: 'var(--color-text-secondary)' }}
                    >
                        <User size={28} />
                    </div>
                )}
                {isEditing && (
                    <label
                        className="absolute bottom-0 right-0 p-1.5 rounded-full cursor-pointer"
                        style={{ backgroundColor: 'var(--color-primary)' }}
                    >
                        <input
                            type="file"
                            accept="image/png,image/jpeg,image/gif,image/webp"
                            className="sr-only"
                            onChange={onFileChange}
                        />
                        <Camera size={14} style={{ color: 'var(--color-surface)' }} />
                    </label>
                )}
            </div>
            <div>
                <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                    Profilbilde
                </p>
                <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                    JPG, PNG eller GIF (maks 5MB)
                </p>
                {error && (
                    <p className="text-xs mt-1" style={{ color: '#ef4444' }}>
                        {error}
                    </p>
                )}
            </div>
        </div>
    );
}
