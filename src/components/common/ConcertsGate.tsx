import { useState } from "react";
import { Outlet } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

export default function ConcertsGate() {
    const { isConcertsAuthenticated, login, loginConcerts } = useAuth();
    const [password, setPassword] = useState("");
    const [hasError, setHasError] = useState(false);

    if (isConcertsAuthenticated) {
        return <Outlet />;
    }

    function handleSubmit() {
        if (!password.trim()) return;

        if (password === import.meta.env.VITE_SITE_PASSWORD) {
            login();
            return;
        }

        if (password === import.meta.env.VITE_CONCERTS_PASSWORD) {
            loginConcerts();
            return;
        }

        setHasError(true);
        setTimeout(() => setHasError(false), 1000);
    }

    return (
        <main
            className="flex h-screen w-full flex-col items-center justify-center animate-fade-in"
            style={{
                background:
                    "radial-gradient(ellipse at 50% 50%, hsl(20,6%,12%) 0%, hsl(20,8%,5%) 70%)",
            }}
        >
            <h1 className="font-serif text-[2.5rem] font-bold italic tracking-tight text-ash-50 mb-2">
                concerts
            </h1>

            <p className="mb-8 font-sans text-sm tracking-wide text-ash-300">
                a private screening room
            </p>

            <input
                type="password"
                placeholder="enter quietly"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === "Enter") handleSubmit();
                }}
                className={`
                    w-[280px]
                    rounded-sm
                    border-b-2
                    bg-charcoal-800/50
                    px-4
                    py-3
                    font-sans
                    text-sm
                    text-ash-50
                    placeholder:text-ash-400
                    focus:border-ember-500
                    focus:shadow-ember-glow
                    focus:outline-none
                    transition-all
                    duration-300
                    ${hasError
                        ? "animate-shake border-red-500"
                        : "border-charcoal-600"}
                `}
            />

            {hasError && (
                <p className="mt-2 text-xs text-ash-300">
                    ...
                </p>
            )}
        </main>
    );
}
