import { createContext, useContext, useState } from "react";
import { Outlet, useParams } from "react-router-dom";
import { PlayerProvider } from "../../hooks/usePlayer";
import SearchOverlay from "../common/SearchOverlay";
import VideoPlayer from "../common/VideoPlayer";

const SearchContext = createContext<{ onSearch: () => void }>({ onSearch: () => { } });
export const useSearch = () => useContext(SearchContext);

export default function AppLayout() {
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const { collection } = useParams();

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
                    />
                </div>
            </SearchContext.Provider>
        </PlayerProvider>
    );
}