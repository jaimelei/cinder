// === database row types ===

export interface Collection {
    id: string;
    slug: string;
    name: string;
    description: string | null;
    youtube_playlist_id: string;
    sort_order: number;
    video_count: number;
    created_at: string;
    updated_at: string;
}

export interface Video {
    id: string;
    youtube_id: string;
    title: string;
    description: string | null;
    channel_name: string | null;
    channel_id: string | null;
    duration: string | null;
    duration_seconds: number | null;
    thumbnail_url: string | null;
    upload_date: string | null;
    created_at: string;
    updated_at: string;
}

export interface CollectionVideo {
    id: string;
    collection_id: string;
    video_id: string;
    position: number;
    created_at: string;
}

// === derived ui types ===

export interface VideoWithPosition extends Video {
    position: number;
}

export interface PlayerState {
    video: Video | null;
    collectionSlug: string | null;
    isMinimized: boolean;
}

export interface CollectionMeta {
    slug: string;
    name: string;
    tagline: string;
    accentColor: string;
    glowColor: string;
}