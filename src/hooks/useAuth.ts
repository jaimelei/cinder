const AUTH_KEY = "cinder_auth";
const CONCERTS_AUTH_KEY = "cinder_concerts_auth";

export function useAuth() {
    const isAuthenticated =
        localStorage.getItem(AUTH_KEY) === "true";

    const isConcertsAuthenticated =
        isAuthenticated || localStorage.getItem(CONCERTS_AUTH_KEY) === "true";

    function login() {
        localStorage.setItem(AUTH_KEY, "true");
    }

    function loginConcerts() {
        localStorage.setItem(CONCERTS_AUTH_KEY, "true");
    }

    function logout() {
        localStorage.removeItem(AUTH_KEY);
    }

    function logoutConcerts() {
        localStorage.removeItem(CONCERTS_AUTH_KEY);
    }

    return {
        isAuthenticated,
        isConcertsAuthenticated,
        login,
        loginConcerts,
        logout,
        logoutConcerts,
    };
}