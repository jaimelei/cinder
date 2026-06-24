import { useEffect, useState } from "react";
import CollectionCard from "./components/CollectionCard";
import { COLLECTIONS } from "../../constants/collections";
import { useCollections } from "../../hooks/useCollections";

const STAGGER_MS = 80;

export default function Home() {
    const { collections, isLoading } = useCollections();
    const [visibleCount, setVisibleCount] = useState(0);

    useEffect(() => {
        if (isLoading) {
            setVisibleCount(0);
            return;
        }

        if (visibleCount >= COLLECTIONS.length) return;

        const timer = setTimeout(() => {
            setVisibleCount((v) => v + 1);
        }, STAGGER_MS);

        return () => clearTimeout(timer);
    }, [isLoading, visibleCount]);

    const mergedCollections = COLLECTIONS.map((meta) => {
        const dbCollection = collections.find((c) => c.slug === meta.slug);
        return { ...meta, ...dbCollection };
    });

    return (
        <main className="px-page pt-20 md:pt-[80px] pb-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-3">
                {mergedCollections.slice(0, visibleCount).map((collection, index) => (
                    <CollectionCard
                        key={collection.slug}
                        collection={collection}
                        videoCount={collection.video_count}
                        index={index}
                    />
                ))}
            </div>
        </main>
    );
}