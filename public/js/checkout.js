// Get current user from localStorage
function getUser() {
    try {
        return JSON.parse(localStorage.getItem('user'));
    } catch (e) {
        return null;
    }
}

// Check if user is logged in
const user = getUser();
if (!user || !user.id) {
    showNotification('Please login to checkout', 'error');
    setTimeout(() => window.location.href = 'login.html', 1500);
}

// Get main DOM elements
const form = document.getElementById("checkoutForm");
const itemSummary = document.getElementById("itemSummary");
const totalEl = document.getElementById("total");
const paymentRadios = Array.from(document.querySelectorAll('input[name="payment"]'));
const cardFields = document.getElementById("cardFields");
const cardPreview = document.getElementById("cardPreview");

// Store cart items loaded from backend
let cartItems = [];

// Generic helper for calling backend APIs
async function apiCall(url, options = {}) {
    const res = await fetch(url, options);
    if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.error || error.message || 'Request failed');
    }
    return res.json();
}

// Prevent XSS by escaping user-generated text
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Load cart items from backend and render them
async function loadCartItems() {
    if (!user || !user.id) return;

    try {
        cartItems = await apiCall(`/api/cart/${user.id}`);

        // If cart is empty, redirect user
        if (cartItems.length === 0) {
            showNotification('Your cart is empty. Redirecting...', 'error');
            setTimeout(() => window.location.href = 'meals.html', 2000);
            return;
        }

        // Render cart items in checkout summary
        itemSummary.innerHTML = '';
        cartItems.forEach(item => {
            const li = document.createElement('li');
            li.dataset.name = item.name;
            li.dataset.price = item.price;
            li.dataset.quantity = item.quantity;
            li.innerHTML = `
                <span>${escapeHtml(item.name)} x${item.quantity}</span>
                <strong>${(item.price * item.quantity).toFixed(0)} EGP</strong>
            `;
            itemSummary.appendChild(li);
        });

        updateTotal();
    } catch (err) {
        showNotification('Failed to load cart items', 'error');
        itemSummary.innerHTML = '<li class="error-item">Failed to load cart</li>';
    }
}

// Calculate and update total price
function updateTotal() {
    const total = cartItems.reduce(
        (sum, item) => sum + (item.price || 0) * (item.quantity || 0),
        0
    );
    totalEl.textContent = `${total.toFixed(0)} EGP`;
}

// Mask credit card number in preview
const maskCard = (v) => {
    const d = v.replace(/\D/g, "");
    return !d
        ? "Enter card details to pay by credit card."
        : `Paying with card: ${d.replace(/.(?=.{4})/g, "•")}`;
};

// Show or hide card fields based on payment method
const togglePayment = () => {
    const method = paymentRadios.find((r) => r.checked)?.value;
    cardFields.classList.toggle("hidden", method !== "card");
    if (method !== "card") {
        cardPreview.textContent = "Paying with cash on delivery.";
    }
};

// Validate checkout form before submission
const validateForm = () => {
    const name = form.name.value.trim();
    const phone = form.phone.value.trim();
    const address = form.address.value.trim();
    const payment = paymentRadios.find((r) => r.checked)?.value;

    if (!name || !phone || !address) return "Name, phone, and address are required.";
    if (phone.replace(/\D/g, "").length < 7) return "Phone should be at least 7 digits.";
    if (!payment) return "Choose a payment method.";

    if (payment === "card") {
        const num = document.getElementById("cardNumber").value.trim();
        const exp = document.getElementById("cardExpiry").value.trim();
        const cvc = document.getElementById("cardCvc").value.trim();
        if (!num || !exp || !cvc) return "Enter card number, expiry, and CVC.";
    }

    return "";
};

// Handle checkout form submission
const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user || !user.id) {
        showNotification('Please login to place an order', 'error');
        return;
    }

    const error = validateForm();
    if (error) {
        showNotification(error, 'error');
        return;
    }

    try {
        if (cartItems.length === 0) {
            showNotification('Your cart is empty', 'error');
            return;
        }

        // Prepare order payload
        const payment = paymentRadios.find((r) => r.checked)?.value;
        const total = cartItems.reduce(
            (sum, item) => sum + (item.price || 0) * (item.quantity || 0),
            0
        );

        const payload = {
            userId: user.id,
            customer: {
                name: form.name.value.trim(),
                phone: form.phone.value.trim(),
                address: form.address.value.trim(),
                notes: form.notes.value.trim()
            },
            items: cartItems.map(item => ({
                mealId: item.mealId,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                sellerId: item.sellerId || null
            })),
            total,
            paymentMethod: payment
        };

        // Send order to backend
        const response = await apiCall('/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        // Clear user's cart after successful order
        await apiCall(`/api/cart/${user.id}`, { method: 'DELETE' });

        // Update navbar cart count
        if (typeof window.updateNavCartCount === 'function') {
            window.updateNavCartCount();
        }

        showNotification(`Order confirmed! ID: ${response.order.id}`, 'success');

        // Save order for tracking page
        localStorage.setItem("lastOrder", JSON.stringify(response.order));

        setTimeout(() => {
            window.location.href = "order-tracking.html";
        }, 2000);

    } catch (err) {
        showNotification('Error placing order: ' + err.message, 'error');
    }
};

// Event listeners
document.getElementById("cardNumber")
    ?.addEventListener("input", (e) => {
        cardPreview.textContent = maskCard(e.target.value);
    });

paymentRadios.forEach((r) => r.addEventListener("change", togglePayment));
form.addEventListener("submit", handleSubmit);

// Initial load
loadCartItems();
togglePayment();
