import { supabase } from "./supabase";
import type { Collection, VideoWithPosition } from "../types";

export async function getCollections(): Promise<Collection[]> {
    const { data, error } = await supabase
        .from("collections")
        .select("*")
        .order("sort_order", { ascending: true });

    if (error) {
        throw error;
    }

    return data ?? [];
}

export async function getCollectionBySlug(
    slug: string
): Promise<Collection | null> {
    const { data, error } = await supabase
        .from("collections")
        .select("*")
        .eq("slug", slug)
        .single();

    if (error) {
        throw error;
    }

    return data;
}

export async function getCollectionVideos(
    collectionId: string
): Promise<VideoWithPosition[]> {
    const { data, error } = await supabase
        .from("collection_videos")
        .select(`
      position,
      videos (*)
    `)
        .eq("collection_id", collectionId)
        .order("position", { ascending: true });

    if (error) {
        throw error;
    }

    return (data ?? []).map((row: any) => ({
        ...row.videos,
        position: row.position,
    }));
}