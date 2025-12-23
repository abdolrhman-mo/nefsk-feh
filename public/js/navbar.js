// Navbar injection and management
(function() {
    // Get current user from localStorage
    function getUser() {
        try {
            return JSON.parse(localStorage.getItem('user'));
        } catch (e) {
            return null;
        }
    }

    // Generate navbar HTML
    function generateNavbarHTML() {
        const user = getUser();

        return `
        <nav class="navbar">
            <div class="nav-left">
                <span class="logo-text"><a href="home.html">Nefsk Feeh</a></span>
                <ul class="menu">
                    <li><a href="home.html">Home</a></li>
                    <li><a href="meals.html">All Meals</a></li>
                </ul>
            </div>
            <div class="nav-right">
                ${user ? `
                    <span class="user-greeting">Welcome, ${escapeHtml(user.username)}!</span>
                    <a href="cook-dashboard.html" class="btn-dashboard">Dashboard</a>
                    <button id="nav-logout-btn" class="btn-logout">Logout</button>
                ` : `
                    <a href="login.html" class="btn-signin">Sign In</a>
                    <a href="register.html" class="btn-signup">Sign Up</a>
                `}
                <a href="cart.html" class="cart-link">
                    <span class="cart-icon">&#128722;</span>
                    <span class="cart-count" id="navCartCount">0</span>
                </a>
            </div>
        </nav>
        `;
    }

    // Escape HTML to prevent XSS
    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Inject navbar into page
    function injectNavbar() {
        const container = document.getElementById('navbar-container');
        if (container) {
            container.innerHTML = generateNavbarHTML();
            setupLogoutHandler();
            updateCartCount();
        }
    }

    // Setup logout button handler
    function setupLogoutHandler() {
        const logoutBtn = document.getElementById('nav-logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', function() {
                localStorage.removeItem('user');
                window.location.href = 'home.html';
            });
        }
    }

    // Update cart count from API
    function updateCartCount() {
        fetch('/api/cart')
            .then(res => res.json())
            .then(cart => {
                if (Array.isArray(cart)) {
                    const count = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);
                    const countEl = document.getElementById('navCartCount');
                    if (countEl) {
                        countEl.textContent = count;
                    }
                }
            })
            .catch(() => {
                // Silently fail - cart count will show 0
            });
    }

    // Auto-inject navbar when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', injectNavbar);
    } else {
        injectNavbar();
    }

    // Expose functions globally for external use
    window.updateNavCartCount = updateCartCount;
    window.refreshNavbar = injectNavbar;
})();
