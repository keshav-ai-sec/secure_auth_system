/**
 * app.js — UI Helpers & Page Utilities
 *
 * Provides:
 * - Toast notifications (success, error, warning, info)
 * - Page guard (redirects unauthenticated users away from protected pages)
 * - Sidebar initialization and mobile toggle
 * - Session countdown timer
 * - Form loading state helpers
 */

const App = (() => {
    // ── Toast Notification System ──────────────────────────────────
    const TOAST_DURATION_MS = 4500;

    /**
     * Show a toast notification.
     * @param {'success'|'error'|'warning'|'info'} type
     * @param {string} title
     * @param {string} message
     */
    function showToast(type, title, message) {
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            container.className = 'toast-container';
            document.body.appendChild(container);
        }

        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️',
        };

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <span class="toast__icon">${icons[type] || 'ℹ️'}</span>
            <div class="toast__body">
                <div class="toast__title">${title}</div>
                <div class="toast__message">${message}</div>
            </div>
        `;

        // Click to dismiss
        toast.addEventListener('click', () => removeToast(toast));

        container.appendChild(toast);

        // Auto-dismiss after duration
        setTimeout(() => removeToast(toast), TOAST_DURATION_MS);
    }

    function removeToast(toast) {
        if (!toast || toast.classList.contains('removing')) return;
        toast.classList.add('removing');
        setTimeout(() => toast.remove(), 300);
    }

    // ── Page Guard ─────────────────────────────────────────────────
    /**
     * Call this on protected pages (dashboard, admin).
     * Redirects to login if the user is not authenticated.
     * @param {'admin'} [requiredRole] - Optional role requirement
     * @returns {object|null} The current user, or null if redirected
     */
    function requireAuth(requiredRole) {
        if (!API.isLoggedIn()) {
            window.location.href = '/login.html?expired=1';
            return null;
        }

        const user = API.getUser();

        if (requiredRole && user && user.role !== requiredRole) {
            return null; // Caller will handle showing access denied
        }

        return user;
    }

    /**
     * Call this on public pages (login, register).
     * Redirects to dashboard if the user is already logged in.
     */
    function redirectIfLoggedIn() {
        if (API.isLoggedIn()) {
            const user = API.getUser();
            if (user && user.role === 'admin') {
                window.location.href = '/admin.html';
            } else {
                window.location.href = '/dashboard.html';
            }
        }
    }

    // ── Button Loading State ───────────────────────────────────────
    function setLoading(button, loading) {
        if (loading) {
            button.classList.add('loading');
            button.disabled = true;
        } else {
            button.classList.remove('loading');
            button.disabled = false;
        }
    }

    // ── Sidebar Init ───────────────────────────────────────────────
    function initSidebar() {
        const user = API.getUser();
        if (!user) return;

        // Set user info in sidebar
        const avatarEl = document.getElementById('sidebar-avatar');
        const nameEl = document.getElementById('sidebar-user-name');
        const roleEl = document.getElementById('sidebar-user-role');

        if (avatarEl) avatarEl.textContent = user.username.charAt(0).toUpperCase();
        if (nameEl) nameEl.textContent = user.username;
        if (roleEl) roleEl.textContent = user.role;

        // Show/hide admin link based on role
        const adminLink = document.getElementById('nav-admin');
        if (adminLink) {
            adminLink.style.display = user.role === 'admin' ? 'flex' : 'none';
        }

        // Highlight current page in sidebar
        const currentPage = window.location.pathname.replace('/', '').replace('.html', '');
        document.querySelectorAll('.sidebar__nav-link').forEach(link => {
            const href = link.getAttribute('href') || '';
            if (href.includes(currentPage)) {
                link.classList.add('active');
            }
        });

        // Mobile toggle
        const toggleBtn = document.getElementById('mobile-toggle');
        const sidebar = document.querySelector('.sidebar');
        if (toggleBtn && sidebar) {
            toggleBtn.addEventListener('click', () => {
                sidebar.classList.toggle('open');
            });

            // Close sidebar when clicking outside on mobile
            document.addEventListener('click', (e) => {
                if (sidebar.classList.contains('open') &&
                    !sidebar.contains(e.target) &&
                    !toggleBtn.contains(e.target)) {
                    sidebar.classList.remove('open');
                }
            });
        }

        // Logout button
        const logoutBtn = document.getElementById('btn-logout');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                try {
                    await API.post('/api/auth/logout');
                } catch {
                    // Even if the API call fails, clear the token locally
                }
                API.removeToken();
                window.location.href = '/login.html';
            });
        }
    }

    // ── Session Countdown Timer ────────────────────────────────────
    let sessionInterval = null;

    function startSessionTimer() {
        const timeEl = document.getElementById('session-time');
        if (!timeEl) return;

        function update() {
            const remaining = API.getTokenExpiresIn();
            if (remaining <= 0) {
                timeEl.textContent = 'Expired';
                clearInterval(sessionInterval);
                showToast('warning', 'Session Expired', 'Your session has expired. Please log in again.');
                setTimeout(() => {
                    API.removeToken();
                    window.location.href = '/login.html?expired=1';
                }, 2000);
                return;
            }

            const minutes = Math.floor(remaining / 60000);
            const seconds = Math.floor((remaining % 60000) / 1000);
            timeEl.textContent = `${minutes}m ${seconds.toString().padStart(2, '0')}s`;
        }

        update();
        sessionInterval = setInterval(update, 1000);
    }

    // ── Password Strength Checker ──────────────────────────────────
    function checkPasswordStrength(password) {
        let score = 0;
        if (password.length >= 6) score++;
        if (password.length >= 10) score++;
        if (/[a-zA-Z]/.test(password) && /\d/.test(password)) score++;
        if (/[@$!%*?&]/.test(password)) score++;

        if (score <= 1) return { level: 'weak', label: 'Weak' };
        if (score <= 2) return { level: 'medium', label: 'Fair' };
        if (score <= 3) return { level: 'medium', label: 'Good' };
        return { level: 'strong', label: 'Strong' };
    }

    function updatePasswordStrength(password) {
        const bars = document.querySelectorAll('.password-strength__bar');
        const label = document.querySelector('.password-strength__label');
        if (!bars.length || !label) return;

        const strength = checkPasswordStrength(password);

        bars.forEach(bar => bar.className = 'password-strength__bar');

        if (password.length === 0) {
            label.textContent = '';
            return;
        }

        const levels = { weak: 1, medium: 2, strong: 4 };
        const count = levels[strength.level] || 0;

        for (let i = 0; i < Math.min(count, bars.length); i++) {
            bars[i].classList.add(strength.level);
        }

        label.textContent = strength.label;
    }

    // ── Check for Session Expired Query Param ──────────────────────
    function checkExpiredParam() {
        const params = new URLSearchParams(window.location.search);
        if (params.get('expired') === '1') {
            showToast('warning', 'Session Expired', 'Your session has expired. Please log in again.');
            // Clean the URL
            window.history.replaceState({}, '', window.location.pathname);
        }
    }

    // ── Public API ─────────────────────────────────────────────────
    return {
        showToast,
        requireAuth,
        redirectIfLoggedIn,
        setLoading,
        initSidebar,
        startSessionTimer,
        updatePasswordStrength,
        checkExpiredParam,
    };
})();
