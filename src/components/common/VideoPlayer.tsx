import { getEmbedUrl, getRelativeDate } from "../../lib/youtube";
import { usePlayer } from "../../hooks/usePlayer";
import { useEffect, useRef, useState } from "react";
import { deleteVideo } from "../../lib/api";
import type { CSSProperties } from "react";

const MINI_W = 320;
const MINI_H = Math.round(MINI_W * 9 / 16); // 180
const MINI_LEFT = 24;
const MINI_BOTTOM = 24;

const OPEN_CLOSE_MS = 260;

export default function VideoPlayer() {
    const { currentVideo, isOpen, isMinimized, collectionId, minimize, restore, close, startDeletingVideo, stopDeletingVideo } = usePlayer();
    const iframeWrapRef = useRef<HTMLDivElement>(null);
    const [animating, setAnimating] = useState(false);
    const prevMinimized = useRef(isMinimized);

    const [shouldRender, setShouldRender] = useState(false);
    const [animateIn, setAnimateIn] = useState(false);

    const [displayVideo, setDisplayVideo] = useState(currentVideo);

    useEffect(() => {
        if (currentVideo) setDisplayVideo(currentVideo);
    }, [currentVideo]);

    useEffect(() => {
        if (isOpen) {
            setShouldRender(true);
            let raf2 = 0;
            const raf1 = requestAnimationFrame(() => {
                raf2 = requestAnimationFrame(() => setAnimateIn(true));
            });
            return () => {
                cancelAnimationFrame(raf1);
                cancelAnimationFrame(raf2);
            };
        }

        setAnimateIn(false);
        const timeout = setTimeout(() => setShouldRender(false), OPEN_CLOSE_MS);
        return () => clearTimeout(timeout);
    }, [isOpen]);

    // FLIP animation between full ↔ mini
    useEffect(() => {
        if (prevMinimized.current === isMinimized) return;
        prevMinimized.current = isMinimized;

        const el = iframeWrapRef.current;
        if (!el) return;

        // Capture the "first" rect before the DOM updates paint
        const first = el.getBoundingClientRect();

        setAnimating(true);

        requestAnimationFrame(() => {
            const last = el.getBoundingClientRect();

            const dx = first.left - last.left;
            const dy = first.top - last.top;
            const scaleX = first.width / last.width;
            const scaleY = first.height / last.height;

            if (dx === 0 && dy === 0 && scaleX === 1 && scaleY === 1) {
                setAnimating(false);
                return;
            }

            el.style.transition = "none";
            el.style.transform = `translate(${dx}px, ${dy}px) scale(${scaleX}, ${scaleY})`;
            el.style.transformOrigin = "top left";

            // Force reflow
            el.getBoundingClientRect();

            el.style.transition = "transform 400ms cubic-bezier(0.4, 0, 0.2, 1)";
            el.style.transform = "translate(0, 0) scale(1, 1)";

            const handleEnd = () => {
                el.style.transition = "";
                el.style.transform = "";
                el.style.transformOrigin = "";
                setAnimating(false);
                el.removeEventListener("transitionend", handleEnd);
            };
            el.addEventListener("transitionend", handleEnd, { once: true });
        });
    }, [isMinimized]);

    async function handleDelete() {
        if (!currentVideo || !collectionId) return;

        const videoId = currentVideo.id;
        const targetColId = collectionId;

        // Mark as deleting immediately
        startDeletingVideo(videoId);

        // Close the player immediately
        close();

        // Perform deletion in the background
        deleteVideo(videoId, targetColId)
            .then(() => {
                window.dispatchEvent(
                    new CustomEvent("video-deleted", {
                        detail: { videoId, collectionId: targetColId },
                    })
                );
            })
            .catch((error) => {
                console.error("Failed to delete video in background:", error);
                alert(error instanceof Error ? error.message : "failed to delete video");
            })
            .finally(() => {
                stopDeletingVideo(videoId);
            });
    }

    if (!shouldRender || !displayVideo) return null;

    const showBackdrop = animateIn && !isMinimized;

    const cardStyle: CSSProperties = {
        pointerEvents: animateIn ? "auto" : "none",
        transformOrigin: "center center",
        willChange: "transform, opacity",
        transition: `opacity ${OPEN_CLOSE_MS}ms cubic-bezier(0.4, 0, 0.2, 1), transform ${OPEN_CLOSE_MS}ms cubic-bezier(0.4, 0, 0.2, 1)`,
        opacity: animateIn ? 1 : 0,
        transform: animateIn ? "scale(1)" : "scale(0.9)",
    };

    return (
        <>
            {/* backdrop — visible only in full mode, once opened */}
            <div
                className={`fixed inset-0 z-[70] bg-charcoal-950/85 backdrop-blur-md transition-opacity duration-300 ${showBackdrop ? "opacity-100" : "opacity-0 pointer-events-none"
                    }`}
                onClick={minimize}
            />

            {/* Single persistent player container */}
            <div
                className="fixed z-[75]"
                style={
                    isMinimized
                        ? {
                            left: MINI_LEFT,
                            bottom: MINI_BOTTOM,
                            width: MINI_W,
                        }
                        : {
                            // Center horizontally and vertically using fixed positioning
                            top: "50%",
                            left: "50%",
                            transform: animating ? undefined : "translate(-50%, -50%)",
                            width: "100%",
                            maxWidth: "56rem", // max-w-4xl
                            padding: "1.5rem",
                            pointerEvents: "none" as const,
                        }
                }
            >
                <div style={cardStyle}>
                    <div
                        ref={iframeWrapRef}
                        className={
                            isMinimized
                                ? "overflow-hidden rounded-t-xl"
                                : "w-full overflow-hidden rounded-t-xl border-x border-t border-charcoal-600"
                        }
                    >
                        <div
                            className="w-full"
                            style={
                                isMinimized
                                    ? { height: MINI_H }
                                    : { aspectRatio: "16 / 9" }
                            }
                        >
                            <iframe
                                src={getEmbedUrl(displayVideo.youtube_id)}
                                title={displayVideo.title}
                                allow="autoplay; encrypted-media; picture-in-picture"
                                allowFullScreen
                                className="h-full w-full"
                            />
                        </div>
                    </div>

                    {/* Controls bar — different for each mode */}
                    {isMinimized ? (
                        <div className="flex items-center justify-between rounded-b-xl border border-charcoal-600 bg-charcoal-900 px-3 py-2">
                            <button
                                onClick={restore}
                                className="truncate text-sm text-ash-100 hover:text-ash-50 text-left flex-1 transition-colors"
                            >
                                {displayVideo.title}
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); close(); }}
                                className="ml-3 flex-shrink-0 text-xs text-ash-300 hover:text-ash-100 transition-colors"
                            >
                                ✕
                            </button>
                        </div>
                    ) : (
                        <div className="rounded-b-xl border-x border-b border-charcoal-600 bg-charcoal-900 shadow-modal p-5 space-y-3">
                            <h2 className="font-serif text-xl text-ash-50 leading-snug">
                                {displayVideo.title}
                            </h2>
                            <div className="flex flex-wrap items-center gap-2 text-sm text-ash-300">
                                {displayVideo.channel_name && (
                                    <span>{displayVideo.channel_name}</span>
                                )}
                                {displayVideo.upload_date && (
                                    <>
                                        <span>·</span>
                                        <span>{getRelativeDate(displayVideo.upload_date)}</span>
                                    </>
                                )}
                            </div>
                            <div className="flex items-center justify-between pt-1 w-full">
                                <div className="flex gap-3">
                                    <button
                                        onClick={minimize}
                                        className="rounded-md border border-charcoal-600 px-4 py-2 text-sm text-ash-200 hover:bg-charcoal-800 transition-colors"
                                    >
                                        minimize
                                    </button>
                                    <button
                                        onClick={close}
                                        className="rounded-md border border-charcoal-600 px-4 py-2 text-sm text-ash-200 hover:bg-charcoal-800 transition-colors"
                                    >
                                        close
                                    </button>
                                </div>
                                {collectionId && (
                                    <button
                                        onClick={handleDelete}
                                        className="rounded-md border border-red-950/50 bg-red-950/10 px-4 py-2 text-sm text-red-400 hover:bg-red-950/30 hover:border-red-900/50 transition-colors"
                                    >
                                        delete
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}