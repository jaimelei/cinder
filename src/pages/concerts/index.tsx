import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import VideoCard from "../../components/common/VideoCard";
import { useMyVideos } from "../../hooks/useMyVideos";
import { usePlayer } from "../../hooks/usePlayer";
import { useAuth } from "../../hooks/useAuth";
import { useSearch } from "../../components/layout/AppLayout";

function ScrollToTop() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const el = document.getElementById("root");
        if (!el) return;
        const onScroll = () => setVisible(el.scrollTop > 300);
        el.addEventListener("scroll", onScroll);
        return () => el.removeEventListener("scroll", onScroll);
    }, []);

    function scrollToTop() {
        document.getElementById("root")?.scrollTo({ top: 0, behavior: "smooth" });
    }

    return (
        <button
            onClick={scrollToTop}
            className={`fixed bottom-8 right-8 z-50 rounded-full border border-charcoal-600 bg-charcoal-800/90 px-4 py-2 text-sm text-ash-300 shadow-nav backdrop-blur-md transition-all duration-300 hover:text-ash-50 ${
                visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
            }`}
        >
            ↑ top
        </button>
    );
}

export default function ConcertsPage() {
    const { videos, isLoading, error } = useMyVideos();
    const { openVideo } = usePlayer();
    const { isAuthenticated, logoutConcerts } = useAuth();
    const { onSearch } = useSearch();
    const navigate = useNavigate();

    function handleLock() {
        logoutConcerts();
        navigate("/app/concerts");
    }

    if (error) {
        return (
            <main className="px-page pt-8 pb-6 animate-fade-in">
                <p className="text-ash-300">something went wrong fetching uploads</p>
            </main>
        );
    }

    return (
        <main className="px-page pt-8 pb-6 animate-fade-in">
            <header className="mb-6 animate-drift-up">
                {/* md+ — three column grid */}
                <div className="hidden md:grid grid-cols-3 items-baseline mb-2">
                    {isAuthenticated ? (
                        <Link
                            to="/app"
                            className="text-sm text-ash-300 hover:text-ash-50 transition-colors"
                        >
                            ← back
                        </Link>
                    ) : (
                        <div />
                    )}

                    <div className="text-center">
                        {isLoading ? (
                            <div className="mx-auto h-6 w-40 animate-pulse rounded bg-charcoal-800" />
                        ) : (
                            <h1 className="font-serif text-3xl text-ash-50 md:text-4xl">
                                Concerts
                            </h1>
                        )}
                    </div>

                    <div className="flex items-center justify-end gap-4 text-sm text-ash-300">
                        <button onClick={onSearch} className="hover:text-ash-50 transition-colors">
                            search
                        </button>
                        <button onClick={handleLock} className="hover:text-ash-50 transition-colors">
                            lock
                        </button>
                    </div>
                </div>

                {/* md+ tagline + count */}
                {!isLoading && (
                    <div className="hidden md:block text-center mb-8">
                        <p className="text-sm text-ash-300">Videos uploaded directly to YouTube</p>
                        <p className="mt-1 text-xs tracking-wide text-ash-400">
                            {videos.length} videos
                        </p>
                    </div>
                )}

                {/* mobile nav row */}
                <div className="flex md:hidden items-baseline justify-between mb-6">
                    {isAuthenticated ? (
                        <Link
                            to="/app"
                            className="text-sm text-ash-300 hover:text-ash-50 transition-colors"
                        >
                            ← back
                        </Link>
                    ) : (
                        <div />
                    )}
                    <div className="flex items-center gap-4 text-sm text-ash-300">
                        <button onClick={onSearch} className="hover:text-ash-50 transition-colors">
                            search
                        </button>
                        <button onClick={handleLock} className="hover:text-ash-50 transition-colors">
                            lock
                        </button>
                    </div>
                </div>

                {/* mobile title + meta */}
                <div className="md:hidden text-center mb-8">
                    {isLoading ? (
                        <div className="mx-auto h-6 w-40 animate-pulse rounded bg-charcoal-800" />
                    ) : (
                        <h1 className="font-serif text-3xl text-ash-50">
                            Concerts
                        </h1>
                    )}
                    {!isLoading && (
                        <>
                            <p className="mt-2 text-sm text-ash-300">Videos uploaded directly to YouTube</p>
                            <p className="mt-1 text-xs tracking-wide text-ash-400">
                                {videos.length} videos
                            </p>
                        </>
                    )}
                </div>
            </header>

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
            {!isLoading && (
                videos.length === 0 ? (
                    <div className="mt-20 text-center text-ash-300">nothing uploaded yet</div>
                ) : (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {videos.map((video) => (
                            <VideoCard
                                key={video.id}
                                video={video}
                                onClick={() => openVideo(video, "concerts", null)}
                            />
                        ))}
                    </div>
                )
            )}

            <ScrollToTop />
        </main>
    );
}
