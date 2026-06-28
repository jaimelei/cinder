import { supabase } from "./supabase";
import type { Collection, Video, VideoWithPosition } from "../types";

export async function getCollections(): Promise<Collection[]> {
    const { data, error } = await supabase
        .from("cinder_collections")
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
        .from("cinder_collections")
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
        .from("cinder_collection_videos")
        .select(`
      position,
      cinder_videos (*)
    `)
        .eq("collection_id", collectionId)
        .order("position", { ascending: true });

    if (error) {
        throw error;
    }

    return (data ?? []).map((row: any) => ({
        ...row.cinder_videos,
        position: row.position,
    }));
}

export async function searchVideos(
    query: string,
    collectionId?: string
): Promise<Video[]> {
    const pattern = `%${query}%`;

    if (collectionId) {
        const { data, error } = await supabase
            .from("cinder_collection_videos")
            .select("cinder_videos(*)")
            .eq("collection_id", collectionId)
            .or(
                `title.ilike.${pattern},channel_name.ilike.${pattern}`,
                {
                    referencedTable: "cinder_videos",
                }
            );

        if (error) {
            throw error;
        }

        return (data ?? []).map(
            (row: any) => row.cinder_videos
        );
    }

    const { data, error } = await supabase
        .from("cinder_videos")
        .select("*")
        .or(
            `title.ilike.${pattern},channel_name.ilike.${pattern}`
        )
        .limit(50);

    if (error) {
        throw error;
    }

    return data ?? [];
}