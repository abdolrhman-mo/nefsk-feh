// Kitchen page functionality - Seller features
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

    document.addEventListener('DOMContentLoaded', () => {
        // Load all data
        loadUserMeals();
        loadOrdersToFulfill();

        // Add meal form handler
        const addMealForm = document.getElementById('add-meal-form');
        if (addMealForm) {
            addMealForm.addEventListener('submit', handleAddMeal);
        }

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

    // Load user's meals
    async function loadUserMeals() {
        const container = document.getElementById('user-meals-container');
        if (!container) return;

        try {
            const meals = await apiCall(`/api/meals/user/${user.id}`);

            if (meals.length === 0) {
                container.innerHTML = '<p class="empty-message">You haven\'t added any meals yet.</p>';
                return;
            }

            container.innerHTML = meals.map(meal => `
                <div class="item meal-item" data-id="${meal.id}">
                    <img src="${meal.image || '/images/meals/profile.png'}" alt="${escapeHtml(meal.name)}" onerror="this.src='/images/meals/profile.png'">
                    <h4>${escapeHtml(meal.name)}</h4>
                    <p class="meal-price">${meal.price} EGP</p>
                    <p class="meal-description">${escapeHtml(meal.description || '')}</p>
                    <button class="delete-meal-btn" data-id="${meal.id}">Delete</button>
                </div>
            `).join('');

            // Add delete handlers
            container.querySelectorAll('.delete-meal-btn').forEach(btn => {
                btn.addEventListener('click', () => handleDeleteMeal(btn.dataset.id));
            });

        } catch (err) {
            container.innerHTML = '<p class="error-message">Failed to load meals</p>';
            console.error('Error loading meals:', err);
        }
    }

    // Handle add meal form submission
    async function handleAddMeal(e) {
        e.preventDefault();

        const name = document.getElementById('meal-name').value.trim();
        const description = document.getElementById('meal-description').value.trim();
        const price = document.getElementById('meal-price').value;
        const category = document.getElementById('meal-category').value;
        const imageInput = document.getElementById('meal-image');

        if (!name || !price) {
            showNotification('Please fill in meal name and price', 'error');
            return;
        }

        try {
            // For now, use a default image path (in a real app, you'd upload the file)
            let imagePath = '/images/meals/default.jpg';

            // If there's a file selected, we'd normally upload it
            // For this demo, we'll just use the filename
            if (imageInput.files && imageInput.files[0]) {
                imagePath = `/images/meals/${imageInput.files[0].name}`;
            }

            await apiCall('/api/meals', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    description,
                    price: parseFloat(price),
                    image: imagePath,
                    category: category,
                    userId: user.id
                })
            });

            showNotification('Meal added successfully!', 'success');

            // Reset form and reload meals
            e.target.reset();
            loadUserMeals();

        } catch (err) {
            showNotification('Failed to add meal: ' + err.message, 'error');
        }
    }

    // Handle meal deletion
    async function handleDeleteMeal(mealId) {
        if (!confirm('Are you sure you want to delete this meal?')) return;

        try {
            await apiCall(`/api/meals/${mealId}?userId=${user.id}`, {
                method: 'DELETE'
            });

            showNotification('Meal deleted successfully', 'success');
            loadUserMeals();

        } catch (err) {
            showNotification('Failed to delete meal: ' + err.message, 'error');
        }
    }

    // Load orders to fulfill (orders containing user's meals)
    async function loadOrdersToFulfill() {
        const tbody = document.getElementById('orders-to-fulfill-body');
        if (!tbody) return;

        try {
            const orders = await apiCall(`/api/orders/seller/${user.id}`);

            if (orders.length === 0) {
                tbody.innerHTML = '<tr><td colspan="3" class="empty-message">No orders to fulfill yet.</td></tr>';
                return;
            }

            tbody.innerHTML = orders.map(order => `
                <tr>
                    <td>${escapeHtml(order.customer?.name || 'N/A')}</td>
                    <td>
                        <ul class="fulfill-items">
                            ${order.items.map(item => `
                                <li>${escapeHtml(item.name)} x${item.quantity}</li>
                            `).join('')}
                        </ul>
                    </td>
                    <td><span class="badge ${getStatusClass(order.status)}">${order.status}</span></td>
                </tr>
            `).join('');

        } catch (err) {
            tbody.innerHTML = '<tr><td colspan="3" class="error-message">Failed to load orders</td></tr>';
            console.error('Error loading orders to fulfill:', err);
        }
    }
})();
