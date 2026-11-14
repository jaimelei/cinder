import "dotenv/config";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

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

function parseDurationSeconds(iso: string | null): number | null {
    if (!iso) return null;
    const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return null;
    const h = parseInt(match[1] ?? "0", 10);
    const m = parseInt(match[2] ?? "0", 10);
    const s = parseInt(match[3] ?? "0", 10);
    return h * 3600 + m * 60 + s;
}

function extractVideoId(url: string): string | null {
    try {
        const parsed = new URL(url.trim());
        if (parsed.hostname.includes("youtube.com")) {
            if (parsed.pathname.startsWith("/live/")) {
                return parsed.pathname.replace(/^\/live\//, "").split("/")[0].split("?")[0] || null;
            }
            if (parsed.pathname.startsWith("/shorts/")) {
                return parsed.pathname.replace(/^\/shorts\//, "").split("/")[0].split("?")[0] || null;
            }
            return parsed.searchParams.get("v");
        }
        if (parsed.hostname.includes("youtu.be")) {
            return parsed.pathname.replace(/^\//, "").split("/")[0] || null;
        }
    } catch {
        // Fallback regex if not a valid full URL
        const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|(?:embed|v|live|shorts)\/))([\w-]{11})/);
        if (match) return match[1];
    }
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|(?:embed|v|live|shorts)\/))([\w-]{11})/);
    if (match) return match[1];
    return null;
}

function extractPlaylistId(url: string): string | null {
    try {
        const parsed = new URL(url.trim());
        return parsed.searchParams.get("list");
    } catch {
        const match = url.match(/[?&]list=([\w-]+)/);
        if (match) return match[1];
    }
    return null;
}

async function fetchVideoDetails(
    videoIds: string[],
    apiKey: string
): Promise<VideoDetail[]> {
    const results: VideoDetail[] = [];
    const BATCH_SIZE = 50;

    for (let i = 0; i < videoIds.length; i += BATCH_SIZE) {
        const batch = videoIds.slice(i, i + BATCH_SIZE);
        const params = new URLSearchParams({
            part: "snippet,contentDetails",
            id: batch.join(","),
            hl: "en",
            key: apiKey,
        });

        const res = await fetch(`https://www.googleapis.com/youtube/v3/videos?${params}`);
        if (!res.ok) {
            const body = await res.text();
            throw new Error(`YouTube API videos fetch failed (${res.status}): ${body}`);
        }

        const data = await res.json();
        for (const item of data.items ?? []) {
            const snippet = item.snippet;
            const contentDetails = item.contentDetails;
            const durationIso = contentDetails?.duration || null;
            const thumbnails = snippet?.thumbnails;
            const thumbUrl =
                thumbnails?.maxres?.url ||
                thumbnails?.standard?.url ||
                thumbnails?.high?.url ||
                thumbnails?.medium?.url ||
                thumbnails?.default?.url ||
                null;

            results.push({
                youtubeId: item.id,
                title: snippet?.title || "Untitled",
                description: snippet?.description || null,
                channelName: snippet?.channelTitle || null,
                channelId: snippet?.channelId || null,
                duration: durationIso,
                durationSeconds: parseDurationSeconds(durationIso),
                thumbnailUrl: thumbUrl,
                uploadDate: snippet?.publishedAt || null,
            });
        }
    }

    return results;
}

async function fetchPlaylistVideoIds(
    playlistId: string,
    apiKey: string
): Promise<string[]> {
    const videoIds: string[] = [];
    let pageToken: string | undefined;
    const MAX_PAGES = 10;
    let pages = 0;

    do {
        pages++;
        if (pages > MAX_PAGES) break;

        const params = new URLSearchParams({
            part: "contentDetails",
            playlistId,
            maxResults: "50",
            key: apiKey,
            ...(pageToken ? { pageToken } : {}),
        });

        const res = await fetch(`https://www.googleapis.com/youtube/v3/playlistItems?${params}`);
        if (!res.ok) {
            const body = await res.text();
            throw new Error(`YouTube API playlistItems fetch failed (${res.status}): ${body}`);
        }

        const data = await res.json();
        for (const item of data.items ?? []) {
            const vid = item.contentDetails?.videoId;
            if (vid) {
                videoIds.push(vid);
            }
        }

        pageToken = data.nextPageToken;
    } while (pageToken);

    return videoIds;
}

export default async function handler(
    req: VercelRequest,
    res: VercelResponse
) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const { url, groupTag, memberTag } = req.body || {};

    if (!url || typeof url !== "string") {
        return res.status(400).json({ error: "Missing or invalid url" });
    }

    if (!groupTag || typeof groupTag !== "string") {
        return res.status(400).json({ error: "Missing or invalid groupTag" });
    }

    const apiKey = process.env.YOUTUBE_API_KEY;
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!apiKey) {
        return res.status(500).json({ error: "Missing YOUTUBE_API_KEY in environment" });
    }
    if (!supabaseUrl || !supabaseKey) {
        return res.status(500).json({ error: "Missing Supabase configuration in environment" });
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
        auth: { persistSession: false },
    });

    try {
        const playlistId = extractPlaylistId(url);
        let videoIds: string[] = [];

        if (playlistId) {
            videoIds = await fetchPlaylistVideoIds(playlistId, apiKey);
        } else {
            const singleVid = extractVideoId(url);
            if (!singleVid) {
                return res.status(400).json({ error: "Could not parse YouTube video or playlist ID from URL" });
            }
            videoIds = [singleVid];
        }

        if (videoIds.length === 0) {
            return res.status(400).json({ error: "No videos found to import" });
        }

        const videoDetails = await fetchVideoDetails(videoIds, apiKey);
        if (videoDetails.length === 0) {
            return res.status(404).json({ error: "No video metadata retrieved from YouTube" });
        }

        const records = videoDetails.map((v) => ({
            youtube_id: v.youtubeId,
            title: v.title,
            description: v.description,
            channel_name: v.channelName,
            channel_id: v.channelId,
            duration: v.duration,
            duration_seconds: v.durationSeconds,
            thumbnail_url: v.thumbnailUrl,
            upload_date: v.uploadDate,
            group_tag: groupTag.trim().toLowerCase(),
            member_tag: memberTag && typeof memberTag === "string" && memberTag.trim().length > 0
                ? memberTag.trim()
                : null,
        }));

        const { data, error } = await supabase
            .from("pandora_videos")
            .upsert(records, {
                onConflict: "youtube_id",
            })
            .select("id");

        if (error) {
            console.error("Supabase upsert error:", error);
            return res.status(500).json({ error: error.message });
        }

        return res.status(200).json({
            imported: records.length,
            ids: (data ?? []).map((r) => r.id),
        });
    } catch (err: any) {
        console.error("Pandora import handler error:", err);
        return res.status(500).json({ error: err.message || "Internal server error" });
    }
}
