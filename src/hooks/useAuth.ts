const AUTH_KEY = "cinder_auth";

export function useAuth() {
    const isAuthenticated =
        localStorage.getItem(AUTH_KEY) === "true";

    function login() {
        localStorage.setItem(AUTH_KEY, "true");
    }

    function logout() {
        localStorage.removeItem(AUTH_KEY);
    }

    return {
        isAuthenticated,
        login,
        logout,
    };
}