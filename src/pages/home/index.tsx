import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CollectionCard from "./components/CollectionCard";
import { COLLECTIONS } from "../../constants/collections";
import { useCollections } from "../../hooks/useCollections";
import { useAuth } from "../../hooks/useAuth";
import { useSearch } from "../../components/layout/AppLayout";
import { useFocusable, FocusContext, setFocus } from "@noriginmedia/norigin-spatial-navigation";

const STAGGER_MS = 80;
type SyncState = "idle" | "loading" | "success" | "error";

const FIRST_COLLECTION_KEY = "FIRST_COLLECTION";

/* ── header buttons (must be a child component so useFocusable registers
      under the page's FocusContext, not the root) ───────────────────── */

interface HomeHeaderProps {
    syncLabel: string;
    syncColor: string;
    syncState: SyncState;
    onSync: () => void;
    onSearch: () => void;
    onLock: () => void;
}

function HomeHeader({ syncLabel, syncColor, syncState, onSync, onSearch, onLock }: HomeHeaderProps) {
    const { ref: syncRef, focused: syncFocused } = useFocusable({
        focusKey: "HOME_SYNC",
        onEnterPress: onSync,
    });

    const { ref: searchRef, focused: searchFocused } = useFocusable({
        focusKey: "HOME_SEARCH",
        onEnterPress: onSearch,
    });

    const { ref: lockRef, focused: lockFocused } = useFocusable({
        focusKey: "HOME_LOCK",
        onEnterPress: onLock,
    });

    return (
        <header className="flex items-center justify-between mb-8 flex-shrink-0">
            <span className="font-serif text-2xl text-ash-50">cinder</span>

            <div className="flex items-center gap-3 text-sm text-ash-300">
                <button
                    ref={syncRef}
                    onClick={onSync}
                    disabled={syncState === "loading"}
                    className={`rounded-md border px-3 py-1 text-xs transition-colors outline-none ${syncColor} ${
                        syncFocused ? "border-ember-500 ring-2 ring-ember-500/50 shadow-ember-glow text-ember-400" : ""
                    }`}
                >
                    {syncLabel}
                </button>

                <button
                    ref={searchRef}
                    onClick={onSearch}
                    className={`hover:text-ash-50 transition-colors outline-none px-2 py-0.5 rounded ${
                        searchFocused ? "border border-ember-500 ring-2 ring-ember-500/50 shadow-ember-glow text-ember-400" : ""
                    }`}
                >
                    search
                </button>

                <button
                    ref={lockRef}
                    onClick={onLock}
                    className={`hover:text-ash-50 transition-colors outline-none px-2 py-0.5 rounded ${
                        lockFocused ? "border border-ember-500 ring-2 ring-ember-500/50 shadow-ember-glow text-ember-400" : ""
                    }`}
                >
                    lock
                </button>
            </div>
        </header>
    );
}

/* ── page ────────────────────────────────────────────────────────────── */

export default function Home() {
    const { collections, isLoading } = useCollections();
    const [visibleCount, setVisibleCount] = useState(0);
    const [syncState, setSyncState] = useState<SyncState>("idle");
    const { logout } = useAuth();
    const { onSearch } = useSearch();
    const navigate = useNavigate();

    const { ref: homeRef, focusKey } = useFocusable({
        isFocusBoundary: true,
        focusable: false,
    });

    useEffect(() => {
        if (!isLoading && visibleCount > 0) {
            setFocus(FIRST_COLLECTION_KEY);
        }
    }, [isLoading, visibleCount]);

    useEffect(() => {
        if (isLoading) {
            setVisibleCount(0);
            return;
        }
        if (visibleCount >= COLLECTIONS.length) return;
        const timer = setTimeout(() => {
            setVisibleCount((v) => v + 1);
        }, STAGGER_MS);
        return () => clearTimeout(timer);
    }, [isLoading, visibleCount]);

    async function handleSync() {
        if (syncState === "loading") return;
        setSyncState("loading");
        try {
            const res = await fetch("/api/sync", { method: "POST" });
            setSyncState(res.ok ? "success" : "error");
        } catch {
            setSyncState("error");
        } finally {
            setTimeout(() => setSyncState("idle"), 3000);
        }
    }

    function handleLock() {
        logout();
        navigate("/");
    }

    const syncLabel =
        syncState === "loading" ? "syncing..." :
            syncState === "success" ? "synced" :
                syncState === "error" ? "failed" :
                    "sync";

    const syncColor =
        syncState === "success" ? "border-ember-400 text-ember-400" :
            syncState === "error" ? "border-red-400 text-red-400" :
                "border-charcoal-600 text-ash-300";

    const mergedCollections = COLLECTIONS.map((meta) => {
        const dbCollection = collections.find((c) => c.slug === meta.slug);
        return { ...meta, ...dbCollection };
    });

    return (
        <FocusContext.Provider value={focusKey}>
            <main ref={homeRef} className="flex flex-col h-full px-page pt-8 pb-6 overflow-hidden">
                {/* header */}
                <HomeHeader
                    syncLabel={syncLabel}
                    syncColor={syncColor}
                    syncState={syncState}
                    onSync={handleSync}
                    onSearch={onSearch}
                    onLock={handleLock}
                />

                {/* grid */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-3">
                    {mergedCollections.slice(0, visibleCount).map((collection, index) => (
                        <CollectionCard
                            key={collection.slug}
                            collection={collection}
                            videoCount={collection.video_count}
                            index={index}
                            focusKey={index === 0 ? FIRST_COLLECTION_KEY : undefined}
                        />
                    ))}
                </div>
            </main>
        </FocusContext.Provider>
    );
}