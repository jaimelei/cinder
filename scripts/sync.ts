/**
 * scripts/sync.ts
 *
 * Cinder sync pipeline — optimized.
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
    playlistItemId: string;
}

interface VideoDetail {
    youtubeId: string;
    title: string;
    description: string | null;
    channelName: string | null;
    channelId: string | null;
    duration: string | null;
    durationSeconds: number | null;
    thumbnailUrl: string | null;
    uploadDate: string | null;
}

interface SupabaseCollection {
    id: string;
    slug: string;
    video_count: number;
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
    if (!value) throw new Error(`Missing required environment variable: ${key}`);
    return value;
}

// ---------------------------------------------------------------------------
// OAuth
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
    if (!data.access_token) throw new Error("OAuth token refresh returned no access_token");
    return data.access_token;
}

// ---------------------------------------------------------------------------
// YouTube API helpers
// ---------------------------------------------------------------------------

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

        const res = await fetch(
            `https://www.googleapis.com/youtube/v3/playlistItems?${params}`,
            { headers: { Authorization: `Bearer ${accessToken}` } }
        );

        if (!res.ok) {
            const body = await res.text();
            if (res.status === 403) throw new Error(`YouTube API quota exceeded (403): ${body}`);
            throw new Error(`playlistItems fetch failed for ${playlistId} (${res.status}): ${body}`);
        }

        const data = (await res.json()) as {
            nextPageToken?: string;
            items?: Array<{
                id: string;
                snippet: { position: number };
                contentDetails: { videoId: string };
            }>;
        };

        for (const item of data.items ?? []) {
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

function parseDurationSeconds(iso: string): number | null {
    if (!iso) return null;
    const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return null;
    const h = parseInt(match[1] ?? "0", 10);
    const m = parseInt(match[2] ?? "0", 10);
    const s = parseInt(match[3] ?? "0", 10);
    return h * 3600 + m * 60 + s;
}

async function fetchVideoDetails(
    youtubeIds: string[],
    accessToken: string,
    apiKey: string
): Promise<Map<string, VideoDetail>> {
    const result = new Map<string, VideoDetail>();
    const BATCH = 50;

    // Fetch all batches in parallel
    await Promise.all(
        Array.from({ length: Math.ceil(youtubeIds.length / BATCH) }, (_, i) =>
            youtubeIds.slice(i * BATCH, (i + 1) * BATCH)
        ).map(async (batch) => {
            const params = new URLSearchParams({
                part: "snippet,contentDetails",
                id: batch.join(","),
                hl: "en",
                key: apiKey,
            });

            const res = await fetch(
                `https://www.googleapis.com/youtube/v3/videos?${params}`,
                { headers: { Authorization: `Bearer ${accessToken}` } }
            );

            if (!res.ok) {
                const body = await res.text();
                if (res.status === 403) throw new Error(`YouTube API quota exceeded (videos): ${body}`);
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
                const title = s.localized?.title || s.title;
                const description = s.localized?.description ?? s.description ?? null;
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
        })
    );

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
        if (error.code === "PGRST116") return null;
        throw new Error(`Supabase getCollection(${slug}): ${error.message}`);
    }
    return data as SupabaseCollection;
}

async function getCollectionVideos(
    supabase: SupabaseClient,
    collectionId: string
): Promise<SupabaseCollectionVideo[]> {
    const { data, error } = await supabase
        .from("collection_videos")
        .select("id, video_id, position, videos(youtube_id)")
        .eq("collection_id", collectionId);

    if (error) throw new Error(`Supabase getCollectionVideos: ${error.message}`);
    return (data ?? []) as SupabaseCollectionVideo[];
}

/** Batch upsert all video rows at once. Returns map of youtubeId → internal UUID. */
async function batchUpsertVideos(
    supabase: SupabaseClient,
    details: VideoDetail[]
): Promise<Map<string, string>> {
    const now = new Date().toISOString();
    const rows = details.map((d) => ({
        youtube_id: d.youtubeId,
        title: d.title,
        description: d.description,
        channel_name: d.channelName,
        channel_id: d.channelId,
        duration: d.duration,
        duration_seconds: d.durationSeconds,
        thumbnail_url: d.thumbnailUrl,
        upload_date: d.uploadDate,
        updated_at: now,
    }));

    const { data, error } = await supabase
        .from("videos")
        .upsert(rows, { onConflict: "youtube_id", ignoreDuplicates: false })
        .select("id, youtube_id");

    if (error || !data) throw new Error(`Supabase batchUpsertVideos: ${error?.message}`);

    const map = new Map<string, string>();
    for (const row of data as { id: string; youtube_id: string }[]) {
        map.set(row.youtube_id, row.id);
    }
    return map;
}

