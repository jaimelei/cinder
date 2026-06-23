import CollectionCard from "./components/CollectionCard";
import { COLLECTIONS } from "../../constants/collections";
import { useCollections } from "../../hooks/useCollections";

export default function Home() {
    const { collections, isLoading } = useCollections();

    return (
        <main className="min-h-screen px-page pt-20 md:pt-[80px] pb-32 animate-fade-in">
            <h1 className="mb-12 font-serif text-xl text-ash-200">
                your collections
            </h1>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-3">
                {(isLoading ? COLLECTIONS : collections).map((collection, index) => (
                    <CollectionCard
                        key={collection.slug}
                        collection={collection}
                        videoCount={
                            "video_count" in collection
                                ? collection.video_count
                                : undefined
                        }
                        index={index}
                    />
                ))}
            </div>
        </main>
    );
}