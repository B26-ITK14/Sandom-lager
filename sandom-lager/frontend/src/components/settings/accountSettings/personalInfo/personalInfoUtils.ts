/*
    * personalInfoUtils.ts
    * Utility functions for handling personal information updates, such as validating and processing profile picture changes, and handling save/cancel actions for the PersonalInfoCard component.
    * Author: Emil Berglund
*/


export const MAX_PROFILE_PICTURE_BYTES = 5 * 1024 * 1024;
export const ALLOWED_PROFILE_PICTURE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

import type { ChangeEvent } from 'react';

type SaveData = { name: string; username: string; location: string };

type SaveHandlerDeps = {
    isPasswordUser: boolean;
    editedEmail: string;
    displayEmail: string;
    editedName: string;
    name: string;
    editedUsername: string;
    username: string;
    editedLocation: string;
    location: string;
    editedProfilePicture: string | null;
    displayProfilePicture: string | null;
    getAccessTokenSilently: () => Promise<string>;
    onSave: (data: SaveData) => Promise<void>;
    onProfilePictureSave: (profilePicture: string | null) => void;
    requestEmailChangeFn: (email: string, accessToken: string) => Promise<void>;
    updateProfilePictureFn: (profilePicture: string, accessToken: string) => Promise<string | null>;
    setDisplayEmail: (value: string) => void;
    setDisplayProfilePicture: (value: string | null) => void;
    setEditedProfilePicture: (value: string | null) => void;
    setEmailError: (value: string) => void;
    setNameError: (value: string) => void;
    setUsernameError: (value: string) => void;
    setProfilePictureError: (value: string) => void;
    setIsSaving: (value: boolean) => void;
    setIsEditing: (value: boolean) => void;
};

type CancelHandlerDeps = {
    name: string;
    username: string;
    location: string;
    displayProfilePicture: string | null;
    displayEmail: string;
    setEditedName: (value: string) => void;
    setEditedUsername: (value: string) => void;
    setEditedLocation: (value: string) => void;
    setEditedProfilePicture: (value: string | null) => void;
    setEditedEmail: (value: string) => void;
    setEmailError: (value: string) => void;
    setNameError: (value: string) => void;
    setUsernameError: (value: string) => void;
    setProfilePictureError: (value: string) => void;
    setIsEditing: (value: boolean) => void;
};

type ProfilePictureChangeDeps = {
    setEditedProfilePicture: (value: string | null) => void;
    setProfilePictureError: (value: string) => void;
};

export function validateProfilePictureFile(file: File): string | null {
    if (!ALLOWED_PROFILE_PICTURE_TYPES.includes(file.type)) {
        return 'Kun JPG, PNG, GIF og WEBP er tillatt';
    }

    if (file.size > MAX_PROFILE_PICTURE_BYTES) {
        return 'Profilbildet kan maks være 5 MB';
    }

    return null;
}

export function readFileAsDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => {
            const result = typeof reader.result === 'string' ? reader.result : '';
            if (!result) {
                reject(new Error('Kunne ikke lese profilbildet'));
                return;
            }
            resolve(result);
        };

        reader.onerror = () => {
            reject(new Error('Kunne ikke lese profilbildet'));
        };

        reader.readAsDataURL(file);
    });
}

export function handleProfilePictureChange(
    event: ChangeEvent<HTMLInputElement>,
    deps: ProfilePictureChangeDeps,
): void {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) return;

    const validationError = validateProfilePictureFile(file);
    if (validationError) {
        deps.setProfilePictureError(validationError);
        return;
    }

    void readFileAsDataUrl(file)
        .then((result) => {
            deps.setEditedProfilePicture(result);
            deps.setProfilePictureError('');
        })
        .catch(() => {
            deps.setProfilePictureError('Kunne ikke lese profilbildet');
        });
}

export async function handleSave(deps: SaveHandlerDeps): Promise<void> {
    const emailChanged = deps.isPasswordUser && deps.editedEmail.trim() !== deps.displayEmail && deps.editedEmail.trim() !== '';
    const nameChanged = deps.editedName.trim() !== deps.name.trim();
    const usernameChanged = deps.editedUsername.trim() !== deps.username.trim();
    const locationChanged = deps.editedLocation.trim() !== deps.location.trim();
    const profilePictureChanged = deps.editedProfilePicture !== deps.displayProfilePicture;
    const profileChanged = nameChanged || usernameChanged || locationChanged;

    if (!emailChanged && !profileChanged && !profilePictureChanged) {
        deps.setIsEditing(false);
        return;
    }

    deps.setEmailError('');
    deps.setNameError('');
    deps.setUsernameError('');
    deps.setProfilePictureError('');
    deps.setIsSaving(true);

    let emailOk = true;
    let nameOk = true;
    let profilePictureOk = true;

    if (emailChanged) {
        try {
            const token = await deps.getAccessTokenSilently();
            await deps.requestEmailChangeFn(deps.editedEmail.trim(), token);
            deps.setDisplayEmail(deps.editedEmail.trim());
        } catch (err) {
            deps.setEmailError(err instanceof Error ? err.message : 'Kunne ikke oppdatere e-post');
            emailOk = false;
        }
    }

    if (profileChanged) {
        try {
            await deps.onSave({
                name: deps.editedName,
                username: deps.editedUsername,
                location: deps.editedLocation,
            });
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Kunne ikke oppdatere profil';
            if (message.toLowerCase().includes('brukernavn')) {
                deps.setUsernameError(message);
            } else {
                deps.setNameError(message);
            }
            nameOk = false;
        }
    }

    if (profilePictureChanged) {
        try {
            const token = await deps.getAccessTokenSilently();
            const savedProfilePicture = await deps.updateProfilePictureFn(deps.editedProfilePicture ?? '', token);
            deps.setDisplayProfilePicture(savedProfilePicture);
            deps.setEditedProfilePicture(savedProfilePicture);
            deps.onProfilePictureSave(savedProfilePicture);
        } catch (err) {
            deps.setProfilePictureError(err instanceof Error ? err.message : 'Kunne ikke oppdatere profilbildet');
            profilePictureOk = false;
        }
    }

    deps.setIsSaving(false);
    if (emailOk && nameOk && profilePictureOk) {
        deps.setIsEditing(false);
    }
}

export function handleCancel(deps: CancelHandlerDeps): void {
    deps.setEditedName(deps.name);
    deps.setEditedUsername(deps.username);
    deps.setEditedLocation(deps.location);
    deps.setEditedProfilePicture(deps.displayProfilePicture);
    deps.setEditedEmail(deps.displayEmail);
    deps.setEmailError('');
    deps.setNameError('');
    deps.setUsernameError('');
    deps.setProfilePictureError('');
    deps.setIsEditing(false);
}
