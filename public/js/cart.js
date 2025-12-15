const elements = {
    cartContainer: document.getElementById('cartContainer'),
    emptyCart: document.getElementById('emptyCart'),
    cartSummary: document.getElementById('cartSummary'),
    totalPrice: document.getElementById('totalPrice'),
    checkoutBtn: document.getElementById('checkoutBtn')
};

async function apiCall(url, options = {}) {
    const res = await fetch(url, options);
    if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.error || 'Request failed');
    }
    return res.json();
}

function toggleCartVisibility(hasItems) {
    elements.emptyCart.classList.toggle('hidden', hasItems);
    elements.cartSummary.classList.toggle('hidden', !hasItems);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function createCartItemElement(item) {
    const div = document.createElement('div');
    div.className = 'cart-item';
    div.innerHTML = `<img src="${item.image || '/images/meals/profile.png'}" alt="${escapeHtml(item.name)}" class="cart-item-image" onerror="this.src='/images/meals/profile.png'"><div class="cart-item-info"><h3 class="cart-item-name">${escapeHtml(item.name)}</h3><div class="cart-item-price">${item.price} EGP each</div><div class="cart-item-controls"><div class="quantity-controls"><button class="quantity-btn decrease-btn" data-id="${item.id}">−</button><span class="quantity-display">${item.quantity}</span><button class="quantity-btn increase-btn" data-id="${item.id}">+</button></div><button class="remove-btn" data-id="${item.id}" title="Remove item"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg></button></div></div><div class="cart-item-total">${(item.price * item.quantity).toFixed(0)} EGP</div>`;
    return div;
}

async function loadCartItems() {
    try {
        const cart = await apiCall('/api/cart');
        toggleCartVisibility(cart.length > 0);
        elements.cartContainer.innerHTML = '';
        if (cart.length > 0) {
            cart.forEach(item => elements.cartContainer.appendChild(createCartItemElement(item)));
            const total = cart.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 0), 0);
            elements.totalPrice.textContent = `${total.toFixed(0)} EGP`;
        }
    } catch (err) {
        showNotification('Failed to load cart items', 'error');
        toggleCartVisibility(false);
    }
}

async function updateQuantity(itemId, change) {
    try {
        const cart = await apiCall('/api/cart');
        const item = cart.find(i => i.id === itemId);
        if (!item || (item.quantity + change) < 1) return;
        await apiCall(`/api/cart/${itemId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ quantity: item.quantity + change }) });
        await loadCartItems();
        showNotification('Cart updated', 'success');
    } catch (err) {
        showNotification('Failed to update quantity', 'error');
    }
}

async function removeItem(itemId) {
    try {
        await apiCall(`/api/cart/${itemId}`, { method: 'DELETE' });
        await loadCartItems();
        showNotification('Item removed from cart', 'success');
    } catch (err) {
        showNotification('Failed to remove item', 'error');
    }
}

elements.cartContainer.addEventListener('click', async (e) => {
    const btn = e.target.closest('.increase-btn, .decrease-btn, .remove-btn');
    if (!btn) return;
    const itemId = btn.dataset.id;
    if (btn.classList.contains('increase-btn')) await updateQuantity(itemId, 1);
    else if (btn.classList.contains('decrease-btn')) await updateQuantity(itemId, -1);
    else if (btn.classList.contains('remove-btn')) await removeItem(itemId);
});

elements.checkoutBtn.addEventListener('click', () => window.location.href = 'checkout.html');
loadCartItems();
