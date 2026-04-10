/*
    * ImageUpload.tsx
    * Component for uploading images to the server and displaying a preview.
    * Props:
    * - onUpload: function that receives the URL of the uploaded image
    * Usage:
    * <ImageUpload onUpload={(url) => saveUrlToDatabase(url)} /> />
*/

import { useState } from "react";

export default function ImageUpload({ onUpload }: { onUpload: (url: string) => void }) {
    const [preview, setPreview] = useState<string | null>(null);

    const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setPreview(URL.createObjectURL(file));

        const formData = new FormData();
        formData.append("image", file);

        const res = await fetch("/api/upload", {
            method: "POST",
            body: formData,
        });

        const data = await res.json();
        onUpload(data.url); // pass URL up to parent
    };

    return (
        <div>
            <input type="file" accept="image/*" onChange={handleChange} />
            {preview && <img src={preview} alt="Preview" width={200} />}
        </div>
    );
}