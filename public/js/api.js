/**
 * api.js — Centralized API Client
 * 
 * All API calls go through this module. This means:
 * - JWT token is automatically attached to every authenticated request
 * - Error responses are handled consistently in one place
 * - If the token expires (401), the user is redirected to login
 * 
 * Usage:
 *   import: <script src="/js/api.js"></script>  (loaded before other scripts)
 *   call:   const data = await API.post('/api/auth/login', { email, password });
 */

const API = (() => {
    // ── Token Management ───────────────────────────────────────────
    const TOKEN_KEY = 'auth_token';
    const USER_KEY = 'auth_user';

    function getToken() {
        return localStorage.getItem(TOKEN_KEY);
    }

    function setToken(token) {
        localStorage.setItem(TOKEN_KEY, token);
    }

    function removeToken() {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
    }

    function getUser() {
        const raw = localStorage.getItem(USER_KEY);
        try {
            return raw ? JSON.parse(raw) : null;
        } catch {
            return null;
        }
    }

    function setUser(user) {
        localStorage.setItem(USER_KEY, JSON.stringify(user));
    }

    function isLoggedIn() {
        const token = getToken();
        if (!token) return false;

        // Check if token is expired by decoding the payload (JWT is base64)
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.exp * 1000 > Date.now();
        } catch {
            return false;
        }
    }

    /**
     * Get the token expiry time in milliseconds from now.
     * Returns 0 if no token or already expired.
     */
    function getTokenExpiresIn() {
        const token = getToken();
        if (!token) return 0;
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const remaining = payload.exp * 1000 - Date.now();
            return remaining > 0 ? remaining : 0;
        } catch {
            return 0;
        }
    }

    // ── Core Fetch Wrapper ─────────────────────────────────────────
    async function request(method, url, body = null) {
        const headers = {
            'Content-Type': 'application/json',
        };

        // Attach JWT token if the user is logged in
        const token = getToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const options = { method, headers };
        if (body) {
            options.body = JSON.stringify(body);
        }

        const response = await fetch(url, options);
        const data = await response.json();

        // If the server says 401, the token is invalid or expired
        if (response.status === 401 && token) {
            removeToken();
            // Only redirect if we're on a protected page (not login/register)
            const page = window.location.pathname;
            if (!page.includes('login') && !page.includes('register')) {
                window.location.href = '/login.html?expired=1';
            }
        }

        // Attach the HTTP status to the response data for callers to check
        data._status = response.status;
        data._ok = response.ok;

        return data;
    }

    // ── Convenience Methods ────────────────────────────────────────
    function get(url) {
        return request('GET', url);
    }

    function post(url, body) {
        return request('POST', url, body);
    }

    // ── Public API ─────────────────────────────────────────────────
    return {
        getToken,
        setToken,
        removeToken,
        getUser,
        setUser,
        isLoggedIn,
        getTokenExpiresIn,
        get,
        post,
    };
})();
