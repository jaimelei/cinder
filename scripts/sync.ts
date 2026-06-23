/**
 * scripts/sync.ts
 *
 * Cinder sync pipeline.
 * Mirrors all 9 YouTube playlists into Supabase.
 *
 * Run locally:  npx tsx scripts/sync.ts
 * CI:           GitHub Actions (see .github/workflows/sync.yml)
 *
 * Required env vars:
 *   SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *   YOUTUBE_API_KEY
 *   GOOGLE_CLIENT_ID
 *   GOOGLE_CLIENT_SECRET
 *   GOOGLE_REFRESH_TOKEN
 */

import "dotenv/config";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { PLAYLIST_MAP } from "./config";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PlaylistItem {
    youtubeId: string;
    position: number;
    /** playlist item id — used only for logging */
    playlistItemId: string;
}

interface VideoDetail {
    youtubeId: string;
    title: string;
    description: string | null;
    channelName: string | null;
    channelId: string | null;
    duration: string | null;         // ISO 8601 e.g. "PT12M34S"
    durationSeconds: number | null;
    thumbnailUrl: string | null;
    uploadDate: string | null;       // ISO timestamp
}

interface SupabaseCollection {
    id: string;
    slug: string;
    video_count: number;
}

interface SupabaseVideo {
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
}

interface SupabaseCollectionVideo {
    id: string;
    video_id: string;
    position: number;
    videos: { youtube_id: string }[] | null;
}

interface CollectionSyncResult {
    slug: string;
    inserted: number;
    removed: number;
    updated: number;
    skipped: number;
    error: string | null;
}

// ---------------------------------------------------------------------------
// Env validation
// ---------------------------------------------------------------------------

function requireEnv(key: string): string {
    const value = process.env[key];
    if (!value) {
        throw new Error(`Missing required environment variable: ${key}`);
    }
    return value;
}

// ---------------------------------------------------------------------------
// OAuth — refresh access token
// ---------------------------------------------------------------------------

async function getAccessToken(
    clientId: string,
    clientSecret: string,
    refreshToken: string
): Promise<string> {
    const res = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
            client_id: clientId,
            client_secret: clientSecret,
            refresh_token: refreshToken,
            grant_type: "refresh_token",
        }),
    });

    if (!res.ok) {
        const body = await res.text();
        throw new Error(`OAuth token refresh failed (${res.status}): ${body}`);
    }

    const data = (await res.json()) as { access_token?: string };
    if (!data.access_token) {
        throw new Error("OAuth token refresh returned no access_token");
    }
    return data.access_token;
}

// ---------------------------------------------------------------------------
// YouTube API helpers
// ---------------------------------------------------------------------------

/**
 * Fetch all items from a playlist, paginating through nextPageToken.
 * Returns items in playlist order (position 0-based).
 */
