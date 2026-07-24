import { createContext, useContext, useState, type ReactNode } from "react";

const AUTH_KEY = "cinder_auth";
const CONCERTS_AUTH_KEY = "cinder_concerts_auth";

interface AuthContextValue {
    isAuthenticated: boolean;
    isConcertsAuthenticated: boolean;
    login: () => void;
    loginConcerts: () => void;
    logout: () => void;
    logoutConcerts: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState(
        () => localStorage.getItem(AUTH_KEY) === "true"
    );
    const [isConcertsAuthed, setIsConcertsAuthed] = useState(
        () => localStorage.getItem(CONCERTS_AUTH_KEY) === "true"
    );

    function login() {
        localStorage.setItem(AUTH_KEY, "true");
        setIsAuthenticated(true);
    }

    function loginConcerts() {
        localStorage.setItem(CONCERTS_AUTH_KEY, "true");
        setIsConcertsAuthed(true);
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

    const isConcertsAuthenticated = isAuthenticated || isConcertsAuthed;

    return (
        <AuthContext.Provider
            value={{
                isAuthenticated,
                isConcertsAuthenticated,
                login,
                loginConcerts,
                logout,
                logoutConcerts,
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
