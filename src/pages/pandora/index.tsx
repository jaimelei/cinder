import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { usePlayer } from "../../hooks/usePlayer";
import { usePandoraVideos } from "../../hooks/usePandoraVideos";
import { PANDORA_GROUPS } from "../../constants/pandora";
import VideoCard from "../../components/common/VideoCard";
import ImportModal from "./components/ImportModal";
import type { PandoraVideo, Video } from "../../types";

// ─── Scroll to top ────────────────────────────────────────────────────────────

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

// ─── Loading skeletons ────────────────────────────────────────────────────────

function SkeletonGrid() {
    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="overflow-hidden rounded-md border border-charcoal-600 bg-charcoal-900">
                    <div className="aspect-video animate-pulse bg-charcoal-800" />
                    <div className="space-y-3 p-3">
                        <div className="h-4 animate-pulse rounded bg-charcoal-800" />
                        <div className="h-3 w-2/3 animate-pulse rounded bg-charcoal-800" />
                    </div>
                </div>
            ))}
        </div>
    );
}

// ─── Video grid ───────────────────────────────────────────────────────────────

function VideoGrid({
    videos,
    groupSlug,
}: {
    videos: PandoraVideo[];
    groupSlug: string;
}) {
    const { openVideo } = usePlayer();

    if (videos.length === 0) {
        return (
            <p className="text-xs text-ash-400 py-2">no videos yet</p>
        );
    }

    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {videos.map((video) => {
                const uiVideo: Video = {
                    ...video,
                    updated_at: video.created_at,
                };
                return (
                    <VideoCard
                        key={video.id}
                        video={uiVideo}
                        onClick={() => openVideo(uiVideo, groupSlug, null)}
                    />
                );
            })}
        </div>
    );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function PandoraPage() {
    const { isAuthenticated, logoutPandora } = useAuth();
    const [isImportOpen, setIsImportOpen] = useState(false);
    const navigate = useNavigate();

    const { groups, isLoading, error, refetch } = usePandoraVideos();

    const totalVideos = groups.reduce((sum, g) => sum + g.totalCount, 0);

    function handleLock() {
        logoutPandora();
        navigate("/pandora");
    }

    function handleImportSuccess() {
        refetch();
    }

    function scrollToGroup(slug: string) {
        document.getElementById(`group-${slug}`)?.scrollIntoView({ behavior: "smooth" });
    }

    // ── Error state ──────────────────────────────────────────────────────────
    if (error) {
        return (
            <main className="px-page pt-8 pb-6 animate-fade-in">
                <p className="text-ash-300">something went wrong loading pandora</p>
            </main>
        );
    }

    // ── Render ───────────────────────────────────────────────────────────────
    return (
        <main className="px-page pt-8 pb-6 animate-fade-in">

            {/* ── Header ──────────────────────────────────────────────────── */}
            <header className="mb-6 animate-drift-up">

                {/* Desktop: three-column grid */}
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
                            <div className="mx-auto h-6 w-32 animate-pulse rounded bg-charcoal-800" />
                        ) : (
                            <h1 className="font-serif text-3xl text-ash-50 md:text-4xl">
                                Pandora
                            </h1>
                        )}
                    </div>

                    <div className="flex items-center justify-end gap-4 text-sm text-ash-300">
                        <button
                            onClick={() => setIsImportOpen(true)}
                            className="rounded-md border border-charcoal-600 px-3 py-1 text-xs text-ash-300 hover:border-ember-400 hover:text-ember-400 transition-colors"
                        >
                            + import
                        </button>
                        <button onClick={handleLock} className="hover:text-ash-50 transition-colors">
                            lock
                        </button>
                    </div>
                </div>

                {/* Desktop: subtitle + count */}
                {!isLoading && (
                    <div className="hidden md:block text-center mb-6">
                        <p className="text-sm text-ash-300">a personal archive</p>
                        <p className="mt-1 text-xs tracking-wide text-ash-400">
                            {totalVideos} videos
                        </p>
                    </div>
                )}

                {/* Mobile: nav row */}
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
                        <button
                            onClick={() => setIsImportOpen(true)}
                            className="rounded-md border border-charcoal-600 px-2.5 py-1 text-xs hover:border-ember-400 hover:text-ember-400 transition-colors"
                        >
                            + import
                        </button>
                        <button onClick={handleLock} className="hover:text-ash-50 transition-colors">
                            lock
                        </button>
                    </div>
                </div>

                {/* Mobile: title + meta */}
                <div className="md:hidden text-center mb-6">
                    {isLoading ? (
                        <div className="mx-auto h-6 w-32 animate-pulse rounded bg-charcoal-800" />
                    ) : (
                        <h1 className="font-serif text-3xl text-ash-50">Pandora</h1>
                    )}
                    {!isLoading && (
                        <>
                            <p className="mt-2 text-sm text-ash-300">a personal archive</p>
                            <p className="mt-1 text-xs tracking-wide text-ash-400">
                                {totalVideos} videos
                            </p>
                        </>
                    )}
                </div>

                {/* Jump navigation — group pills */}
                {!isLoading && totalVideos > 0 && (
                    <div className="flex justify-center gap-2 mb-8 flex-wrap">
                        {PANDORA_GROUPS.map((group) => (
                            <button
                                key={group.slug}
                                onClick={() => scrollToGroup(group.slug)}
                                className="rounded-full border border-charcoal-600 px-3.5 py-1 text-xs text-ash-300 hover:border-ash-300 hover:text-ash-50 transition-colors"
                            >
                                {group.name}
                            </button>
                        ))}
                    </div>
                )}
            </header>

            {/* ── Loading ──────────────────────────────────────────────────── */}
            {isLoading && <SkeletonGrid />}

            {/* ── Empty state ──────────────────────────────────────────────── */}
            {!isLoading && totalVideos === 0 && (
                <div className="mt-20 flex flex-col items-center gap-4 text-center">
                    <p className="text-ash-300 text-sm">nothing here yet</p>
                    <button
                        onClick={() => setIsImportOpen(true)}
                        className="rounded-sm border border-ember-500/80 bg-ember-500/10 px-4 py-2 text-xs font-medium text-ember-300 hover:bg-ember-500/20 hover:border-ember-400 hover:text-ember-200 active:scale-[0.98] transition-all"
                    >
                        open importer
                    </button>
                </div>
            )}

            {/* ── Group sections ───────────────────────────────────────────── */}
            {!isLoading && totalVideos > 0 && (
                <div className="space-y-14">
                    {groups.map((group) => {
                        if (group.totalCount === 0) return null;

                        return (
                            <section key={group.slug} id={`group-${group.slug}`}>
                                {/* Group header */}
                                <div className="flex items-baseline gap-3 mb-6">
                                    <h2 className="font-serif text-2xl text-ash-50">
                                        {group.name}
                                    </h2>
                                    <span className="text-xs text-ash-400">
                                        {group.totalCount} videos
                                    </span>
                                    <div className="flex-1 border-b border-charcoal-700" />
                                </div>

                                {/* Member sub-sections */}
                                <div className="space-y-10">
                                    {group.members.map((section) => (
                                        <div key={section.member ?? "__group__"}>
                                            {/* Member label */}
                                            <div className="flex items-baseline gap-2 mb-4">
                                                <h3 className="text-sm font-medium text-ash-200">
                                                    {section.member ?? group.name}
                                                </h3>
                                                <span className="text-xs text-ash-400">
                                                    {section.videos.length}
                                                </span>
                                            </div>

                                            {/* Video grid */}
                                            <VideoGrid
                                                videos={section.videos}
                                                groupSlug={group.slug}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </section>
                        );
                    })}
                </div>
            )}

            {/* ── Import modal ─────────────────────────────────────────────── */}
            <ImportModal
                isOpen={isImportOpen}
                onClose={() => setIsImportOpen(false)}
                onImportSuccess={handleImportSuccess}
            />

            <ScrollToTop />
        </main>
    );
}
