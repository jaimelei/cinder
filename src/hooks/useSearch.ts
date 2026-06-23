import { useEffect, useState } from "react";
import type { Video } from "../types";
import { searchVideos } from "../lib/api";

export function useSearch(collectionId?: string) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<Video[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        const trimmedQuery = query.trim();

        if (trimmedQuery.length < 2) {
            setResults([]);
            setIsLoading(false);
            setIsSearching(false);
            return;
        }

        const timeout = setTimeout(async () => {
            try {
                setIsLoading(true);
                setIsSearching(true);

                const data = await searchVideos(
                    trimmedQuery,
                    collectionId
                );

                setResults(data);
            } catch (error) {
                console.error(error);
                setResults([]);
            } finally {
                setIsLoading(false);
            }
        }, 300);

        return () => {
            clearTimeout(timeout);
        };
    }, [query, collectionId]);

    return {
        query,
        setQuery,
        results,
        isLoading,
        isSearching,
    };
}