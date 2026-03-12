/*
    * PersonalInfoCard.tsx
    * Card component for displaying and editing personal information like name, username, email, and location.
    * Author: Emil Berglund
    TODO: Implement username editing and validation, location editing, and profile picture upload.
*/

import { useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { User, MapPin, Mail, Save, X, Loader2 } from 'lucide-react';
import { requestEmailChange } from '../../../api/user';
import ProfilePictureSection from './personalInfo/ProfilePictureSection';
import EditableField from './personalInfo/EditableField';
import EmailField from './personalInfo/EmailField';

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
                        onClick={() => { setEditedName(name); setEditedUsername(username); setEditedLocation(location); setEditedEmail(displayEmail); setIsEditing(true); }}
                        className="px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer"
                        style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-surface)' }}
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
                            style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-surface)' }}
                        >
                            {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                            Lagre
                        </button>
                    </div>
                )}
            </div>

            <div className="space-y-4">
                <ProfilePictureSection isEditing={isEditing} />

                <EditableField
                    label="Navn"
                    value={name}
                    editedValue={editedName}
                    onChange={(v) => { setEditedName(v); setNameError(''); }}
                    isEditing={isEditing}
                    error={nameError}
                />

                <EditableField
                    label="Brukernavn"
                    value={username}
                    editedValue={editedUsername}
                    onChange={setEditedUsername}
                    isEditing={isEditing}
                />

                <EmailField
                    label={<div className="flex items-center gap-2"><Mail size={16} />E-post</div>}
                    displayEmail={displayEmail}
                    editedEmail={editedEmail}
                    onChange={setEditedEmail}
                    isEditing={isEditing}
                    isPasswordUser={isPasswordUser}
                    originalEmail={email}
                    error={emailError}
                />

                <EditableField
                    label={<div className="flex items-center gap-2"><MapPin size={16} />Plassering</div>}
                    value={editedLocation}
                    editedValue={editedLocation}
                    onChange={setEditedLocation}
                    isEditing={isEditing}
                />
            </div>
        </section>
    );
}
