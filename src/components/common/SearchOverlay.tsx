import { useEffect, useRef } from "react";
import VideoCard from "./VideoCard";
import { usePlayer } from "../../hooks/usePlayer";
import { useSearch } from "../../hooks/useSearch";
import type { Video } from "../../types";

interface SearchOverlayProps {
    isOpen: boolean;
    onClose: () => void;
    collectionSlug?: string;
    collectionId?: string;
}

export default function SearchOverlay({
    isOpen,
    onClose,
    collectionSlug,
    collectionId,
}: SearchOverlayProps) {
    const inputRef = useRef<HTMLInputElement>(null);

    const {
        query,
        setQuery,
        results,
        isLoading,
    } = useSearch(collectionId);

    const { openVideo } = usePlayer();

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        inputRef.current?.focus();

        function handleEscape(event: KeyboardEvent) {
            if (event.key === "Escape") {
                onClose();
            }
        }

        window.addEventListener("keydown", handleEscape);

        return () => {
            window.removeEventListener(
                "keydown",
                handleEscape
            );
        };
    }, [isOpen, onClose]);

    if (!isOpen) {
        return null;
    }

    function handleVideoClick(video: Video) {
        openVideo(
            video,
            collectionSlug ?? ""
        );

        onClose();
    }

    return (
        <div
            className="
        fixed
        inset-0
        z-[75]
        bg-charcoal-950/85
        backdrop-blur-md
        animate-fade-in
      "
            onClick={onClose}
        >
            <div
                className="
          mx-auto
          flex
          h-full
          max-w-5xl
          flex-col
          px-6
          pt-20
        "
                onClick={(e) => e.stopPropagation()}
            >
                <div
                    className="
            animate-drift-down
          "
                >
                    <input
                        ref={inputRef}
                        value={query}
                        onChange={(e) =>
                            setQuery(e.target.value)
                        }
                        placeholder="search."
                        className="
              w-full
              rounded-xl
              border
              border-charcoal-600
              bg-charcoal-800
              px-5
              py-4
              text-ash-50
              shadow-ember-glow
              outline-none
              animate-glow-pulse
            "
                    />

                    <p
                        className="
              mt-3
              text-center
              text-xs
              text-ash-400
            "
                    >
                        {collectionSlug
                            ? `searching in ${collectionSlug}`
                            : "searching all collections"}
                    </p>
                </div>

                <div
                    className="
            mt-8
            flex-1
            overflow-y-auto
          "
                >
                    {isLoading ? (
                        <div
                            className="
                grid
                grid-cols-1
                gap-4
                sm:grid-cols-2
              "
                        >
                            {Array.from({ length: 4 }).map(
                                (_, index) => (
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
                                )
                            )}
                        </div>
                    ) : results.length > 0 ? (
                        <div
                            className="
                grid
                grid-cols-1
                gap-4
                sm:grid-cols-2
              "
                        >
                            {results.map((video) => (
                                <VideoCard
                                    key={video.id}
                                    video={video}
                                    onClick={() =>
                                        handleVideoClick(video)
                                    }
                                />
                            ))}
                        </div>
                    ) : (
                        query.length >= 2 && (
                            <div
                                className="
                  mt-16
                  text-center
                  font-serif
                  text-lg
                  text-ash-300
                "
                            >
                                nothing found
                            </div>
                        )
                    )}
                </div>
            </div>
        </div>
    );
}