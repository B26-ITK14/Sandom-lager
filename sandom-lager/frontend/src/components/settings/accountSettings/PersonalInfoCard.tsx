/*
    * PersonalInfoCard.tsx
    * Card component for displaying and editing personal information like name, username, email, and location.
    * Author: Emil Berglund
*/

import { useEffect, useState } from "react";
import type { ChangeEvent } from "react";
import type { FormEvent } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { User, Mail, Save, X, Loader2 } from "lucide-react";
import { requestEmailChange, updateProfilePicture } from "../../../api/user";
import {
    handleCancel as handleCancelUtil,
    handleProfilePictureChange as handleProfilePictureChangeUtil,
    handleSave as handleSaveUtil,
    type SaveResult,
} from "./personalInfo/personalInfoUtils";
import ProfilePictureSection from "./personalInfo/ProfilePictureSection";
import EditableField from "./personalInfo/EditableField";
import EmailField from "./personalInfo/EmailField";

interface PersonalInfoCardProps {
    name: string;
    username: string;
    email: string;
    profilePicture: string | null;
    location?: string;
    onProfilePictureSave: (profilePicture: string | null) => void;
    onSave: (data: {
        name: string;
        username: string;
        location: string;
    }) => Promise<void>;
}

export default function PersonalInfoCard({
    name,
    username,
    email,
    profilePicture,
    location = "N/A",
    onProfilePictureSave,
    onSave,
}: PersonalInfoCardProps) {
    const { getAccessTokenSilently, user: authUser } = useAuth0();
    const isPasswordUser = authUser?.sub?.startsWith("auth0|") ?? false;

    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [editedName, setEditedName] = useState(name);
    const [editedUsername, setEditedUsername] = useState(username);
    const [editedLocation, setEditedLocation] = useState(location);
    const [displayProfilePicture, setDisplayProfilePicture] =
        useState(profilePicture);
    const [editedProfilePicture, setEditedProfilePicture] =
        useState<File | null>(null);
    const [editedProfilePicturePreview, setEditedProfilePicturePreview] =
        useState<string | null>(null);

    const [displayEmail, setDisplayEmail] = useState(email);
    const [editedEmail, setEditedEmail] = useState(email);
    const [emailError, setEmailError] = useState("");
    const [nameError, setNameError] = useState("");
    const [usernameError, setUsernameError] = useState("");
    const [profilePictureError, setProfilePictureError] = useState("");
    const [saveFeedback, setSaveFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

    useEffect(() => {
        setDisplayProfilePicture(profilePicture);
    }, [profilePicture]);

    useEffect(() => {
        setEditedLocation(location);
    }, [location]);

    // Create preview URL when editedProfilePicture changes
    useEffect(() => {
        if (editedProfilePicture) {
            const url = URL.createObjectURL(editedProfilePicture);
            setEditedProfilePicturePreview(url);
            return () => URL.revokeObjectURL(url);
        } else {
            setEditedProfilePicturePreview(null);
        }
    }, [editedProfilePicture]);

    const handleProfilePictureChange = (event: ChangeEvent<HTMLInputElement>) => {
        handleProfilePictureChangeUtil(event, {
            setEditedProfilePicture,
            setProfilePictureError,
        });
    };

    const handleSave = async () => {
        const result: SaveResult = await handleSaveUtil({
            isPasswordUser,
            editedEmail,
            displayEmail,
            editedName,
            name,
            editedUsername,
            username,
            editedLocation,
            location,
            editedProfilePicture,
            displayProfilePicture,
            getAccessTokenSilently,
            onSave,
            onProfilePictureSave,
            requestEmailChangeFn: requestEmailChange,
            updateProfilePictureFn: updateProfilePicture,
            setDisplayEmail,
            setDisplayProfilePicture,
            setEditedProfilePicture,
            setEmailError,
            setNameError,
            setUsernameError,
            setProfilePictureError,
            setIsSaving,
            setIsEditing,
        });

        if (result.status === "success") {
            setSaveFeedback({ type: "success", message: result.message });
        }

        if (result.status === "error") {
            setSaveFeedback({ type: "error", message: result.message });
        }
    };

    const handleCancel = () => {
        handleCancelUtil({
            name,
            username,
            location,
            displayEmail,
            setEditedName,
            setEditedUsername,
            setEditedLocation,
            setEditedProfilePicture,
            setEditedEmail,
            setEmailError,
            setNameError,
            setUsernameError,
            setProfilePictureError,
            setIsEditing,
        });
        setSaveFeedback(null);
    };

    const handleFormSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        void handleSave();
    };

    return (
        <section
            className="rounded-2xl p-6 lg:col-start-1 lg:row-start-1 lg:row-span-2 lg:h-full"
            style={{ backgroundColor: "var(--color-surface)" }}
        >
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <User size={24} style={{ color: "var(--color-primary)" }} />
                    <h3
                        className="text-xl font-semibold"
                        style={{ color: "var(--color-text-primary)" }}
                    >
                        Personlig informasjon
                    </h3>
                </div>
                {!isEditing ? (
                    <button
                        type="button"
                        onClick={() => {
                            setEditedName(name);
                            setEditedUsername(username);
                            setEditedLocation(location);
                            setEditedEmail(displayEmail);
                            setSaveFeedback(null);
                            setIsEditing(true);
                        }}
                        className="px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer"
                        style={{
                            backgroundColor: "var(--color-primary)",
                            color: "var(--color-surface)",
                        }}
                    >
                        Rediger
                    </button>
                ) : (
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="p-2 rounded-lg transition-colors cursor-pointer"
                            style={{ backgroundColor: "var(--color-background)" }}
                        >
                            <X size={20} style={{ color: "var(--color-text-secondary)" }} />
                        </button>
                        <button
                            type="submit"
                            form="personal-info-form"
                            disabled={isSaving}
                            className="px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-70"
                            style={{
                                backgroundColor: "var(--color-primary)",
                                color: "var(--color-surface)",
                            }}
                        >
                            {isSaving ? (
                                <Loader2 size={16} className="animate-spin" />
                            ) : (
                                <Save size={16} />
                            )}
                            Lagre
                        </button>
                    </div>
                )}
            </div>

            <form id="personal-info-form" autoComplete="on" className="space-y-4" onSubmit={handleFormSubmit}>
                {saveFeedback && (
                    <p
                        className="text-sm rounded-lg px-3 py-2"
                        style={{
                            color: saveFeedback.type === "success" ? "#166534" : "#991b1b",
                            backgroundColor: saveFeedback.type === "success" ? "#dcfce7" : "#fee2e2",
                        }}
                    >
                        {saveFeedback.message}
                    </p>
                )}

                <ProfilePictureSection
                    imageSrc={editedProfilePicturePreview || displayProfilePicture}
                    isEditing={isEditing}
                    error={profilePictureError}
                    onFileChange={handleProfilePictureChange}
                />

                <EditableField
                    label="Navn"
                    value={name}
                    editedValue={editedName}
                    onChange={(v) => {
                        setEditedName(v);
                        setNameError("");
                    }}
                    isEditing={isEditing}
                    error={nameError}
                    inputName="name"
                    autoComplete="name"
                />

                <EditableField
                    label="Brukernavn"
                    value={username}
                    editedValue={editedUsername}
                    onChange={(v) => {
                        setEditedUsername(v);
                        setUsernameError("");
                    }}
                    isEditing={isEditing}
                    error={usernameError}
                    inputId="account-username"
                    inputName="username"
                    autoComplete="username"
                />

                <EmailField
                    label={
                        <div className="flex items-center gap-2">
                            <Mail size={16} />
                            E-post
                        </div>
                    }
                    displayEmail={displayEmail}
                    editedEmail={editedEmail}
                    onChange={setEditedEmail}
                    isEditing={isEditing}
                    isPasswordUser={isPasswordUser}
                    originalEmail={email}
                    error={emailError}
                    inputId="account-email"
                    inputName="email"
                    autoComplete="email"
                />

                <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                        Plassering
                    </label>
                    <p className="px-4 py-2" style={{ color: 'var(--color-text-secondary)' }}>
                        {location}
                    </p>
                </div>
            </form>
        </section>
    );
}
