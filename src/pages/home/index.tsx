import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CollectionCard from "./components/CollectionCard";
import { COLLECTIONS } from "../../constants/collections";
import { useCollections } from "../../hooks/useCollections";
import { useAuth } from "../../hooks/useAuth";
import { useSearch } from "../../components/layout/AppLayout";

const STAGGER_MS = 80;
type SyncState = "idle" | "loading" | "success" | "error";

export default function Home() {
    const { collections, isLoading } = useCollections();
    const [visibleCount, setVisibleCount] = useState(0);
    const [syncState, setSyncState] = useState<SyncState>("idle");
    const { logout } = useAuth();
    const { onSearch } = useSearch();
    const navigate = useNavigate();

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
        <main className="flex flex-col h-full px-page pt-8 pb-6 overflow-hidden">
            {/* header */}
            <header className="flex items-center justify-between mb-8 flex-shrink-0">
                <span className="font-serif text-2xl text-ash-50">cinder</span>

                <div className="flex items-center gap-3 text-sm text-ash-300">
                    <button
                        onClick={handleSync}
                        disabled={syncState === "loading"}
                        className={`rounded-md border px-3 py-1 text-xs transition-colors ${syncColor}`}
                    >
                        {syncLabel}
                    </button>

                    <button onClick={onSearch} className="hover:text-ash-50 transition-colors">
                        search
                    </button>

                    <button onClick={handleLock} className="hover:text-ash-50 transition-colors">
                        lock
                    </button>
                </div>
            </header>

            {/* grid */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-3">
                {mergedCollections.slice(0, visibleCount).map((collection, index) => (
                    <CollectionCard
                        key={collection.slug}
                        collection={collection}
                        videoCount={collection.video_count}
                        index={index}
                    />
                ))}
            </div>
        </main>
    );
}