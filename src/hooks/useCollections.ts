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

    return {
        collections,
        isLoading,
        error,
    };
}