import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { COLLECTIONS } from "../../constants/collections";
import { useAuth } from "../../hooks/useAuth";

interface CornerNavProps {
    onSearch: () => void;
}

export default function CornerNav({
    onSearch,
}: CornerNavProps) {
    const [isOpen, setIsOpen] = useState(false);

    const location = useLocation();
    const navigate = useNavigate();
    const { logout } = useAuth();

    function handleLock() {
        logout();
        navigate("/");
    }

    return (
        <>
            {/* desktop */}
            <nav className="fixed bottom-6 right-6 z-50 hidden w-[180px] rounded-xl border border-charcoal-600 bg-charcoal-800/90 p-4 shadow-nav backdrop-blur-md md:block">
                <div className="flex flex-col gap-1">
                    {COLLECTIONS.map((collection) => {
                        const isActive = location.pathname === `/app/${collection.slug}`;

                        return (
                            <Link
                                key={collection.slug}
                                to={`/app/${collection.slug}`}
                                className={`rounded-sm px-3 py-1.5 text-[13px] tracking-widest transition-colors ${isActive
                                        ? "text-ash-50"
                                        : "text-ash-300 hover:bg-charcoal-700 hover:text-ash-50"
                                    }`}
                            >
                                {collection.name}
                            </Link>
                        );
                    })}
                </div>

                <div className="my-3 border-t border-charcoal-600" />

                <div className="flex flex-col gap-1 text-[13px] tracking-widest">
                    <button
                        onClick={onSearch}
                        className="rounded-sm px-3 py-1.5 text-left text-ash-300 transition hover:bg-charcoal-700 hover:text-ash-50"
                    >
                        search
                    </button>

                    <button className="rounded-sm px-3 py-1.5 text-left text-ash-300 transition hover:bg-charcoal-700 hover:text-ash-50">
                        sync
                    </button>

                    <button
                        onClick={handleLock}
                        className="rounded-sm px-3 py-1.5 text-left text-ash-300 transition hover:bg-charcoal-700 hover:text-ash-50"
                    >
                        lock
                    </button>
                </div>
            </nav>

            {/* mobile */}
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full border border-charcoal-600 bg-charcoal-800 shadow-nav md:hidden"
            >
                <span className="h-2 w-2 rounded-full bg-ember-500" />
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-50 bg-charcoal-900/95 backdrop-blur-md md:hidden">
                    <button
                        onClick={() => setIsOpen(false)}
                        className="absolute right-6 top-6 text-ash-300"
                    >
                        ×
                    </button>

                    <div className="flex h-full flex-col justify-center gap-3 px-8">
                        {COLLECTIONS.map((collection) => (
                            <Link
                                key={collection.slug}
                                to={`/app/${collection.slug}`}
                                onClick={() => setIsOpen(false)}
                                className="text-xl text-ash-100"
                            >
                                {collection.name}
                            </Link>
                        ))}

                        <div className="mt-6 border-t border-charcoal-600 pt-6">
                            <button
                                onClick={() => {
                                    setIsOpen(false);
                                    onSearch();
                                }}
                                className="block py-2 text-ash-300"
                            >
                                search
                            </button>

                            <button className="block py-2 text-ash-300">
                                sync
                            </button>

                            <button
                                onClick={handleLock}
                                className="block py-2 text-ash-300"
                            >
                                lock
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}