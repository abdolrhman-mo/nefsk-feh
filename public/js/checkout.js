const form = document.getElementById("checkoutForm");
const itemSummary = document.getElementById("itemSummary");
const totalEl = document.getElementById("total");
const paymentRadios = Array.from(document.querySelectorAll('input[name="payment"]'));
const cardFields = document.getElementById("cardFields");
const cardPreview = document.getElementById("cardPreview");
let cartItems = [];

async function apiCall(url, options = {}) {
    const res = await fetch(url, options);
    if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.error || 'Request failed');
    }
    return res.json();
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

async function loadCartItems() {
    try {
        cartItems = await apiCall('/api/cart');
        if (cartItems.length === 0) {
            showNotification('Your cart is empty. Redirecting...', 'error');
            setTimeout(() => window.location.href = 'meals.html', 2000);
            return;
        }
        itemSummary.innerHTML = '';
        cartItems.forEach(item => {
            const li = document.createElement('li');
            li.dataset.name = item.name;
            li.dataset.price = item.price;
            li.dataset.quantity = item.quantity;
            li.innerHTML = `<span>${escapeHtml(item.name)} x${item.quantity}</span><strong>${(item.price * item.quantity).toFixed(0)} EGP</strong>`;
            itemSummary.appendChild(li);
        });
        updateTotal();
    } catch (err) { showNotification('Failed to load cart items', 'error'); itemSummary.innerHTML = '<li class="error-item">Failed to load cart</li>'; }
}

function updateTotal() {
    const total = cartItems.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 0), 0);
    totalEl.textContent = `${total.toFixed(0)} EGP`;
}

const maskCard = (v) => {
    const d = v.replace(/\D/g, "");
    return !d ? "Enter card details to pay by credit card." : `Paying with card: ${d.replace(/.(?=.{4})/g, "•")}`;
};

const togglePayment = () => {
    const method = paymentRadios.find((r) => r.checked)?.value;
    cardFields.classList.toggle("hidden", method !== "card");
    if (method !== "card") cardPreview.textContent = "Paying with cash on delivery.";
};

const validateForm = () => {
    const name = form.name.value.trim(), phone = form.phone.value.trim(), address = form.address.value.trim(), payment = paymentRadios.find((r) => r.checked)?.value;
    if (!name || !phone || !address) return "Name, phone, and address are required.";
    if (phone.replace(/\D/g, "").length < 7) return "Phone should be at least 7 digits.";
    if (!payment) return "Choose a payment method.";
    if (payment === "card") {
        const num = document.getElementById("cardNumber").value.trim(), exp = document.getElementById("cardExpiry").value.trim(), cvc = document.getElementById("cardCvc").value.trim();
        if (!num || !exp || !cvc) return "Enter card number, expiry, and CVC.";
    }
    return "";
};

const handleSubmit = async (e) => {
    e.preventDefault();
    const error = validateForm();
    if (error) { showNotification(error, 'error'); return; }
    try {
        if (cartItems.length === 0) { showNotification('Your cart is empty', 'error'); return; }
        const payment = paymentRadios.find((r) => r.checked)?.value;
        const total = cartItems.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 0), 0);
        const cardNum = document.getElementById("cardNumber"), cardExp = document.getElementById("cardExpiry"), cardCvc = document.getElementById("cardCvc");
        const payload = {
            customer: { name: form.name.value.trim(), phone: form.phone.value.trim(), address: form.address.value.trim(), notes: form.notes.value.trim() },
            items: cartItems.map(item => ({ name: item.name, price: item.price, quantity: item.quantity, mealId: item.mealId })),
            total: total, paymentMethod: payment,
            card: payment === "card" ? { number: cardNum.value.trim(), expiry: cardExp.value.trim(), cvc: cardCvc.value.trim() } : null,
            status: 'processing'
        };
        const order = await apiCall('/api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        for (const item of cartItems) await apiCall(`/api/cart/${item.id}`, { method: 'DELETE' });
        showNotification(`Order confirmed! ID: ${order.id}`, 'success');
        localStorage.setItem("lastOrder", JSON.stringify(order));
        setTimeout(() => window.location.href = "order-tracking.html", 2000);
    } catch (err) { showNotification('Error placing order: ' + err.message, 'error'); }
};
document.getElementById("cardNumber")?.addEventListener("input", (e) => cardPreview.textContent = maskCard(e.target.value));
paymentRadios.forEach((r) => r.addEventListener("change", togglePayment));
form.addEventListener("submit", handleSubmit);
loadCartItems();
togglePayment();
