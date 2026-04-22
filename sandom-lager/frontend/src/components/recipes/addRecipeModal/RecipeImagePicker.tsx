/*
    * RecipeImagePicker.tsx
    * Image upload section for the add/edit recipe form.
    * Shows a preview of the selected image, a button to pick a new file,
    * and a button to remove the current image.
    * Used by AddRecipeModal.tsx
*/

import { useRef } from "react";

interface RecipeImagePickerProps {
    imageUrl: string | null;
    imagePreview: string | null;
    imageFile: File | null;
    onFileChange: (file: File | null) => void;
    onRemove: () => void;
    style?: React.CSSProperties;
}

export default function RecipeImagePicker({ imageUrl, imagePreview, imageFile, onFileChange, onRemove, style }: RecipeImagePickerProps) {
    const imageInputRef = useRef<HTMLInputElement>(null);

    return (
        <div className="flex flex-col gap-2" style={style}>
            <span className="text-sm font-medium" style={{ color: "var(--color-text-secondary)" }}>
                Bilde
            </span>

            {(imagePreview || imageUrl) && (
                <img
                    src={imagePreview || imageUrl || undefined}
                    alt="Forhåndsvisning av oppskriftsbilde"
                    className="w-full h-36 object-cover rounded-lg"
                    style={{ border: "1px solid var(--color-border)" }}
                />
            )}

            <div className="flex flex-wrap items-center gap-2">
                <button
                    type="button"
                    onClick={() => imageInputRef.current?.click()}
                    className="rounded-lg px-3 py-2 text-sm font-medium cursor-pointer"
                    style={{
                        backgroundColor: "var(--color-secondary-surface)",
                        color: "var(--color-text-primary)",
                        border: "1px solid var(--color-border)",
                    }}
                >
                    {imagePreview || imageUrl ? "Bytt bilde" : "Legg til bilde"}
                </button>

                {(imageUrl || imagePreview || imageFile) && (
                    <button
                        type="button"
                        onClick={onRemove}
                        className="rounded-lg px-3 py-2 text-sm font-medium cursor-pointer"
                        style={{
                            backgroundColor: "rgba(239,68,68,0.1)",
                            color: "#ef4444",
                            border: "1px solid rgba(239,68,68,0.25)",
                        }}
                    >
                        Fjern bilde
                    </button>
                )}

                {imageFile && (
                    <span className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
                        {imageFile.name}
                    </span>
                )}
            </div>

            <input
                id="recipe-image"
                ref={imageInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                onChange={(e) => {
                    const nextFile = e.target.files?.[0] ?? null;
                    onFileChange(nextFile);
                    if (imageInputRef.current) imageInputRef.current.value = "";
                }}
                className="hidden"
            />
        </div>
    );
}