async function fetchPlaylistItems(
    playlistId: string,
    accessToken: string,
    apiKey: string
): Promise<PlaylistItem[]> {
    const items: PlaylistItem[] = [];
    let pageToken: string | undefined;

    do {
        const params = new URLSearchParams({
            part: "snippet,contentDetails",
            playlistId,
            maxResults: "50",
            hl: "en",
            key: apiKey,
            ...(pageToken ? { pageToken } : {}),
        });

        const url = `https://www.googleapis.com/youtube/v3/playlistItems?${params}`;
        const res = await fetch(url, {
            headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (!res.ok) {
            const body = await res.text();
            // 403 likely means quota exhausted
            if (res.status === 403) {
                throw new Error(`YouTube API quota exceeded or forbidden (403): ${body}`);
            }
            throw new Error(
                `playlistItems fetch failed for ${playlistId} (${res.status}): ${body}`
            );
        }

        const data = (await res.json()) as {
            nextPageToken?: string;
            items?: Array<{
                id: string;
                snippet: { position: number };
                contentDetails: { videoId: string };
            }>;
        };

        const pageItems = data.items ?? [];
        for (const item of pageItems) {
            // Skip deleted / private videos (no videoId)
            if (!item.contentDetails?.videoId) continue;
            items.push({
                youtubeId: item.contentDetails.videoId,
                position: item.snippet.position,
                playlistItemId: item.id,
            });
        }

        pageToken = data.nextPageToken;
    } while (pageToken);

    return items;
}

/**
 * Convert an ISO 8601 duration string (e.g. "PT1H2M34S") to total seconds.
 */
function parseDurationSeconds(iso: string): number | null {
    if (!iso) return null;
    const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return null;
    const h = parseInt(match[1] ?? "0", 10);
    const m = parseInt(match[2] ?? "0", 10);
    const s = parseInt(match[3] ?? "0", 10);
    return h * 3600 + m * 60 + s;
}

/**
 * Fetch video details (snippet + contentDetails) in batches of 50.
 * Prefers English metadata via hl=en.
 */
async function fetchVideoDetails(
    youtubeIds: string[],
    accessToken: string,
    apiKey: string
): Promise<Map<string, VideoDetail>> {
    const result = new Map<string, VideoDetail>();
    const BATCH = 50;

    for (let i = 0; i < youtubeIds.length; i += BATCH) {
        const batch = youtubeIds.slice(i, i + BATCH);
        const params = new URLSearchParams({
            part: "snippet,contentDetails",
            id: batch.join(","),
            hl: "en",
            key: apiKey,
        });

        const url = `https://www.googleapis.com/youtube/v3/videos?${params}`;
        const res = await fetch(url, {
            headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (!res.ok) {
            const body = await res.text();
            if (res.status === 403) {
                throw new Error(`YouTube API quota exceeded (videos batch): ${body}`);
            }
            throw new Error(`videos fetch failed (${res.status}): ${body}`);
        }

        const data = (await res.json()) as {
            items?: Array<{
                id: string;
                snippet: {
                    title: string;
                    description: string;
                    channelTitle: string;
                    channelId: string;
                    publishedAt: string;
                    thumbnails: {
                        maxres?: { url: string };
                        standard?: { url: string };
                        high?: { url: string };
                        medium?: { url: string };
                        default?: { url: string };
                    };
                    localized?: { title?: string; description?: string };
                };
                contentDetails: { duration: string };
            }>;
        };

        for (const item of data.items ?? []) {
            const s = item.snippet;
            // Prefer localized English title if available, fall back to default
            const title = s.localized?.title || s.title;
            const description = s.localized?.description ?? s.description ?? null;

            // Best available thumbnail
            const thumb =
                s.thumbnails?.maxres?.url ??
                s.thumbnails?.standard?.url ??
                s.thumbnails?.high?.url ??
                s.thumbnails?.medium?.url ??
                s.thumbnails?.default?.url ??
                null;

            const isoDuration = item.contentDetails?.duration ?? null;

            result.set(item.id, {
                youtubeId: item.id,
                title,
                description,
                channelName: s.channelTitle ?? null,
                channelId: s.channelId ?? null,
                duration: isoDuration,
                durationSeconds: isoDuration ? parseDurationSeconds(isoDuration) : null,
                thumbnailUrl: thumb,
                uploadDate: s.publishedAt ?? null,
            });
        }
    }

    return result;
}

// ---------------------------------------------------------------------------
// Supabase helpers
// ---------------------------------------------------------------------------

async function getCollection(
    supabase: SupabaseClient,
    slug: string
): Promise<SupabaseCollection | null> {
    const { data, error } = await supabase
        .from("collections")
        .select("id, slug, video_count")
        .eq("slug", slug)
        .single();

    if (error) {
        if (error.code === "PGRST116") return null; // not found
        throw new Error(`Supabase getCollection(${slug}): ${error.message}`);
    }
    return data as SupabaseCollection;
}

/** Returns all collection_videos rows for a collection, joined with youtube_id. */
async function getCollectionVideos(
    supabase: SupabaseClient,
    collectionId: string
): Promise<SupabaseCollectionVideo[]> {
    const { data, error } = await supabase
        .from("collection_videos")
        .select("id, video_id, position, videos(youtube_id)")
        .eq("collection_id", collectionId);

    if (error) {
        throw new Error(`Supabase getCollectionVideos: ${error.message}`);
    }
    return (data ?? []) as SupabaseCollectionVideo[];
}

/** Upsert a video row. Returns the internal UUID. */
async function upsertVideo(
    supabase: SupabaseClient,
    detail: VideoDetail
): Promise<string> {
    const { data, error } = await supabase
        .from("videos")
        .upsert(
            {
                youtube_id: detail.youtubeId,
                title: detail.title,
                description: detail.description,
                channel_name: detail.channelName,
                channel_id: detail.channelId,
                duration: detail.duration,
                duration_seconds: detail.durationSeconds,
                thumbnail_url: detail.thumbnailUrl,
                upload_date: detail.uploadDate,
                updated_at: new Date().toISOString(),
            },
            { onConflict: "youtube_id", ignoreDuplicates: false }
        )
        .select("id")
        .single();

    if (error || !data) {
        throw new Error(
            `Supabase upsertVideo(${detail.youtubeId}): ${error?.message}`
        );
    }
    return (data as { id: string }).id;
}

/** Insert a collection_videos join row. Silently ignores duplicate (already exists). */
async function insertCollectionVideo(
    supabase: SupabaseClient,
    collectionId: string,
    videoId: string,
    position: number
): Promise<void> {
    const { error } = await supabase.from("collection_videos").upsert(
        { collection_id: collectionId, video_id: videoId, position },
        { onConflict: "collection_id,video_id" }
    );
    if (error) {
        throw new Error(`Supabase insertCollectionVideo: ${error.message}`);
    }
}

/** Update position of an existing collection_video row. */
async function updateCollectionVideoPosition(
    supabase: SupabaseClient,
    collectionVideoId: string,
    newPosition: number
): Promise<void> {
    const { error } = await supabase
        .from("collection_videos")
        .update({ position: newPosition })
        .eq("id", collectionVideoId);
    if (error) {
        throw new Error(
            `Supabase updateCollectionVideoPosition(${collectionVideoId}): ${error.message}`
        );
    }
}

/** Remove a collection_video row. */
async function removeCollectionVideo(
    supabase: SupabaseClient,
    collectionVideoId: string
): Promise<void> {
    const { error } = await supabase
        .from("collection_videos")
        .delete()
        .eq("id", collectionVideoId);
    if (error) {
        throw new Error(
            `Supabase removeCollectionVideo(${collectionVideoId}): ${error.message}`
        );
    }
}

/**
 * Delete a video row only if it no longer appears in any collection.
 * Safe to call after removing the collection_video join row.
 */
async function deleteOrphanedVideo(
    supabase: SupabaseClient,
    videoId: string
): Promise<void> {
    // Check remaining references
    const { count, error: countError } = await supabase
        .from("collection_videos")
        .select("id", { count: "exact", head: true })
        .eq("video_id", videoId);

    if (countError) {
        throw new Error(
            `Supabase orphan check(${videoId}): ${countError.message}`
        );
    }

    if ((count ?? 0) === 0) {
        const { error } = await supabase.from("videos").delete().eq("id", videoId);
        if (error) {
            throw new Error(`Supabase deleteVideo(${videoId}): ${error.message}`);
        }
    }
}

/** Update collection.video_count and .updated_at. */
async function updateCollectionMeta(
    supabase: SupabaseClient,
    collectionId: string,
    videoCount: number
): Promise<void> {
    const { error } = await supabase
        .from("collections")
        .update({
            video_count: videoCount,
            updated_at: new Date().toISOString(),
        })
        .eq("id", collectionId);
    if (error) {
        throw new Error(`Supabase updateCollectionMeta: ${error.message}`);
    }
}

// ---------------------------------------------------------------------------
// Per-collection sync
// ---------------------------------------------------------------------------

async function syncCollection(
    supabase: SupabaseClient,
    slug: string,
    playlistId: string,
    accessToken: string,
    apiKey: string
): Promise<CollectionSyncResult> {
    const result: CollectionSyncResult = {
        slug,
        inserted: 0,
        removed: 0,
        updated: 0,
        skipped: 0,
        error: null,
    };

    try {
        // 1. Resolve collection row
        const collection = await getCollection(supabase, slug);
        if (!collection) {
            result.error = `Collection "${slug}" not found in Supabase — skipping (run seed SQL first)`;
            return result;
        }

        // 2. Fetch playlist items from YouTube
        const playlistItems = await fetchPlaylistItems(
            playlistId,
            accessToken,
            apiKey
        );

        // 3. Fetch video details for all IDs in this playlist
        const youtubeIds = playlistItems.map((i) => i.youtubeId);
        const detailsMap = await fetchVideoDetails(youtubeIds, accessToken, apiKey);

        // 4. Get current state from Supabase
        const existingCVRows = await getCollectionVideos(supabase, collection.id);

        // Build lookup maps
        const existingByYoutubeId = new Map<string, SupabaseCollectionVideo>();
        for (const cv of existingCVRows) {
            const ytId = (cv.videos as { youtube_id: string } | null)?.youtube_id;
            if (ytId) existingByYoutubeId.set(ytId, cv);
        }

        const incomingYoutubeIds = new Set(youtubeIds);

        // 5. Process each incoming video
        for (const item of playlistItems) {
            const detail = detailsMap.get(item.youtubeId);
            if (!detail) {
                // Video was in playlist but YouTube returned no details
                // (private, deleted, region-locked at fetch time) — skip
                result.skipped++;
                continue;
            }

            // Upsert the video metadata row (insert or update)
            const videoId = await upsertVideo(supabase, detail);

            const existing = existingByYoutubeId.get(item.youtubeId);
            if (!existing) {
                // NEW video — add to collection
                await insertCollectionVideo(
                    supabase,
                    collection.id,
                    videoId,
                    item.position
                );
                result.inserted++;
            } else {
                // EXISTING video — update position if changed
                if (existing.position !== item.position) {
                    await updateCollectionVideoPosition(
                        supabase,
                        existing.id,
                        item.position
                    );
                    result.updated++;
                }
                // video metadata already upserted above
            }
        }

        // 6. Remove videos no longer in the YouTube playlist
        for (const [ytId, cv] of existingByYoutubeId.entries()) {
            if (!incomingYoutubeIds.has(ytId)) {
                await removeCollectionVideo(supabase, cv.id);
                await deleteOrphanedVideo(supabase, cv.video_id);
                result.removed++;
            }
        }

        // 7. Update collection metadata
        const finalCount = playlistItems.length - result.skipped + result.inserted - result.removed;
        // Simpler: just use the net size of what's actually in the playlist now
        const newVideoCount =
            existingCVRows.length +
            result.inserted -
            result.removed;

        await updateCollectionMeta(supabase, collection.id, newVideoCount);
    } catch (err) {
        result.error = err instanceof Error ? err.message : String(err);
    }

    return result;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
    console.log("cinder sync — starting\n");

    // Validate env
    const supabaseUrl = requireEnv("SUPABASE_URL");
    const supabaseKey = requireEnv("SUPABASE_SERVICE_ROLE_KEY");
    const apiKey = requireEnv("YOUTUBE_API_KEY");
    const clientId = requireEnv("GOOGLE_CLIENT_ID");
    const clientSecret = requireEnv("GOOGLE_CLIENT_SECRET");
    const refreshToken = requireEnv("GOOGLE_REFRESH_TOKEN");

    // Init Supabase with service role key (full write access)
    const supabase = createClient(supabaseUrl, supabaseKey, {
        auth: { persistSession: false },
    });

    // Obtain OAuth access token once for all playlists
    console.log("obtaining oauth access token...");
    let accessToken: string;
    try {
        accessToken = await getAccessToken(clientId, clientSecret, refreshToken);
        console.log("access token obtained\n");
    } catch (err) {
        console.error("fatal: could not obtain access token:", err);
        process.exit(1);
    }

    // Sync each collection sequentially
    // Sequential (not parallel) to be courteous with YouTube quota
    const results: CollectionSyncResult[] = [];

    for (const { slug, playlistId } of PLAYLIST_MAP) {
        process.stdout.write(`syncing ${slug}...`);
        const result = await syncCollection(
            supabase,
            slug,
            playlistId,
            accessToken,
            apiKey
        );
        results.push(result);

        if (result.error) {
            console.log(` ✗  error: ${result.error}`);
        } else {
            console.log(
                ` ✓  +${result.inserted} inserted, -${result.removed} removed, ~${result.updated} repositioned, ${result.skipped} skipped`
            );
        }
    }

    // Summary table
    console.log("\n--- sync summary ---");
    const colW = 14;
    console.log(
        "collection".padEnd(colW),
        "inserted".padStart(8),
        "removed".padStart(8),
        "updated".padStart(8),
        "skipped".padStart(8),
        "  status"
    );
    console.log("-".repeat(60));

    let anyErrors = false;
    for (const r of results) {
        const status = r.error ? "✗ error" : "✓ ok";
        console.log(
            r.slug.padEnd(colW),
            String(r.inserted).padStart(8),
            String(r.removed).padStart(8),
            String(r.updated).padStart(8),
            String(r.skipped).padStart(8),
            `  ${status}`
        );
        if (r.error) {
            console.log("  └─", r.error);
            anyErrors = true;
        }
    }

    console.log("\ncinder sync — complete");

    // Exit 1 if any collection had a hard error so GitHub Actions marks the run failed
    process.exit(anyErrors ? 1 : 0);
}

main();