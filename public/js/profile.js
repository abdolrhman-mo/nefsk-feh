// Profile page functionality
(function() {
    // Check if user is logged in
    let user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
        window.location.href = 'login.html';
        return;
    }

    // API helper
    async function apiCall(url, options = {}) {
        const res = await fetch(url, options);
        if (!res.ok) {
            const error = await res.json().catch(() => ({}));
            throw new Error(error.error || error.message || 'Request failed');
        }
        return res.json();
    }

    // Escape HTML to prevent XSS
    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Format date for display
    function formatDate(dateString) {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    // Get status badge class
    function getStatusClass(status) {
        const classes = {
            'processing': 'badge-warning',
            'preparing': 'badge-warning',
            'enroute': 'badge-primary',
            'delivered': 'badge-success',
            'cancelled': 'badge-error'
        };
        return classes[status] || 'badge-primary';
    }

    // Update profile display with current user data
    function updateProfileDisplay() {
        document.getElementById('user-name').textContent = user.username || 'N/A';
        document.getElementById('user-email').textContent = user.email || 'N/A';
        document.getElementById('user-phone').textContent = user.phone || 'Not provided';
        document.getElementById('user-address').textContent = user.address || 'Not provided';
    }

    // Open edit profile modal
    function openEditModal() {
        const modal = document.getElementById('edit-profile-modal');
        document.getElementById('edit-username').value = user.username || '';
        document.getElementById('edit-email').value = user.email || '';
        document.getElementById('edit-phone').value = user.phone || '';
        document.getElementById('edit-address').value = user.address || '';
        modal.classList.remove('hidden');
    }

    // Close edit profile modal
    function closeEditModal() {
        document.getElementById('edit-profile-modal').classList.add('hidden');
    }

    // Handle profile update form submission
    async function handleUpdateProfile(e) {
        e.preventDefault();

        const username = document.getElementById('edit-username').value.trim();
        const email = document.getElementById('edit-email').value.trim();
        const phone = document.getElementById('edit-phone').value.trim();
        const address = document.getElementById('edit-address').value.trim();

        if (!username || !email) {
            showNotification('Username and email are required', 'error');
            return;
        }

        try {
            const response = await apiCall(`/api/auth/profile/${user.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, phone, address })
            });

            // Update localStorage with new user data
            user = response.user;
            localStorage.setItem('user', JSON.stringify(user));

            // Update profile display
            updateProfileDisplay();

            // Close modal and show success
            closeEditModal();
            showNotification('Profile updated successfully!', 'success');

        } catch (err) {
            showNotification('Failed to update profile: ' + err.message, 'error');
        }
    }

    document.addEventListener('DOMContentLoaded', () => {
        // Display user info from localStorage
        updateProfileDisplay();

        // Logout functionality
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', function() {
                localStorage.removeItem('user');
                window.location.href = 'home.html';
            });
        }

        // Update Info button handler - open modal
        const updateBtn = document.querySelector('.profile-update-btn');
        if (updateBtn) {
            updateBtn.addEventListener('click', openEditModal);
        }

        // Cancel button in modal
        const cancelBtn = document.getElementById('cancel-edit');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', closeEditModal);
        }

        // Click overlay to close modal
        const modalOverlay = document.querySelector('.modal-overlay');
        if (modalOverlay) {
            modalOverlay.addEventListener('click', closeEditModal);
        }

        // Edit profile form submission
        const editForm = document.getElementById('edit-profile-form');
        if (editForm) {
            editForm.addEventListener('submit', handleUpdateProfile);
        }

        // Load orders data
        loadMyOrders();

        // Collapsible sections toggle
        document.querySelectorAll('.section-header.collapsible').forEach(header => {
            header.addEventListener('click', () => {
                const targetId = header.dataset.target;
                const content = document.getElementById(targetId);
                const icon = header.querySelector('.toggle-icon');

                if (content) {
                    content.classList.toggle('collapsed');
                    icon.classList.toggle('rotated');
                }
            });
        });
    });

    // Load orders placed by user (My Orders)
    async function loadMyOrders() {
        const container = document.getElementById('my-orders-container');
        if (!container) return;

        try {
            const orders = await apiCall(`/api/orders/user/${user.id}`);

            if (orders.length === 0) {
                container.innerHTML = '<p class="empty-message">You haven\'t placed any orders yet.</p>';
                return;
            }

            container.innerHTML = orders.map(order => `
                <div class="order-card">
                    <div class="order-header">
                        <span class="order-date">${formatDate(order.createdAt)}</span>
                        <span class="badge ${getStatusClass(order.status)}">${order.status}</span>
                    </div>
                    <div class="order-details">
                        <p><strong>Items:</strong></p>
                        <ul class="order-items">
                            ${order.items.map(item => `
                                <li>${escapeHtml(item.name)} x${item.quantity} - ${item.price * item.quantity} EGP</li>
                            `).join('')}
                        </ul>
                        <p class="order-total"><strong>Total:</strong> ${order.total} EGP</p>
                        <p><strong>Payment:</strong> ${order.paymentMethod === 'card' ? 'Credit Card' : 'Cash on Delivery'}</p>
                    </div>
                </div>
            `).join('');

        } catch (err) {
            container.innerHTML = '<p class="error-message">Failed to load orders</p>';
            console.error('Error loading orders:', err);
        }
    }
})();
