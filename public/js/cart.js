const elements = {
    cartContainer: document.getElementById('cartContainer'),
    emptyCart: document.getElementById('emptyCart'),
    cartSummary: document.getElementById('cartSummary'),
    totalPrice: document.getElementById('totalPrice'),
    checkoutBtn: document.getElementById('checkoutBtn')
};

async function apiCall(url, options = {}) {
    const res = await fetch(url, options);
    if (!res.ok) throw new Error('Request failed');
    return res.json();
}

function toggleCartVisibility(hasItems) {
    elements.emptyCart.classList.toggle('hidden', hasItems);
    elements.cartSummary.classList.toggle('hidden', !hasItems);
}

function createCartItemElement(item) {
    const div = document.createElement('div');
    div.className = 'cart-item';
    div.innerHTML = `<img src="${item.image}" alt="${item.name}" class="cart-item-image"><div class="cart-item-info"><h3 class="cart-item-name">${item.name}</h3><div class="cart-item-price">₹${item.price} each</div><div class="cart-item-controls"><div class="quantity-controls"><button class="quantity-btn decrease-btn" data-id="${item.id}">−</button><span class="quantity-display">${item.quantity}</span><button class="quantity-btn increase-btn" data-id="${item.id}">+</button></div><button class="remove-btn" data-id="${item.id}" title="Remove item"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg></button></div></div><div class="cart-item-total">₹${item.price * item.quantity}</div>`;
    return div;
}

async function loadCartItems() {
    try {
        const cart = await apiCall('/api/cart');
        toggleCartVisibility(cart.length > 0);
        elements.cartContainer.innerHTML = '';
        if (cart.length > 0) {
            cart.forEach(item => elements.cartContainer.appendChild(createCartItemElement(item)));
            elements.totalPrice.textContent = `₹${cart.reduce((sum, item) => sum + item.price * item.quantity, 0)}`;
        }
    } catch (err) {
        alert('Failed to load cart items');
        toggleCartVisibility(false);
    }
}

async function updateQuantity(itemId, change) {
    try {
        const cart = await apiCall('/api/cart');
        const item = cart.find(i => i.id === itemId);
        if (!item || item.quantity + change < 1) return;
        await apiCall(`/api/cart/${itemId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ quantity: item.quantity + change })
        });
        await loadCartItems();
    } catch (err) {
        alert('Failed to update quantity');
    }
}

async function removeItem(itemId) {
    try {
        await apiCall(`/api/cart/${itemId}`, { method: 'DELETE' });
        await loadCartItems();
    } catch (err) {
        alert('Failed to remove item');
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

elements.checkoutBtn.addEventListener('click', async () => {
    try {
        const cart = await apiCall('/api/cart');
        if (cart.length === 0) return alert('Your cart is empty!');
        window.open('order-tracking.html', '_blank');
        window.location.href = 'checkout.html';
    } catch (err) {
        alert('Failed to proceed to checkout');
    }
});

loadCartItems();
