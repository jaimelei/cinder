import { useState } from "react";
import { Outlet, useParams } from "react-router-dom";
import { PlayerProvider } from "../../hooks/usePlayer";
import SearchOverlay from "../common/SearchOverlay";
import VideoPlayer from "../common/VideoPlayer";
import CornerNav from "./CornerNav";

export default function AppLayout() {
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    const { collection } = useParams();

    return (
        <PlayerProvider>
            <div className="relative min-h-screen">
                <Outlet />

                <CornerNav
                    onSearch={() => setIsSearchOpen(true)}
                />

                <VideoPlayer />

                <SearchOverlay
                    isOpen={isSearchOpen}
                    onClose={() => setIsSearchOpen(false)}
                    collectionSlug={collection}
                />
            </div>
        </PlayerProvider>
    );
}