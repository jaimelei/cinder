import {
    createContext,
    useContext,
    useState,
    type ReactNode,
} from "react";
import type { Video } from "../types";

interface PlayerContextValue {
    currentVideo: Video | null;
    collectionSlug: string | null;
    isMinimized: boolean;
    isOpen: boolean;
    openVideo: (
        video: Video,
        collectionSlug: string
    ) => void;
    minimize: () => void;
    restore: () => void;
    close: () => void;
}

const PlayerContext = createContext<PlayerContextValue | null>(
    null
);

export function PlayerProvider({
    children,
}: {
    children: ReactNode;
}) {
    const [currentVideo, setCurrentVideo] =
        useState<Video | null>(null);

    const [collectionSlug, setCollectionSlug] =
        useState<string | null>(null);

    const [isMinimized, setIsMinimized] =
        useState(false);

    function openVideo(
        video: Video,
        collectionSlug: string
    ) {
        setCurrentVideo(video);
        setCollectionSlug(collectionSlug);
        setIsMinimized(false);
    }

    function minimize() {
        setIsMinimized(true);
    }

    function restore() {
        setIsMinimized(false);
    }

    function close() {
        setCurrentVideo(null);
        setCollectionSlug(null);
        setIsMinimized(false);
    }

    return (
        <PlayerContext.Provider
    value= {{
        currentVideo,
            collectionSlug,
            isMinimized,
            isOpen: currentVideo !== null,
                openVideo,
                minimize,
                restore,
                close,
    }
}
  >
    { children }
    </PlayerContext.Provider>
);
}

export function usePlayer() {
    const context = useContext(PlayerContext);

    if (!context) {
        throw new Error(
            "usePlayer must be used within PlayerProvider"
        );
    }

    return context;
}