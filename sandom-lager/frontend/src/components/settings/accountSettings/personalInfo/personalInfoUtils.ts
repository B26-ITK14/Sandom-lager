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
    editedProfilePicture: File | null;
    displayProfilePicture: string | null;
    getAccessTokenSilently: () => Promise<string>;
    onSave: (data: SaveData) => Promise<void>;
    onProfilePictureSave: (profilePicture: string | null) => void;
    requestEmailChangeFn: (email: string, accessToken: string) => Promise<void>;
    updateProfilePictureFn: (file: File, accessToken: string) => Promise<string | null>;
    setDisplayEmail: (value: string) => void;
    setDisplayProfilePicture: (value: string | null) => void;
    setEditedProfilePicture: (value: File | null) => void;
    setEmailError: (value: string) => void;
    setNameError: (value: string) => void;
    setUsernameError: (value: string) => void;
    setProfilePictureError: (value: string) => void;
    setIsSaving: (value: boolean) => void;
    setIsEditing: (value: boolean) => void;
};

export type SaveResult = {
    status: 'success' | 'error' | 'noop';
    message: string;
};

type CancelHandlerDeps = {
    name: string;
    username: string;
    location: string;
    displayEmail: string;
    setEditedName: (value: string) => void;
    setEditedUsername: (value: string) => void;
    setEditedLocation: (value: string) => void;
    setEditedProfilePicture: (value: File | null) => void;
    setEditedEmail: (value: string) => void;
    setEmailError: (value: string) => void;
    setNameError: (value: string) => void;
    setUsernameError: (value: string) => void;
    setProfilePictureError: (value: string) => void;
    setIsEditing: (value: boolean) => void;
};

type ProfilePictureChangeDeps = {
    setEditedProfilePicture: (value: File | null) => void;
    setProfilePictureError: (value: string) => void;
};

function promptCredentialManagers(identifier: { username: string; email: string }): void {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;

    const usernameValue = identifier.username.trim();
    const emailValue = identifier.email.trim();
    if (!usernameValue && !emailValue) return;

    const form = document.createElement('form');
    form.setAttribute('autocomplete', 'on');
    form.style.position = 'fixed';
    form.style.left = '-9999px';
    form.style.top = '0';
    form.style.width = '1px';
    form.style.height = '1px';
    form.style.opacity = '0';

    const usernameInput = document.createElement('input');
    usernameInput.type = 'text';
    usernameInput.name = 'username';
    usernameInput.autocomplete = 'username';
    usernameInput.value = usernameValue || emailValue;

    const emailInput = document.createElement('input');
    emailInput.type = 'email';
    emailInput.name = 'email';
    emailInput.autocomplete = 'email';
    emailInput.value = emailValue;

    const submitButton = document.createElement('button');
    submitButton.type = 'submit';

    form.addEventListener('submit', (event) => {
        event.preventDefault();
    });

    form.appendChild(usernameInput);
    form.appendChild(emailInput);
    form.appendChild(submitButton);
    document.body.appendChild(form);

    usernameInput.dispatchEvent(new Event('input', { bubbles: true }));
    usernameInput.dispatchEvent(new Event('change', { bubbles: true }));
    emailInput.dispatchEvent(new Event('input', { bubbles: true }));
    emailInput.dispatchEvent(new Event('change', { bubbles: true }));

    if (typeof form.requestSubmit === 'function') {
        form.requestSubmit(submitButton);
    } else {
        submitButton.click();
    }

    window.setTimeout(() => {
        form.remove();
    }, 0);
}

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

    // Store the File object directly - preview will use URL.createObjectURL
    deps.setEditedProfilePicture(file);
    deps.setProfilePictureError('');
}

