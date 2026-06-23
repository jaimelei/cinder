import { useEffect, useState } from "react";
import type { Collection, VideoWithPosition } from "../types";
import { getCollectionBySlug, getCollectionVideos } from "../lib/api";

export function useCollection(slug: string) {
    const [collection, setCollection] = useState<Collection | null>(null);
    const [videos, setVideos] = useState<VideoWithPosition[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        async function fetchCollection() {
            try {
                setIsLoading(true);

                const collectionData = await getCollectionBySlug(slug);

                if (!collectionData) {
                    throw new Error("collection not found");
                }

                setCollection(collectionData);

                const videosData = await getCollectionVideos(collectionData.id);

                setVideos(videosData);
                setError(null);
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err
                        : new Error("failed to fetch collection")
                );
            } finally {
                setIsLoading(false);
            }
        }

        fetchCollection();
    }, [slug]);

    return {
        collection,
        videos,
        isLoading,
        error,
    };
}