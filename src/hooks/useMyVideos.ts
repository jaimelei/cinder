import { useEffect, useState } from "react";
import type { Video } from "../types";
import { getMyVideos } from "../lib/api";

export function useMyVideos() {
    const [videos, setVideos] = useState<Video[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        async function fetchVideos() {
            try {
                setIsLoading(true);
                const data = await getMyVideos();
                setVideos(data);
                setError(null);
            } catch (err) {
                console.error("useMyVideos error:", err);
                setError(
                    err instanceof Error
                        ? err
                        : new Error("failed to fetch uploaded videos")
                );
            } finally {
                setIsLoading(false);
            }
        }

        fetchVideos();
    }, []);

    return {
        videos,
        isLoading,
        error,
    };
}
