// Check if user is logged in
const user = JSON.parse(localStorage.getItem('user'));
if (!user) {
    window.location.href = 'login.html';
}

// Display user name from localStorage
if (user) {
    document.addEventListener('DOMContentLoaded', () => {
        document.getElementById('user-name').textContent = user.username;
    });
}

// Logout functionality
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('logout-btn').addEventListener('click', function() {
        localStorage.removeItem('user');
        window.location.href = 'login.html';
    });
});
