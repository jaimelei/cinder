import { createContext, useContext, useState, type ReactNode } from "react";

const AUTH_KEY = "cinder_auth";
const CONCERTS_AUTH_KEY = "cinder_concerts_auth";
const PANDORA_AUTH_KEY = "cinder_pandora_auth";

interface AuthContextValue {
    isAuthenticated: boolean;
    isConcertsAuthenticated: boolean;
    isPandoraAuthenticated: boolean;
    login: () => void;
    loginConcerts: () => void;
    loginPandora: () => void;
    logout: () => void;
    logoutConcerts: () => void;
    logoutPandora: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState(
        () => localStorage.getItem(AUTH_KEY) === "true"
    );
    const [isConcertsAuthed, setIsConcertsAuthed] = useState(
        () => localStorage.getItem(CONCERTS_AUTH_KEY) === "true"
    );
    const [isPandoraAuthed, setIsPandoraAuthed] = useState(
        () => localStorage.getItem(PANDORA_AUTH_KEY) === "true"
    );

    function login() {
        localStorage.setItem(AUTH_KEY, "true");
        setIsAuthenticated(true);
    }

    function loginConcerts() {
        localStorage.setItem(CONCERTS_AUTH_KEY, "true");
        setIsConcertsAuthed(true);
    }

    function loginPandora() {
        localStorage.setItem(PANDORA_AUTH_KEY, "true");
        setIsPandoraAuthed(true);
    }

    function logout() {
        localStorage.removeItem(AUTH_KEY);
        setIsAuthenticated(false);
    }

    function logoutConcerts() {
        localStorage.removeItem(AUTH_KEY);
        localStorage.removeItem(CONCERTS_AUTH_KEY);
        setIsAuthenticated(false);
        setIsConcertsAuthed(false);
    }

    function logoutPandora() {
        localStorage.removeItem(PANDORA_AUTH_KEY);
        setIsPandoraAuthed(false);
    }

    const isConcertsAuthenticated = isAuthenticated || isConcertsAuthed;
    const isPandoraAuthenticated = isPandoraAuthed;

    return (
        <AuthContext.Provider
            value={{
                isAuthenticated,
                isConcertsAuthenticated,
                isPandoraAuthenticated,
                login,
                loginConcerts,
                loginPandora,
                logout,
                logoutConcerts,
                logoutPandora,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
