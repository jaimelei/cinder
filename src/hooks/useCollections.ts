import { useEffect, useState } from "react";
import type { Collection } from "../types";
import { getCollections } from "../lib/api";

export function useCollections() {
    const [collections, setCollections] = useState<Collection[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        async function fetchCollections() {
            try {
                setIsLoading(true);

                const data = await getCollections();

                setCollections(data);
                setError(null);
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err
                        : new Error("failed to fetch collections")
                );
            } finally {
                setIsLoading(false);
            }
        }

        fetchCollections();
    }, []);

    useEffect(() => {
        function handleVideoDeleted(event: Event) {
            const customEvent = event as CustomEvent<{ videoId: string; collectionId: string }>;
            const { collectionId } = customEvent.detail;
            setCollections((prev) =>
                prev.map((c) =>
                    c.id === collectionId
                        ? { ...c, video_count: Math.max(0, c.video_count - 1) }
                        : c
                )
            );
        }

        window.addEventListener("video-deleted", handleVideoDeleted);
        return () => {
            window.removeEventListener("video-deleted", handleVideoDeleted);
        };
    }, []);

    return {
        collections,
        isLoading,
        error,
    };
}