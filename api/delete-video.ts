import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

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
    if (req.method !== "POST") {
        return res.status(405).json({ error: "method not allowed" });
    }

    const { videoId, collectionId } = req.body as { videoId?: string; collectionId?: string };

    if (!videoId || !collectionId) {
        return res.status(400).json({ error: "missing videoId or collectionId" });
    }

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

    if (!supabaseUrl || !supabaseKey || !clientId || !clientSecret || !refreshToken) {
        return res.status(500).json({ error: "missing environment configuration" });
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
        auth: { persistSession: false },
    });

    try {
        // 1. Look up playlist_item_id
        const { data: cvData, error: cvError } = await supabase
            .from("cinder_collection_videos")
            .select("id, playlist_item_id")
            .eq("collection_id", collectionId)
            .eq("video_id", videoId)
            .single();

        if (cvError || !cvData) {
            return res.status(404).json({ error: "video not found in collection" });
        }

        const playlistItemId = cvData.playlist_item_id;
        if (!playlistItemId) {
            return res.status(400).json({ error: "missing playlist_item_id for this video" });
        }

        // 2. Get YouTube Access Token
        const accessToken = await getAccessToken(clientId, clientSecret, refreshToken);

        // 3. Delete from YouTube
        const ytRes = await fetch(
            `https://www.googleapis.com/youtube/v3/playlistItems?id=${playlistItemId}`,
            {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            }
        );

        // Treat 404 as already deleted (idempotent success)
        if (!ytRes.ok && ytRes.status !== 404) {
            const body = await ytRes.text();
            return res.status(ytRes.status).json({ error: `YouTube delete failed: ${body}` });
        }

        // 4. Delete junction row from Supabase
        const { error: delCvError } = await supabase
            .from("cinder_collection_videos")
            .delete()
            .eq("id", cvData.id);

        if (delCvError) {
            throw delCvError;
        }

        // 5. Check if video is referenced elsewhere
        const { data: refs, error: refError } = await supabase
            .from("cinder_collection_videos")
            .select("id")
            .eq("video_id", videoId);

        if (refError) {
            throw refError;
        }

        // 6. Delete video if orphaned
        if (!refs || refs.length === 0) {
            const { error: delVidError } = await supabase
                .from("cinder_videos")
                .delete()
                .eq("id", videoId);

            if (delVidError) {
                throw delVidError;
            }
        }

        // 7. Update collection video count
        const { count, error: countError } = await supabase
            .from("cinder_collection_videos")
            .select("id", { count: "exact", head: true })
            .eq("collection_id", collectionId);

        if (!countError) {
            await supabase
                .from("cinder_collections")
                .update({ video_count: count ?? 0, updated_at: new Date().toISOString() })
                .eq("id", collectionId);
        }

        return res.status(200).json({ success: true });
    } catch (err: any) {
        console.error(err);
        return res.status(500).json({ error: err.message || "internal server error" });
    }
}
