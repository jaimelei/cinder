import { supabase } from "./supabase";
import type { PandoraVideo } from "../types";

export async function getPandoraVideos(): Promise<PandoraVideo[]> {
    const { data, error } = await supabase
        .from("pandora_videos")
        .select("*")
        .order("upload_date", { ascending: false });

    if (error) throw error;
    return data ?? [];
}

export interface ImportPandoraParams {
    url: string;
    groupTag: string;
    memberTag: string | null;
}

export interface ImportPandoraResponse {
    imported: number;
    ids?: string[];
    error?: string;
}

export async function importPandoraVideos(
    params: ImportPandoraParams
): Promise<ImportPandoraResponse> {
    const res = await fetch("/api/pandora-import", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(params),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
        throw new Error(data.error || "Failed to import videos");
    }

    return data;
}
