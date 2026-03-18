export const MAX_PROFILE_PICTURE_BYTES = 5 * 1024 * 1024;
export const ALLOWED_PROFILE_PICTURE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

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
