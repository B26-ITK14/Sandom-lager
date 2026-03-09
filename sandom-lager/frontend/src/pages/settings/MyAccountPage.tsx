/*
    * MyAccountPage.tsx
    * Account settings page for managing personal information, security, preferences, and account options.
    * Author: Emil Berglund
    TODO: Make components for each section (PersonalInfoCard, AccountDetailsCard, SecurityPrivacyCard) to clean up the main page and improve reusability.
*/


import { useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { 
    User, Mail, MapPin, Shield, 
    Key, Smartphone, Monitor,
    Camera, Save, X
} from 'lucide-react';
import SettingsLayout from "../../components/settings/SettingsLayout";
import { useUsername, useFirstName, useLastName, useUserRole } from '../../hooks';

export default function MyAccountPage() {
    const { user } = useAuth0();
    const username = useUsername();
    const firstName = useFirstName();
    const lastName = useLastName();
    const { role } = useUserRole();

    // Personal Information state
    const [isEditingPersonal, setIsEditingPersonal] = useState(false);
    const [editedFirstName, setEditedFirstName] = useState(firstName);
    const [editedLastName, setEditedLastName] = useState(lastName);
    const [editedUsername, setEditedUsername] = useState(username);
    const [editedLocation, setEditedLocation] = useState('Tomasgården, Kornsjø');

    const email = user?.email ?? 'ukjent@epost.no';
    const memberSince = user?.updated_at
        ? new Date(user.updated_at).toLocaleDateString('nb-NO', { month: 'long', year: 'numeric' })
        : 'ukjent';

    const handleSavePersonalInfo = () => {
        // TODO: Implement API call to save personal information
        console.log('Saving:', { editedFirstName, editedLastName, editedUsername, editedLocation });
        setIsEditingPersonal(false);
    };

    const handleCancelEdit = () => {
        setEditedFirstName(firstName);
        setEditedLastName(lastName);
        setEditedUsername(username);
        setEditedLocation('Tomasgården, Kornsjø');
        setIsEditingPersonal(false);
    };

    return (
        <SettingsLayout title="Min konto">
            <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(340px,38%)] lg:items-stretch">
                {/* Personal Information Section */}
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
                        {!isEditingPersonal ? (
                            <button
                                onClick={() => setIsEditingPersonal(true)}
                                className="px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer"
                                style={{ 
                                    backgroundColor: 'var(--color-primary)',
                                    color: 'var(--color-surface)'
                                }}
                            >
                                Rediger
                            </button>
                        ) : (
                            <div className="flex gap-2">
                                <button
                                    onClick={handleCancelEdit}
                                    className="p-2 rounded-lg transition-colors cursor-pointer"
                                    style={{ backgroundColor: 'var(--color-background)' }}
                                >
                                    <X size={20} style={{ color: 'var(--color-text-secondary)' }} />
                                </button>
                                <button
                                    onClick={handleSavePersonalInfo}
                                    className="px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 cursor-pointer"
                                    style={{ 
                                        backgroundColor: 'var(--color-primary)',
                                        color: 'var(--color-surface)'
                                    }}
                                >
                                    <Save size={16} />
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
                                {isEditingPersonal && (
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

                        {/* Name Fields */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                                    Fornavn
                                </label>
                                {isEditingPersonal ? (
                                    <input
                                        type="text"
                                        value={editedFirstName}
                                        onChange={(e) => setEditedFirstName(e.target.value)}
                                        className="w-full px-4 py-2 rounded-lg"
                                        style={{ 
                                            backgroundColor: 'var(--color-background)',
                                            color: 'var(--color-text-primary)',
                                            border: '1px solid var(--color-border)'
                                        }}
                                    />
                                ) : (
                                    <p className="px-4 py-2" style={{ color: 'var(--color-text-secondary)' }}>
                                        {firstName}
                                    </p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                                    Etternavn
                                </label>
                                {isEditingPersonal ? (
                                    <input
                                        type="text"
                                        value={editedLastName}
                                        onChange={(e) => setEditedLastName(e.target.value)}
                                        className="w-full px-4 py-2 rounded-lg"
                                        style={{ 
                                            backgroundColor: 'var(--color-background)',
                                            color: 'var(--color-text-primary)',
                                            border: '1px solid var(--color-border)'
                                        }}
                                    />
                                ) : (
                                    <p className="px-4 py-2" style={{ color: 'var(--color-text-secondary)' }}>
                                        {lastName}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Username */}
                        <div>
                            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                                Brukernavn
                            </label>
                            {isEditingPersonal ? (
                                <input
                                    type="text"
                                    value={editedUsername}
                                    onChange={(e) => setEditedUsername(e.target.value)}
                                    className="w-full px-4 py-2 rounded-lg"
                                    style={{ 
                                        backgroundColor: 'var(--color-background)',
                                        color: 'var(--color-text-primary)',
                                        border: '1px solid var(--color-border)'
                                    }}
                                />
                            ) : (
                                <p className="px-4 py-2" style={{ color: 'var(--color-text-secondary)' }}>
                                    {username}
                                </p>
                            )}
                        </div>

                        {/* Email (read-only) */}
                        <div>
                            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                                <div className="flex items-center gap-2">
                                    <Mail size={16} />
                                    E-post
                                </div>
                            </label>
                            <p className="px-4 py-2" style={{ color: 'var(--color-text-secondary)' }}>
                                {email}
                            </p>
                            <p className="text-xs mt-1 px-4" style={{ color: 'var(--color-text-secondary)' }}>
                                E-postadressen administreres av Auth0
                            </p>
                        </div>

                        {/* Location */}
                        <div>
                            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                                <div className="flex items-center gap-2">
                                    <MapPin size={16} />
                                    Plassering
                                </div>
                            </label>
                            {isEditingPersonal ? (
                                <input
                                    type="text"
                                    value={editedLocation}
                                    onChange={(e) => setEditedLocation(e.target.value)}
                                    className="w-full px-4 py-2 rounded-lg"
                                    style={{ 
                                        backgroundColor: 'var(--color-background)',
                                        color: 'var(--color-text-primary)',
                                        border: '1px solid var(--color-border)'
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

                {/* Account Details Section */}
                <section 
                    className="rounded-2xl p-6 lg:col-start-2 lg:row-start-1"
                    style={{ backgroundColor: 'var(--color-surface)' }}
                >
                    <div className="flex items-center gap-3 mb-6">
                        <Shield size={24} style={{ color: 'var(--color-primary)' }} />
                        <h3 
                            className="text-xl font-semibold"
                            style={{ color: 'var(--color-text-primary)' }}
                        >
                            Kontodetaljer
                        </h3>
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Rolle</span>
                            <span 
                                className="px-3 py-1 rounded-full text-sm font-medium capitalize"
                                style={{ backgroundColor: 'var(--color-background)', color: 'var(--color-primary)' }}
                            >
                                {role || 'user'}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Medlem siden</span>
                            <span className="text-sm" style={{ color: 'var(--color-text-primary)' }}>{memberSince}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Status</span>
                            <span className="flex items-center gap-2 text-sm" style={{ color: 'var(--color-text-primary)' }}>
                                <span className="w-2 h-2 rounded-full bg-green-500" />
                                Aktiv
                            </span>
                        </div>
                    </div>
                </section>

                {/* Security & Privacy Section */}
                <section 
                    className="rounded-2xl p-6 lg:col-start-2 lg:row-start-2"
                    style={{ backgroundColor: 'var(--color-surface)' }}
                >
                    <div className="flex items-center gap-3 mb-6">
                        <Key size={24} style={{ color: 'var(--color-primary)' }} />
                        <h3 
                            className="text-xl font-semibold"
                            style={{ color: 'var(--color-text-primary)' }}
                        >
                            Sikkerhet og personvern
                        </h3>
                    </div>

                    <div className="space-y-4">
                        <button
                            className="w-full flex items-center justify-between p-4 rounded-lg transition-colors"
                            style={{ backgroundColor: 'var(--color-background)' }}
                        >
                            <div className="flex items-center gap-3">
                                <Key size={20} style={{ color: 'var(--color-text-secondary)' }} />
                                <div className="text-left">
                                    <p className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                                        Endre passord
                                    </p>
                                    <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                                        Administrer passordet ditt via Auth0
                                    </p>
                                </div>
                            </div>
                            <span style={{ color: 'var(--color-text-secondary)' }}>→</span>
                        </button>

                        <button
                            className="w-full flex items-center justify-between p-4 rounded-lg transition-colors"
                            style={{ backgroundColor: 'var(--color-background)' }}
                        >
                            <div className="flex items-center gap-3">
                                <Smartphone size={20} style={{ color: 'var(--color-text-secondary)' }} />
                                <div className="text-left">
                                    <p className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                                        Tofaktorautentisering
                                    </p>
                                    <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                                        Ikke aktivert
                                    </p>
                                </div>
                            </div>
                            <span style={{ color: 'var(--color-text-secondary)' }}>→</span>
                        </button>

                        <button
                            className="w-full flex items-center justify-between p-4 rounded-lg transition-colors"
                            style={{ backgroundColor: 'var(--color-background)' }}
                        >
                            <div className="flex items-center gap-3">
                                <Monitor size={20} style={{ color: 'var(--color-text-secondary)' }} />
                                <div className="text-left">
                                    <p className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                                        Aktive sesjoner
                                    </p>
                                    <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                                        Administrer påloggede enheter
                                    </p>
                                </div>
                            </div>
                            <span style={{ color: 'var(--color-text-secondary)' }}>→</span>
                        </button>
                    </div>
                </section>
            </div>
        </SettingsLayout>
    );
}