/** Batch upsert collection_video join rows. */
async function batchInsertCollectionVideos(
    supabase: SupabaseClient,
    rows: { collection_id: string; video_id: string; position: number }[]
): Promise<void> {
    if (rows.length === 0) return;
    const { error } = await supabase
        .from("collection_videos")
        .upsert(rows, { onConflict: "collection_id,video_id" });
    if (error) throw new Error(`Supabase batchInsertCollectionVideos: ${error.message}`);
}

/** Batch update positions. */
async function batchUpdatePositions(
    supabase: SupabaseClient,
    updates: { id: string; position: number }[]
): Promise<void> {
    if (updates.length === 0) return;
    await Promise.all(
        updates.map(({ id, position }) =>
            supabase.from("collection_videos").update({ position }).eq("id", id)
        )
    );
}

/** Batch remove collection_video rows. */
async function batchRemoveCollectionVideos(
    supabase: SupabaseClient,
    ids: string[]
): Promise<void> {
    if (ids.length === 0) return;
    const { error } = await supabase
        .from("collection_videos")
        .delete()
        .in("id", ids);
    if (error) throw new Error(`Supabase batchRemoveCollectionVideos: ${error.message}`);
}

/** Batch delete orphaned videos. */
async function batchDeleteOrphanedVideos(
    supabase: SupabaseClient,
    videoIds: string[]
): Promise<void> {
    if (videoIds.length === 0) return;

    // Find which of these video_ids still have references
    const { data, error } = await supabase
        .from("collection_videos")
        .select("video_id")
        .in("video_id", videoIds);

    if (error) throw new Error(`Supabase orphan check: ${error.message}`);

    const stillReferenced = new Set((data ?? []).map((r: { video_id: string }) => r.video_id));
    const toDelete = videoIds.filter((id) => !stillReferenced.has(id));

    if (toDelete.length === 0) return;

    const { error: delError } = await supabase
        .from("videos")
        .delete()
        .in("id", toDelete);

    if (delError) throw new Error(`Supabase batchDeleteOrphanedVideos: ${delError.message}`);
}

