// Check if user is logged in
const user = JSON.parse(localStorage.getItem('user'));
if (!user) {
    window.location.href = 'login.html';
}

// Display user info from localStorage
if (user) {
    document.addEventListener('DOMContentLoaded', () => {
        document.getElementById('user-name').textContent = user.username || 'N/A';
        document.getElementById('user-email').textContent = user.email || 'N/A';
        document.getElementById('user-address').textContent = user.address || 'Not provided';
    });
}

// Logout functionality
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('logout-btn').addEventListener('click', function() {
        localStorage.removeItem('user');
        window.location.href = 'login.html';
    });
});
