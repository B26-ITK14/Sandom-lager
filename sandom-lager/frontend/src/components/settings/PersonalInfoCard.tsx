/*
    * PersonalInfoCard.tsx
    * Card component for displaying and editing personal information like name, username, email, and location.
    * Author: Emil Berglund
    TODO: Split into smaller components (e.g. ProfilePictureUploader, EditableField) for better separation of concerns and reusability.
*/

import { useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { User, Mail, MapPin, Camera, Save, X, Loader2 } from 'lucide-react';
import { requestEmailChange } from '../../api/user';

interface PersonalInfoCardProps {
    name: string;
    username: string;
    email: string;
    location?: string;
    onSave: (data: { name: string; username: string; location: string }) => Promise<void>;
}

export default function PersonalInfoCard({
    name,
    username,
    email,
    location = 'N/A',
    onSave,
}: PersonalInfoCardProps) {
    const { getAccessTokenSilently, user: authUser } = useAuth0();
    const isPasswordUser = authUser?.sub?.startsWith('auth0|') ?? false;

    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [editedName, setEditedName] = useState(name);
    const [editedUsername, setEditedUsername] = useState(username);
    const [editedLocation, setEditedLocation] = useState(location);

    const [displayEmail, setDisplayEmail] = useState(email);
    const [editedEmail, setEditedEmail] = useState(email);
    const [emailError, setEmailError] = useState('');
    const [nameError, setNameError] = useState('');

    const handleSave = async () => {
        const emailChanged = isPasswordUser && editedEmail.trim() !== displayEmail && editedEmail.trim() !== '';
        const nameChanged = editedName.trim() !== name.trim();
        const usernameChanged = editedUsername.trim() !== username.trim();
        const locationChanged = editedLocation.trim() !== location.trim();
        const profileChanged = nameChanged || usernameChanged || locationChanged;

        // Nothing changed — close without any API calls
        if (!emailChanged && !profileChanged) {
            setIsEditing(false);
            return;
        }

        setEmailError('');
        setNameError('');
        setIsSaving(true);

        let emailOk = true;
        let nameOk = true;

        if (emailChanged) {
            try {
                const token = await getAccessTokenSilently();
                await requestEmailChange(editedEmail.trim(), token);
                setDisplayEmail(editedEmail.trim());
            } catch (err) {
                setEmailError(err instanceof Error ? err.message : 'Kunne ikke oppdatere e-post');
                emailOk = false;
            }
        }

        if (profileChanged) {
            try {
                await onSave({ name: editedName, username: editedUsername, location: editedLocation });
            } catch (err) {
                setNameError(err instanceof Error ? err.message : 'Kunne ikke oppdatere navn');
                nameOk = false;
            }
        }

        setIsSaving(false);
        if (emailOk && nameOk) setIsEditing(false);
    };

    const handleCancel = () => {
        setEditedName(name);
        setEditedUsername(username);
        setEditedLocation(location);
        setEditedEmail(displayEmail);
        setEmailError('');
        setNameError('');
        setIsEditing(false);
    };

    return (
        <section
            className="rounded-2xl p-6 lg:col-start-1 lg:row-start-1 lg:row-span-2 lg:h-full"
            style={{ backgroundColor: 'var(--color-surface)' }}
        >
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <User size={24} style={{ color: 'var(--color-primary)' }} />
                    <h3
                        className="text-xl font-semibold"
                        style={{ color: 'var(--color-text-primary)' }}
                    >
                        Personlig informasjon
                    </h3>
                </div>
                {!isEditing ? (
                    <button
                        onClick={() => { setEditedEmail(displayEmail); setIsEditing(true); }}
                        className="px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer"
                        style={{
                            backgroundColor: 'var(--color-primary)',
                            color: 'var(--color-surface)',
                        }}
                    >
                        Rediger
                    </button>
                ) : (
                    <div className="flex gap-2">
                        <button
                            onClick={handleCancel}
                            className="p-2 rounded-lg transition-colors cursor-pointer"
                            style={{ backgroundColor: 'var(--color-background)' }}
                        >
                            <X size={20} style={{ color: 'var(--color-text-secondary)' }} />
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-70"
                            style={{
                                backgroundColor: 'var(--color-primary)',
                                color: 'var(--color-surface)',
                            }}
                        >
                            {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                            Lagre
                        </button>
                    </div>
                )}
            </div>

            <div className="space-y-4">
                {/* Profile Picture */}
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

                {/* Name */}
                <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                        Navn
                    </label>
                    {isEditing ? (
                        <>
                            <input
                                type="text"
                                value={editedName}
                                onChange={(e) => { setEditedName(e.target.value); setNameError(''); }}
                                className="w-full px-4 py-2 rounded-lg"
                                style={{
                                    backgroundColor: 'var(--color-background)',
                                    color: 'var(--color-text-primary)',
                                    border: nameError ? '1px solid #ef4444' : '1px solid var(--color-border)',
                                }}
                            />
                            {nameError && (
                                <p className="text-xs mt-1 px-1" style={{ color: '#ef4444' }}>{nameError}</p>
                            )}
                        </>
                    ) : (
                        <p className="px-4 py-2" style={{ color: 'var(--color-text-secondary)' }}>
                            {name}
                        </p>
                    )}
                </div>

                {/* Username */}
                <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                        Brukernavn
                    </label>
                    {isEditing ? (
                        <input
                            type="text"
                            value={editedUsername}
                            onChange={(e) => setEditedUsername(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg"
                            style={{
                                backgroundColor: 'var(--color-background)',
                                color: 'var(--color-text-primary)',
                                border: '1px solid var(--color-border)',
                            }}
                        />
                    ) : (
                        <p className="px-4 py-2" style={{ color: 'var(--color-text-secondary)' }}>
                            {username}
                        </p>
                    )}
                </div>

                {/* Email */}
                <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                        <div className="flex items-center gap-2">
                            <Mail size={16} />
                            E-post
                        </div>
                    </label>
                    {isEditing && isPasswordUser ? (
                        <div>
                            <input
                                type="email"
                                value={editedEmail}
                                onChange={(e) => setEditedEmail(e.target.value)}
                                className="w-full px-4 py-2 rounded-lg"
                                style={{
                                    backgroundColor: 'var(--color-background)',
                                    color: 'var(--color-text-primary)',
                                    border: emailError ? '1px solid #ef4444' : '1px solid var(--color-border)',
                                }}
                            />
                            {emailError && (
                                <p className="text-xs mt-1 px-1" style={{ color: '#ef4444' }}>{emailError}</p>
                            )}
                        </div>
                    ) : (
                        <div>
                            <p className="px-4 py-2" style={{ color: 'var(--color-text-secondary)' }}>
                                {displayEmail}
                            </p>
                            {displayEmail !== email && (
                                <p className="text-xs px-4" style={{ color: '#f59e0b' }}>Ikke bekreftet – sjekk innboksen din</p>
                            )}
                            {!isPasswordUser && (
                                <p className="text-xs mt-1 px-4" style={{ color: 'var(--color-text-secondary)' }}>
                                    E-postadressen administreres av din innloggingsleverandør
                                </p>
                            )}
                        </div>
                    )}
                </div>

                {/* Location */}
                <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                        <div className="flex items-center gap-2">
                            <MapPin size={16} />
                            Plassering
                        </div>
                    </label>
                    {isEditing ? (
                        <input
                            type="text"
                            value={editedLocation}
                            onChange={(e) => setEditedLocation(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg"
                            style={{
                                backgroundColor: 'var(--color-background)',
                                color: 'var(--color-text-primary)',
                                border: '1px solid var(--color-border)',
                            }}
                        />
                    ) : (
                        <p className="px-4 py-2" style={{ color: 'var(--color-text-secondary)' }}>
                            {editedLocation}
                        </p>
                    )}
                </div>
            </div>
        </section>
    );
}
