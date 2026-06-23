// route: /

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";

export default function PasswordGate() {
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [hasError, setHasError] = useState(false);

    const navigate = useNavigate();
    const { login } = useAuth();

    async function handleSubmit() {
        if (!password.trim() || isLoading) return;

        try {
            setIsLoading(true);

            if (
                password === import.meta.env.VITE_SITE_PASSWORD
            ) {
                login();
                navigate("/app");
                return;
            }

            throw new Error();
        } catch {
            setHasError(true);

            setTimeout(() => {
                setHasError(false);
            }, 1000);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="flex flex-col items-center">
            <input
                type="password"
                placeholder="enter quietly"
                value={password}
                disabled={isLoading}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === "Enter") {
                        handleSubmit();
                    }
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
          ${isLoading ? "opacity-50" : ""}
        `}
            />

            {hasError && (
                <p className="mt-2 text-xs text-ash-300">
                    ...
                </p>
            )}
        </div>
    );
}