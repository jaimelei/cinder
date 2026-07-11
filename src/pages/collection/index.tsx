import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import VideoCard from "../../components/common/VideoCard";
import { useCollection } from "../../hooks/useCollection";
import { usePlayer } from "../../hooks/usePlayer";
import { useAuth } from "../../hooks/useAuth";
import { useSearch } from "../../components/layout/AppLayout";
import { useFocusable, FocusContext, setFocus } from "@noriginmedia/norigin-spatial-navigation";
import type { Collection } from "../../types";

const FIRST_VIDEO_KEY = "FIRST_VIDEO";

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
            className={`fixed bottom-8 right-8 z-50 rounded-full border border-charcoal-600 bg-charcoal-800/90 px-4 py-2 text-sm text-ash-300 shadow-nav backdrop-blur-md transition-all duration-300 hover:text-ash-50 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
                }`}
        >
            ↑ top
        </button>
    );
}

interface CollectionHeaderProps {
    isLoading: boolean;
    collection: Collection | null;
    onSearch: () => void;
    onLock: () => void;
    onBack: () => void;
}

function CollectionHeader({ isLoading, collection, onSearch, onLock, onBack }: CollectionHeaderProps) {
    const { ref: backRef, focused: backFocused } = useFocusable({
        focusKey: "COLLECTION_BACK",
        onEnterPress: onBack,
    });

    const { ref: searchRef, focused: searchFocused } = useFocusable({
        focusKey: "COLLECTION_SEARCH",
        onEnterPress: onSearch,
    });

    const { ref: lockRef, focused: lockFocused } = useFocusable({
        focusKey: "COLLECTION_LOCK",
        onEnterPress: onLock,
    });

    return (
        <header className="mb-6 animate-drift-up">
            {/* md+ — three column grid */}
            <div className="hidden md:grid grid-cols-3 items-baseline mb-2">
                <button
                    ref={backRef}
                    onClick={onBack}
                    className={`text-left text-sm text-ash-300 hover:text-ash-50 transition-colors outline-none px-2 py-0.5 rounded w-max ${
                        backFocused ? "border border-ember-500 ring-2 ring-ember-500/50 shadow-ember-glow text-ember-400" : ""
                    }`}
                >
                    ← back
                </button>

                <div className="text-center">
                    {isLoading ? (
                        <div className="mx-auto h-6 w-40 animate-pulse rounded bg-charcoal-800" />
                    ) : (
                        <h1 className="font-serif text-3xl text-ash-50 md:text-4xl">
                            {collection?.name}
                        </h1>
                    )}
                </div>

                <div className="flex items-center justify-end gap-4 text-sm text-ash-300">
                    <button
                        ref={searchRef}
                        onClick={onSearch}
                        className={`hover:text-ash-50 transition-colors outline-none px-2 py-0.5 rounded ${
                            searchFocused ? "border border-ember-500 ring-2 ring-ember-500/50 shadow-ember-glow text-ember-400" : ""
                        }`}
                    >
                        search
                    </button>
                    <button
                        ref={lockRef}
                        onClick={onLock}
                        className={`hover:text-ash-50 transition-colors outline-none px-2 py-0.5 rounded ${
                            lockFocused ? "border border-ember-500 ring-2 ring-ember-500/50 shadow-ember-glow text-ember-400" : ""
                        }`}
                    >
                        lock
                    </button>
                </div>
            </div>

            {/* md+ tagline + count */}
            {!isLoading && collection && (
                <div className="hidden md:block text-center mb-8">
                    {collection.description && (
                        <p className="text-sm text-ash-300">{collection.description}</p>
                    )}
                    <p className="mt-1 text-xs tracking-wide text-ash-400">
                        {collection.video_count} videos
                    </p>
                </div>
            )}

            {/* mobile nav row */}
            <div className="flex md:hidden items-baseline justify-between mb-6">
                <button
                    onClick={onBack}
                    className="text-sm text-ash-300 hover:text-ash-50 transition-colors outline-none"
                >
                    ← back
                </button>
                <div className="flex items-center gap-4 text-sm text-ash-300">
                    <button onClick={onSearch} className="hover:text-ash-50 transition-colors outline-none">
                        search
                    </button>
                    <button onClick={onLock} className="hover:text-ash-50 transition-colors outline-none">
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
                        {collection?.name}
                    </h1>
                )}
                {!isLoading && collection && (
                    <>
                        {collection.description && (
                            <p className="mt-2 text-sm text-ash-300">{collection.description}</p>
                        )}
                        <p className="mt-1 text-xs tracking-wide text-ash-400">
                            {collection.video_count} videos
                        </p>
                    </>
                )}
            </div>
        </header>
    );
}

export default function CollectionPage() {
    const { collection: slug } = useParams();
    const { collection, videos, isLoading, error } = useCollection(slug ?? "");
    const { openVideo } = usePlayer();
    const { logout } = useAuth();
    const { onSearch } = useSearch();
    const navigate = useNavigate();

    const { ref: collectionRef, focusKey } = useFocusable({
        isFocusBoundary: true,
        focusable: false,
    });

    useEffect(() => {
        if (!isLoading && collection && videos.length > 0) {
            setFocus(FIRST_VIDEO_KEY);
        } else if (!isLoading && collection && videos.length === 0) {
            setFocus("COLLECTION_BACK");
        }
    }, [isLoading, collection, videos.length]);

    function handleLock() {
        logout();
        navigate("/");
    }
    
    function handleBack() {
        navigate("/app");
    }

    if (error) {
        return (
            <main className="px-page pt-8 pb-6 animate-fade-in">
                <p className="text-ash-300">something went wrong</p>
            </main>
        );
    }

    return (
        <FocusContext.Provider value={focusKey}>
            <main ref={collectionRef} className="px-page pt-8 pb-6 animate-fade-in outline-none">
                <CollectionHeader
                    isLoading={isLoading}
                    collection={collection}
                    onSearch={onSearch}
                    onLock={handleLock}
                    onBack={handleBack}
                />

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
                            {videos.map((video, index) => (
                                <VideoCard
                                    key={video.id}
                                    video={video}
                                    onClick={() => openVideo(video, collection.slug, collection.id)}
                                    focusKey={index === 0 ? FIRST_VIDEO_KEY : undefined}
                                />
                            ))}
                        </div>
                    )
                )}

                {!isLoading && !collection && (
                    <div className="text-center text-ash-300">collection not found</div>
                )}

                <ScrollToTop />
            </main>
        </FocusContext.Provider>
    );
}