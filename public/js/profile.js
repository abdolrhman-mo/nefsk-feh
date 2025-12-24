// Profile page functionality
(function() {
    // Check if user is logged in
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
        window.location.href = 'login.html';
        return;
    }

    document.addEventListener('DOMContentLoaded', () => {
        // Display user info from localStorage
        document.getElementById('user-name').textContent = user.username || 'N/A';
        document.getElementById('user-email').textContent = user.email || 'N/A';
        document.getElementById('user-address').textContent = user.address || 'Not provided';

        // Logout functionality
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', function() {
                localStorage.removeItem('user');
                window.location.href = 'home.html';
            });
        }

        // TODO: Load user's meals from API
        // loadUserMeals();

        // TODO: Load user's orders (orders they placed)
        // loadMyOrders();

        // TODO: Load orders to fulfill (orders containing user's meals)
        // loadOrdersToFulfill();
    });
})();
