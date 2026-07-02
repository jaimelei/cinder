import { createContext, useContext, useState } from "react";
import { Outlet, useParams } from "react-router-dom";
import { PlayerProvider } from "../../hooks/usePlayer";
import { useCollections } from "../../hooks/useCollections";
import SearchOverlay from "../common/SearchOverlay";
import VideoPlayer from "../common/VideoPlayer";

const SearchContext = createContext<{ onSearch: () => void }>({ onSearch: () => { } });
export const useSearch = () => useContext(SearchContext);

export default function AppLayout() {
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const { collection } = useParams();
    const { collections } = useCollections();

    const activeCollection = collections.find((c) => c.slug === collection);

    return (
        <PlayerProvider>
            <SearchContext.Provider value={{ onSearch: () => setIsSearchOpen(true) }}>
                <div className="relative min-h-screen">
                    <Outlet />
                    <VideoPlayer />
                    <SearchOverlay
                        isOpen={isSearchOpen}
                        onClose={() => setIsSearchOpen(false)}
                        collectionSlug={collection}
                        collectionId={activeCollection?.id}
                    />
                </div>
            </SearchContext.Provider>
        </PlayerProvider>
    );
}