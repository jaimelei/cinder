import { Link, useParams } from "react-router-dom";
import VideoCard from "../../components/common/VideoCard";
import { useCollection } from "../../hooks/useCollection";
import { usePlayer } from "../../hooks/usePlayer";
import CollectionHeader from "./components/CollectionHeader";

export default function CollectionPage() {
    const { collection: slug } = useParams();

    const {
        collection,
        videos,
        isLoading,
        error,
    } = useCollection(slug ?? "");

    const { openVideo } = usePlayer();

    if (error) {
        return (
            <main className="min-h-screen px-page pt-20 pb-32 animate-fade-in">
                <p className="text-ash-300">
                    something went wrong
                </p>
            </main>
        );
    }

    return (
        <main className="min-h-screen px-page pt-20 pb-32 animate-fade-in">
            <Link
                to="/app"
                className="
          mb-6
          inline-flex
          text-sm
          text-ash-300
          hover:text-ash-50
          md:hidden
        "
            >
                ← back
            </Link>

            {isLoading ? (
                <>
                    <div className="mb-10 space-y-3">
                        <div className="h-10 w-48 animate-pulse rounded bg-charcoal-800" />

                        <div className="h-4 w-72 animate-pulse rounded bg-charcoal-800" />

                        <div className="h-3 w-20 animate-pulse rounded bg-charcoal-800" />
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {Array.from({ length: 8 }).map((_, index) => (
                            <div
                                key={index}
                                className="
                  overflow-hidden
                  rounded-md
                  border
                  border-charcoal-600
                  bg-charcoal-900
                "
                            >
                                <div className="aspect-video animate-pulse bg-charcoal-800" />

                                <div className="space-y-3 p-3">
                                    <div className="h-4 animate-pulse rounded bg-charcoal-800" />

                                    <div className="h-3 w-2/3 animate-pulse rounded bg-charcoal-800" />
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            ) : collection ? (
                <>
                    <CollectionHeader collection={collection} />

                    {videos.length === 0 ? (
                        <div className="mt-20 text-center text-ash-300">
                            nothing here yet
                        </div>
                    ) : (
                        <div
                            className="
                grid
                grid-cols-1
                gap-4
                sm:grid-cols-2
                lg:grid-cols-3
                xl:grid-cols-4
              "
                        >
                            {videos.map((video) => (
                                <VideoCard
                                    key={video.id}
                                    video={video}
                                    onClick={() =>
                                        openVideo(video, collection.slug)
                                    }
                                />
                            ))}
                        </div>
                    )}
                </>
            ) : (
                <div className="text-ash-300">
                    collection not found
                </div>
            )}
        </main>
    );
}