async function updateCollectionMeta(
    supabase: SupabaseClient,
    collectionId: string,
    videoCount: number
): Promise<void> {
    const { error } = await supabase
        .from("collections")
        .update({ video_count: videoCount, updated_at: new Date().toISOString() })
        .eq("id", collectionId);
    if (error) throw new Error(`Supabase updateCollectionMeta: ${error.message}`);
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
        const collection = await getCollection(supabase, slug);
        if (!collection) {
            result.error = `Collection "${slug}" not found in Supabase — skipping`;
            return result;
        }

        // Fetch playlist + existing state in parallel
        const [playlistItems, existingCVRows] = await Promise.all([
            fetchPlaylistItems(playlistId, accessToken, apiKey),
            getCollectionVideos(supabase, collection.id),
        ]);

        const youtubeIds = playlistItems.map((i) => i.youtubeId);
        const detailsMap = await fetchVideoDetails(youtubeIds, accessToken, apiKey);

        // Build lookup
        const existingByYoutubeId = new Map<string, SupabaseCollectionVideo>();
        for (const cv of existingCVRows) {
            const ytId = cv.videos?.[0]?.youtube_id;
            if (ytId) existingByYoutubeId.set(ytId, cv);
        }

        const incomingYoutubeIds = new Set(youtubeIds);

        // Filter out skipped videos
        const validItems = playlistItems.filter((item) => {
            if (!detailsMap.has(item.youtubeId)) {
                result.skipped++;
                return false;
            }
            return true;
        });

        // Batch upsert all video metadata at once
        const validDetails = validItems.map((item) => detailsMap.get(item.youtubeId)!);
        const videoIdMap = await batchUpsertVideos(supabase, validDetails);

        // Determine inserts and updates
        const toInsert: { collection_id: string; video_id: string; position: number }[] = [];
        const toUpdate: { id: string; position: number }[] = [];

        for (const item of validItems) {
            const videoId = videoIdMap.get(item.youtubeId);
            if (!videoId) continue;

            const existing = existingByYoutubeId.get(item.youtubeId);
            if (!existing) {
                toInsert.push({ collection_id: collection.id, video_id: videoId, position: item.position });
                result.inserted++;
            } else if (existing.position !== item.position) {
                toUpdate.push({ id: existing.id, position: item.position });
                result.updated++;
            }
        }

        // Determine removals
        const toRemoveIds: string[] = [];
        const toRemoveVideoIds: string[] = [];
        for (const [ytId, cv] of existingByYoutubeId.entries()) {
            if (!incomingYoutubeIds.has(ytId)) {
                toRemoveIds.push(cv.id);
                toRemoveVideoIds.push(cv.video_id);
                result.removed++;
            }
        }

        // Execute all writes in parallel
        await Promise.all([
            batchInsertCollectionVideos(supabase, toInsert),
            batchUpdatePositions(supabase, toUpdate),
            batchRemoveCollectionVideos(supabase, toRemoveIds),
        ]);

        // Clean up orphaned videos after removals
        if (toRemoveVideoIds.length > 0) {
            await batchDeleteOrphanedVideos(supabase, toRemoveVideoIds);
        }

        const { count } = await supabase
            .from("collection_videos")
            .select("id", { count: "exact", head: true })
            .eq("collection_id", collection.id);

        await updateCollectionMeta(supabase, collection.id, count ?? 0);
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

    const supabaseUrl = requireEnv("SUPABASE_URL");
    const supabaseKey = requireEnv("SUPABASE_SERVICE_ROLE_KEY");
    const apiKey = requireEnv("YOUTUBE_API_KEY");
    const clientId = requireEnv("GOOGLE_CLIENT_ID");
    const clientSecret = requireEnv("GOOGLE_CLIENT_SECRET");
    const refreshToken = requireEnv("GOOGLE_REFRESH_TOKEN");

    const supabase = createClient(supabaseUrl, supabaseKey, {
        auth: { persistSession: false },
    });

    console.log("obtaining oauth access token...");
    let accessToken: string;
    try {
        accessToken = await getAccessToken(clientId, clientSecret, refreshToken);
        console.log("access token obtained\n");
    } catch (err) {
        console.error("fatal: could not obtain access token:", err);
        process.exit(1);
    }

    // Sync all collections in parallel
    console.log(`syncing ${PLAYLIST_MAP.length} collections in parallel...\n`);
    const results = await Promise.all(
        PLAYLIST_MAP.map(async ({ slug, playlistId }) => {
            const result = await syncCollection(supabase, slug, playlistId, accessToken, apiKey);
            if (result.error) {
                console.log(`${slug} ✗  ${result.error}`);
            } else {
                console.log(`${slug} ✓  +${result.inserted} inserted, -${result.removed} removed, ~${result.updated} repositioned, ${result.skipped} skipped`);
            }
            return result;
        })
    );

    // Summary
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
    process.exit(anyErrors ? 1 : 0);
}

main();