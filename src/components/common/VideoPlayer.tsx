import { getEmbedUrl, getRelativeDate } from "../../lib/youtube";
import { usePlayer } from "../../hooks/usePlayer";
import { useEffect, useRef, useState } from "react";
import { deleteVideo } from "../../lib/api";
import type { CSSProperties } from "react";
import { useFocusable, FocusContext, setFocus } from "@noriginmedia/norigin-spatial-navigation";

const MINI_W = 320;
const MINI_H = Math.round(MINI_W * 9 / 16); // 180
const MINI_LEFT = 24;
const MINI_BOTTOM = 24;

const OPEN_CLOSE_MS = 260;

export default function VideoPlayer() {
    const { currentVideo, isOpen, isMinimized, collectionId, minimize, restore, close, startDeletingVideo, stopDeletingVideo } = usePlayer();
    const iframeWrapRef = useRef<HTMLDivElement>(null);
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const prevMinimized = useRef(isMinimized);
    const prevVideoId = useRef(currentVideo?.id);
    const pendingRectRef = useRef<DOMRect | null>(null);

    const [shouldRender, setShouldRender] = useState(false);
    const [animateIn, setAnimateIn] = useState(false);

    const [displayVideo, setDisplayVideo] = useState(currentVideo);

    const { ref: playerWrapRef, focusKey } = useFocusable({
        isFocusBoundary: true,
        focusable: isOpen,
    });

    const { ref: minimizeBtnRef, focused: minimizeFocused } = useFocusable({
        focusKey: "PLAYER_MINIMIZE",
        focusable: isOpen && !isMinimized,
        onEnterPress: handleMinimizeClick,
    });

    const { ref: closeBtnRef, focused: closeFocused } = useFocusable({
        focusKey: "PLAYER_CLOSE",
        focusable: isOpen && !isMinimized,
        onEnterPress: close,
    });

    const { ref: deleteBtnRef, focused: deleteFocused } = useFocusable({
        focusKey: "PLAYER_DELETE",
        focusable: isOpen && !isMinimized && !!collectionId,
        onEnterPress: handleDelete,
    });

    const { ref: restoreBtnRef, focused: restoreFocused } = useFocusable({
        focusKey: "PLAYER_RESTORE",
        focusable: isOpen && isMinimized,
        onEnterPress: handleRestoreClick,
    });

    const { ref: miniCloseBtnRef, focused: miniCloseFocused } = useFocusable({
        focusKey: "PLAYER_MINI_CLOSE",
        focusable: isOpen && isMinimized,
        onEnterPress: close,
    });

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

    // Handle initial focus to iframe controls when opened
    useEffect(() => {
        if (isOpen && !isMinimized) {
            const timer = setTimeout(() => {
                iframeRef.current?.focus();
            }, 600);
            return () => clearTimeout(timer);
        }
    }, [isOpen, isMinimized]);

    // Intercept Escape / Backspace for focus redirection and minimizing/closing
    useEffect(() => {
        function handleGlobalKeyDown(e: KeyboardEvent) {
            if (e.key === "Escape" || e.key === "Backspace") {
                if (isMinimized) {
                    close();
                    e.preventDefault();
                    return;
                }
                if (isOpen && !isMinimized) {
                    const isPlayerButtonFocused = minimizeFocused || closeFocused || deleteFocused;
                    if (isPlayerButtonFocused) {
                        handleMinimizeClick();
                    } else {
                        setFocus("PLAYER_MINIMIZE");
                    }
                    e.preventDefault();
                    e.stopPropagation();
                }
            }
        }
        window.addEventListener("keydown", handleGlobalKeyDown, { capture: true });
        return () => window.removeEventListener("keydown", handleGlobalKeyDown, { capture: true });
    }, [isOpen, isMinimized, close, setFocus, minimizeFocused, closeFocused, deleteFocused]);

    // FLIP animation between full ↔ mini
    useEffect(() => {
        const minimizedChanged = prevMinimized.current !== isMinimized;
        const videoChanged = prevVideoId.current !== currentVideo?.id;

        prevMinimized.current = isMinimized;
        prevVideoId.current = currentVideo?.id;

        const first = pendingRectRef.current;
        pendingRectRef.current = null;

        if (!minimizedChanged || videoChanged || !first) return;

        const el = iframeWrapRef.current;
        if (!el) return;

        requestAnimationFrame(() => {
            const last = el.getBoundingClientRect();

            const dx = first.left - last.left;
            const dy = first.top - last.top;
            const scaleX = first.width / last.width;
            const scaleY = first.height / last.height;

            if (dx === 0 && dy === 0 && scaleX === 1 && scaleY === 1) {
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
                el.removeEventListener("transitionend", handleEnd);
            };
            el.addEventListener("transitionend", handleEnd, { once: true });
        });
    }, [isMinimized, currentVideo?.id]);

    function handleMinimizeClick() {
        if (iframeWrapRef.current) {
            pendingRectRef.current = iframeWrapRef.current.getBoundingClientRect();
        }
        minimize();
    }

    function handleRestoreClick() {
        if (iframeWrapRef.current) {
            pendingRectRef.current = iframeWrapRef.current.getBoundingClientRect();
        }
        restore();
    }

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
        <FocusContext.Provider value={focusKey}>
            {/* backdrop — visible only in full mode, once opened */}
            <div
                className={`fixed inset-0 z-[70] bg-charcoal-950/85 backdrop-blur-md transition-opacity duration-300 ${showBackdrop ? "opacity-100" : "opacity-0 pointer-events-none"
                    }`}
                onClick={handleMinimizeClick}
            />

            {/* Single persistent player container */}
            <div
                ref={playerWrapRef}
                className="fixed z-[75] outline-none"
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
                            transform: "translate(-50%, -50%)",
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
                                ref={iframeRef}
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
                                ref={restoreBtnRef}
                                onClick={handleRestoreClick}
                                className={`truncate text-sm text-left flex-1 transition-colors outline-none rounded px-1 ${
                                    restoreFocused ? "border border-ember-500 ring-2 ring-ember-500/50 shadow-ember-glow text-ember-400" : "text-ash-100 hover:text-ash-50"
                                }`}
                            >
                                {displayVideo.title}
                            </button>
                            <button
                                ref={miniCloseBtnRef}
                                onClick={(e) => { e.stopPropagation(); close(); }}
                                className={`ml-3 flex-shrink-0 text-xs transition-colors outline-none px-1.5 py-0.5 rounded ${
                                    miniCloseFocused ? "border border-ember-500 ring-2 ring-ember-500/50 shadow-ember-glow text-ember-400" : "text-ash-300 hover:text-ash-100"
                                }`}
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
                                        ref={minimizeBtnRef}
                                        onClick={handleMinimizeClick}
                                        className={`rounded-md border px-4 py-2 text-sm transition-colors outline-none ${
                                            minimizeFocused ? "border-ember-500 ring-2 ring-ember-500/50 shadow-ember-glow text-ember-400" : "border-charcoal-600 text-ash-200 hover:bg-charcoal-800"
                                        }`}
                                    >
                                        minimize
                                    </button>
                                    <button
                                        ref={closeBtnRef}
                                        onClick={close}
                                        className={`rounded-md border px-4 py-2 text-sm transition-colors outline-none ${
                                            closeFocused ? "border-ember-500 ring-2 ring-ember-500/50 shadow-ember-glow text-ember-400" : "border-charcoal-600 text-ash-200 hover:bg-charcoal-800"
                                        }`}
                                    >
                                        close
                                    </button>
                                </div>
                                {collectionId && (
                                    <button
                                        ref={deleteBtnRef}
                                        onClick={handleDelete}
                                        className={`rounded-md border px-4 py-2 text-sm transition-colors outline-none ${
                                            deleteFocused ? "border-red-500 ring-2 ring-red-500/50 shadow-ember-glow text-red-400" : "border-red-950/50 bg-red-950/10 text-red-400 hover:bg-red-950/30 hover:border-red-900/50"
                                        }`}
                                    >
                                        delete
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </FocusContext.Provider>
    );
}