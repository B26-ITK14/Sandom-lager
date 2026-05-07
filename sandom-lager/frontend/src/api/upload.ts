import { apiUrl } from "./client";

export async function uploadImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("image", file);

    const res = await fetch(apiUrl("/api/upload"), {
        method: "POST",
        body: formData,
    });

    const data = await res.json();
    return data.url;
}
