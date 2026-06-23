const AUTH_KEY = "cinder_auth";

export function useAuth() {
    const isAuthenticated =
        sessionStorage.getItem(AUTH_KEY) === "true";

    function login() {
        sessionStorage.setItem(AUTH_KEY, "true");
    }

    function logout() {
        sessionStorage.removeItem(AUTH_KEY);
    }

    return {
        isAuthenticated,
        login,
        logout,
    };
}