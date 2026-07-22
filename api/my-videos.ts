import "dotenv/config";
import type { VercelRequest, VercelResponse } from "@vercel/node";

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

export default async function handler(
    req: VercelRequest,
    res: VercelResponse
) {
    if (req.method !== "GET") {
        return res.status(405).json({ error: "method not allowed" });
    }

    const apiKey = process.env.YOUTUBE_API_KEY;
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

    if (!apiKey || !clientId || !clientSecret || !refreshToken) {
        return res.status(500).json({ error: "missing environment configuration" });
    }

    try {
        // 1. Get YouTube Access Token
        const accessToken = await getAccessToken(clientId, clientSecret, refreshToken);

        // 2. Fetch channel uploads playlist ID
        const channelRes = await fetch(
            `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&mine=true&key=${apiKey}`,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            }
        );

        if (!channelRes.ok) {
            const body = await channelRes.text();
            return res.status(channelRes.status).json({ error: `YouTube channels fetch failed: ${body}` });
        }

        const channelData = await channelRes.json();
        const uploadsPlaylistId = channelData.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;

        if (!uploadsPlaylistId) {
            return res.status(404).json({ error: "uploads playlist not found" });
        }

        // 3. Fetch playlist items from uploads playlist
        const playlistItemsRes = await fetch(
            `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&playlistId=${uploadsPlaylistId}&maxResults=50&hl=en&key=${apiKey}`,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            }
        );

        if (!playlistItemsRes.ok) {
            const body = await playlistItemsRes.text();
            return res.status(playlistItemsRes.status).json({ error: `YouTube playlistItems fetch failed: ${body}` });
        }

        const playlistItemsData = await playlistItemsRes.json();
        const videoItems = playlistItemsData.items ?? [];

        if (videoItems.length === 0) {
            return res.status(200).json({ videos: [] });
        }

        // 4. Fetch detailed video metadata (for durations)
        const videoIds = videoItems.map((item: any) => item.contentDetails?.videoId).filter(Boolean);
        const videosRes = await fetch(
            `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${videoIds.join(",")}&hl=en&key=${apiKey}`,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            }
        );

        if (!videosRes.ok) {
            const body = await videosRes.text();
            return res.status(videosRes.status).json({ error: `YouTube videos fetch failed: ${body}` });
        }

        const videosData = await videosRes.json();
        const videoDetailsMap = new Map<string, any>();
        for (const video of videosData.items ?? []) {
            videoDetailsMap.set(video.id, video);
        }

        // 5. Map to Video type shape
        const videos = videoItems.map((item: any) => {
            const ytId = item.contentDetails?.videoId;
            const details = videoDetailsMap.get(ytId);
            const snippet = item.snippet;

            return {
                id: ytId, // Using youtube_id as local id for temporary my-videos list
                youtube_id: ytId,
                title: snippet.title,
                description: snippet.description || null,
                channel_name: snippet.channelTitle || null,
                channel_id: snippet.channelId || null,
                duration: details?.contentDetails?.duration || null,
                duration_seconds: null, // Optional, duration string is enough for display
                thumbnail_url: snippet.thumbnails?.high?.url || snippet.thumbnails?.medium?.url || snippet.thumbnails?.default?.url || null,
                upload_date: snippet.publishedAt || null,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            };
        });

        return res.status(200).json({ videos });
    } catch (err: any) {
        console.error(err);
        return res.status(500).json({ error: err.message || "internal server error" });
    }
}