export async function handleSave(deps: SaveHandlerDeps): Promise<SaveResult> {
    const emailChanged = deps.isPasswordUser && deps.editedEmail.trim() !== deps.displayEmail && deps.editedEmail.trim() !== '';
    const nameChanged = deps.editedName.trim() !== deps.name.trim();
    const usernameChanged = deps.editedUsername.trim() !== deps.username.trim();
    const locationChanged = deps.editedLocation.trim() !== deps.location.trim();
    const profilePictureChanged = deps.editedProfilePicture !== null;
    const profileChanged = nameChanged || usernameChanged || locationChanged;

    if (!emailChanged && !profileChanged && !profilePictureChanged) {
        deps.setIsEditing(false);
        return { status: 'noop', message: '' };
    }

    deps.setEmailError('');
    deps.setNameError('');
    deps.setUsernameError('');
    deps.setProfilePictureError('');
    deps.setIsSaving(true);

    let emailOk = true;
    let nameOk = true;
    let profilePictureOk = true;
    let firstErrorMessage = '';
    const successParts: string[] = [];

    if (emailChanged) {
        try {
            const token = await deps.getAccessTokenSilently();
            await deps.requestEmailChangeFn(deps.editedEmail.trim(), token);
            deps.setDisplayEmail(deps.editedEmail.trim());
            successParts.push('E-post oppdatert');
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Kunne ikke oppdatere e-post';
            deps.setEmailError(message);
            if (!firstErrorMessage) firstErrorMessage = message;
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
            if (!firstErrorMessage) firstErrorMessage = message;
            nameOk = false;
        }
        if (nameOk) {
            successParts.push('Profilinformasjon oppdatert');
        }
    }

    if (profilePictureChanged && deps.editedProfilePicture) {
        try {
            console.log('[PersonalInfo.handleSave] profile picture upload start', {
                name: deps.editedProfilePicture.name,
                type: deps.editedProfilePicture.type,
                size: deps.editedProfilePicture.size,
            });
            const token = await deps.getAccessTokenSilently();
            console.log('[PersonalInfo.handleSave] token acquired for profile picture upload');
            const savedProfilePicture = await deps.updateProfilePictureFn(deps.editedProfilePicture, token);
            console.log('[PersonalInfo.handleSave] profile picture upload success', {
                hasUrl: Boolean(savedProfilePicture),
            });
            deps.setDisplayProfilePicture(savedProfilePicture);
            deps.setEditedProfilePicture(null);
            deps.onProfilePictureSave(savedProfilePicture);
            successParts.push('Profilbilde oppdatert');
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Kunne ikke oppdatere profilbildet';
            console.error('[PersonalInfo.handleSave] profile picture upload failed:', err);
            deps.setProfilePictureError(message);
            if (!firstErrorMessage) firstErrorMessage = message;
            profilePictureOk = false;
        }
    }

    if (emailOk && nameOk && (emailChanged || usernameChanged)) {
        promptCredentialManagers({
            username: deps.editedUsername,
            email: deps.editedEmail,
        });
    }

    deps.setIsSaving(false);
    if (emailOk && nameOk && profilePictureOk) {
        console.log('[PersonalInfo.handleSave] completed with success');
        deps.setIsEditing(false);
        return {
            status: 'success',
            message: successParts.length > 0 ? successParts.join(' • ') : 'Endringer lagret',
        };
    }

    console.warn('[PersonalInfo.handleSave] completed with errors', {
        emailOk,
        nameOk,
        profilePictureOk,
        firstErrorMessage,
    });

    return {
        status: 'error',
        message: firstErrorMessage || 'Kunne ikke lagre endringene',
    };
}

export function handleCancel(deps: CancelHandlerDeps): void {
    deps.setEditedName(deps.name);
    deps.setEditedUsername(deps.username);
    deps.setEditedLocation(deps.location);
    deps.setEditedProfilePicture(null);
    deps.setEditedEmail(deps.displayEmail);
    deps.setEmailError('');
    deps.setNameError('');
    deps.setUsernameError('');
    deps.setProfilePictureError('');
    deps.setIsEditing(false);
}
