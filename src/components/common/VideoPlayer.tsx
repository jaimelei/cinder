import { getEmbedUrl, getRelativeDate } from "../../lib/youtube";
import { usePlayer } from "../../hooks/usePlayer";
import { useEffect, useRef } from "react";

const MINI_W = 320;
const MINI_H = Math.round(MINI_W * 9 / 16); // 180
const MINI_LEFT = 24;
const MINI_BOTTOM = 60;

export default function VideoPlayer() {
    const { currentVideo, isOpen, isMinimized, minimize, restore, close } = usePlayer();
    const iframeWrapRef = useRef<HTMLDivElement>(null);
    const isFirstRender = useRef(true);

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        const el = iframeWrapRef.current;
        if (!el) return;

        const first = el.getBoundingClientRect();

        requestAnimationFrame(() => {
            const last = el.getBoundingClientRect();

            const dx = first.left - last.left;
            const dy = first.top - last.top;
            const scaleX = first.width / last.width;
            const scaleY = first.height / last.height;

            if (dx === 0 && dy === 0 && scaleX === 1 && scaleY === 1) return;

            el.style.transition = "none";
            el.style.transform = `translate(${dx}px, ${dy}px) scale(${scaleX}, ${scaleY})`;
            el.style.transformOrigin = "top left";

            el.getBoundingClientRect();

            el.style.transition = "transform 400ms cubic-bezier(0.4, 0, 0.2, 1)";
            el.style.transform = "translate(0, 0) scale(1, 1)";
        });
    }, [isMinimized]);

    if (!isOpen || !currentVideo) return null;

    return (
        <>
            {/* backdrop */}
            <div
                className={`fixed inset-0 z-[70] bg-charcoal-950/85 backdrop-blur-md transition-opacity duration-300 ${isMinimized ? "opacity-0 pointer-events-none" : "opacity-100"
                    }`}
                onClick={minimize}
            />

            {/* full mode — flex centered container */}
            {!isMinimized && (
                <div className="fixed inset-0 z-[75] flex flex-col items-center justify-center p-6 pointer-events-none overflow-hidden">
                    <div className="w-full max-w-4xl pointer-events-auto">
                        {/* iframe */}
                        <div
                            ref={iframeWrapRef}
                            className="w-full overflow-hidden rounded-t-xl border-x border-t border-charcoal-600"
                        >
                            <div className="aspect-video w-full">
                                <iframe
                                    src={getEmbedUrl(currentVideo.youtube_id)}
                                    title={currentVideo.title}
                                    allow="autoplay; encrypted-media; picture-in-picture"
                                    allowFullScreen
                                    className="h-full w-full"
                                />
                            </div>
                        </div>

                        {/* controls */}
                        <div className="rounded-b-xl border-x border-b border-charcoal-600 bg-charcoal-900 shadow-modal p-5 space-y-3">
                            <h2 className="font-serif text-xl text-ash-50 leading-snug">
                                {currentVideo.title}
                            </h2>
                            <div className="flex flex-wrap items-center gap-2 text-sm text-ash-300">
                                {currentVideo.channel_name && (
                                    <span>{currentVideo.channel_name}</span>
                                )}
                                {currentVideo.upload_date && (
                                    <>
                                        <span>·</span>
                                        <span>{getRelativeDate(currentVideo.upload_date)}</span>
                                    </>
                                )}
                            </div>
                            <div className="flex gap-3 pt-1">
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
                        </div>
                    </div>
                </div>
            )}

            {/* mini mode */}
            {isMinimized && (
                <div
                    className="fixed z-[75] overflow-hidden rounded-xl border border-charcoal-600 shadow-mini-player"
                    style={{
                        left: MINI_LEFT,
                        top: `calc(100dvh - ${MINI_BOTTOM + MINI_H}px)`,
                        width: MINI_W,
                    }}
                >
                    <div
                        ref={iframeWrapRef}
                        style={{ height: MINI_H }}
                    >
                        <iframe
                            src={getEmbedUrl(currentVideo.youtube_id)}
                            title={currentVideo.title}
                            allow="autoplay; encrypted-media; picture-in-picture"
                            allowFullScreen
                            className="h-full w-full"
                        />
                    </div>

                    <div className="flex items-center justify-between bg-charcoal-900 px-3 py-2">
                        <button
                            onClick={restore}
                            className="truncate text-sm text-ash-100 hover:text-ash-50 text-left flex-1 transition-colors"
                        >
                            {currentVideo.title}
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); close(); }}
                            className="ml-3 flex-shrink-0 text-xs text-ash-300 hover:text-ash-100 transition-colors"
                        >
                            ✕
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}