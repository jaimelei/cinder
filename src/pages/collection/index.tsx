import { Link, useParams, useNavigate } from "react-router-dom";
import VideoCard from "../../components/common/VideoCard";
import { useCollection } from "../../hooks/useCollection";
import { usePlayer } from "../../hooks/usePlayer";
import { useAuth } from "../../hooks/useAuth";
import { useSearch } from "../../components/layout/AppLayout";

export default function CollectionPage() {
    const { collection: slug } = useParams();
    const { collection, videos, isLoading, error } = useCollection(slug ?? "");
    const { openVideo } = usePlayer();
    const { logout } = useAuth();
    const { onSearch } = useSearch();
    const navigate = useNavigate();

    function handleLock() {
        logout();
        navigate("/");
    }

    if (error) {
        return (
            <main className="px-page pt-8 pb-6 animate-fade-in">
                <p className="text-ash-300">something went wrong</p>
            </main>
        );
    }

    return (
        <main className="px-page pt-8 pb-6 animate-fade-in">
            {/* header */}
            <header className="mb-6 flex items-baseline justify-between animate-drift-up">
                <Link
                    to="/app"
                    className="flex-shrink-0 text-sm text-ash-300 hover:text-ash-50 transition-colors"
                >
                    ← back
                </Link>

                <div className="absolute left-1/2 -translate-x-1/2">
                    {isLoading ? (
                        <div className="h-6 w-40 animate-pulse rounded bg-charcoal-800" />
                    ) : (
                        <h1 className="font-serif text-3xl text-ash-50 md:text-4xl">
                            {collection?.name}
                        </h1>
                    )}
                </div>

                <div className="flex items-center gap-4 text-sm text-ash-300">
                    <button
                        onClick={onSearch}
                        className="hover:text-ash-50 transition-colors"
                    >
                        search
                    </button>
                    <button
                        onClick={handleLock}
                        className="hover:text-ash-50 transition-colors"
                    >
                        lock
                    </button>
                </div>
            </header>

            {/* tagline + count */}
            {!isLoading && collection && (
                <div className="mb-8 text-center">
                    {collection.description && (
                        <p className="text-sm text-ash-300">{collection.description}</p>
                    )}
                    <p className="mt-1 text-xs tracking-wide text-ash-400">
                        {collection.video_count} videos
                    </p>
                </div>
            )}

            {/* loading skeletons */}
            {isLoading && (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {Array.from({ length: 8 }).map((_, index) => (
                        <div key={index} className="overflow-hidden rounded-md border border-charcoal-600 bg-charcoal-900">
                            <div className="aspect-video animate-pulse bg-charcoal-800" />
                            <div className="space-y-3 p-3">
                                <div className="h-4 animate-pulse rounded bg-charcoal-800" />
                                <div className="h-3 w-2/3 animate-pulse rounded bg-charcoal-800" />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* content */}
            {!isLoading && collection && (
                videos.length === 0 ? (
                    <div className="mt-20 text-center text-ash-300">nothing here yet</div>
                ) : (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {videos.map((video) => (
                            <VideoCard
                                key={video.id}
                                video={video}
                                onClick={() => openVideo(video, collection.slug)}
                            />
                        ))}
                    </div>
                )
            )}

            {!isLoading && !collection && (
                <div className="text-center text-ash-300">collection not found</div>
            )}
        </main>
    );
}