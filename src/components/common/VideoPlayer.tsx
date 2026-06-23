import { getEmbedUrl, getRelativeDate } from "../../lib/youtube";
import { usePlayer } from "../../hooks/usePlayer";

export default function VideoPlayer() {
    const { currentVideo, isOpen, isMinimized, minimize, restore, close } = usePlayer();

    if (!isOpen || !currentVideo) return null;

    return (
        <>
            {/* single iframe — always mounted, just repositioned */}
            <div
                className={`
          fixed z-[75] overflow-hidden rounded-xl border border-charcoal-600
          transition-all duration-300 ease-in-out
          ${isMinimized
                        ? "bottom-6 left-6 w-[320px]"
                        : "inset-[50%] translate-x-[-50%] translate-y-[-50%] w-full max-w-5xl"
                    }
        `}
            >
                <div className="aspect-video">
                    <iframe
                        src={getEmbedUrl(currentVideo.youtube_id)}
                        title={currentVideo.title}
                        allow="autoplay; encrypted-media"
                        allowFullScreen
                        className="h-full w-full"
                    />
                </div>
            </div>

            {/* backdrop — only in full mode */}
            {!isMinimized && (
                <div className="fixed inset-0 z-[70] bg-charcoal-950/85 backdrop-blur-md animate-fade-in" />
            )}

            {/* controls — only in full mode */}
            {!isMinimized && (
                <div className="fixed inset-0 z-[76] flex items-center justify-center pointer-events-none">
                    <div className="w-full max-w-5xl pointer-events-auto">
                        <div className="aspect-video" /> {/* spacer to push controls below iframe */}
                        <div className="rounded-b-xl border-x border-b border-charcoal-600 bg-charcoal-900 shadow-modal space-y-3 p-5">
                            <h2 className="font-serif text-xl text-ash-50">{currentVideo.title}</h2>
                            <div className="flex flex-wrap items-center gap-2 text-sm text-ash-300">
                                {currentVideo.channel_name && <span>{currentVideo.channel_name}</span>}
                                {currentVideo.upload_date && (
                                    <><span>·</span><span>{getRelativeDate(currentVideo.upload_date)}</span></>
                                )}
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button onClick={minimize} className="rounded-md border border-charcoal-600 px-4 py-2 text-sm text-ash-200 hover:bg-charcoal-800">minimize</button>
                                <button onClick={close} className="rounded-md border border-charcoal-600 px-4 py-2 text-sm text-ash-200 hover:bg-charcoal-800">close</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* mini player restore + close buttons */}
            {isMinimized && (
                <div className="fixed bottom-6 left-6 z-[76] w-[320px]">
                    <div className="aspect-video" /> {/* spacer */}
                    <div className="flex items-center justify-between rounded-b-xl border-x border-b border-charcoal-600 bg-charcoal-900 p-3">
                        <button onClick={restore} className="truncate text-sm text-ash-100">{currentVideo.title}</button>
                        <button onClick={(e) => { e.stopPropagation(); close(); }} className="ml-3 text-xs text-ash-300 hover:text-ash-100">✕</button>
                    </div>
                </div>
            )}
        </>
    );
}