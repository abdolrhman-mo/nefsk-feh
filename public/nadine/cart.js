// DOM Elements
const cartContainer = document.getElementById('cartContainer');
const emptyCart = document.getElementById('emptyCart');
const cartSummary = document.getElementById('cartSummary');
const totalPrice = document.getElementById('totalPrice');
const checkoutBtn = document.getElementById('checkoutBtn');

// Consistent cooked meal image
const MEAL_IMAGE_URL = 'https://www.budgetbytes.com/wp-content/uploads/2024/06/Grilled-Chicken-Overhead-500x500.jpg';

// Initialize page
function init() {
    loadCartItems();
    setupEventListeners();
}

// Load cart items from localStorage
function loadCartItems() {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart = ensureLatestImage(cart);
    
    if (cart.length === 0) {
        showEmptyCart();
        return;
    }
    
    hideEmptyCart();
    renderCartItems(cart);
    updateTotal();
}

// Render cart items
function renderCartItems(cart) {
    cartContainer.innerHTML = '';
    
    cart.forEach((item, index) => {
        const itemElement = createCartItemElement(item, index);
        cartContainer.appendChild(itemElement);
    });
}

// Create cart item element
function createCartItemElement(item, index) {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'cart-item';
    itemDiv.dataset.index = index;
    
    const itemTotal = item.price * item.quantity;
    
    itemDiv.innerHTML = `
        <img src="${item.image}" alt="${item.name}" class="cart-item-image">
        <div class="cart-item-info">
            <h3 class="cart-item-name">${item.name}</h3>
            <div class="cart-item-price">₹${item.price} each</div>
            <div class="cart-item-controls">
                <div class="quantity-controls">
                    <button class="quantity-btn decrease-btn" data-index="${index}">−</button>
                    <span class="quantity-display">${item.quantity}</span>
                    <button class="quantity-btn increase-btn" data-index="${index}">+</button>
                </div>
                <button class="remove-btn" data-index="${index}" title="Remove item">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                </button>
            </div>
        </div>
        <div class="cart-item-total">₹${itemTotal}</div>
    `;
    
    return itemDiv;
}

// Setup event listeners
function setupEventListeners() {
    // Delegate events for dynamically created buttons
    cartContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('increase-btn') || e.target.closest('.increase-btn')) {
            const btn = e.target.classList.contains('increase-btn') ? e.target : e.target.closest('.increase-btn');
            const index = parseInt(btn.dataset.index);
            updateQuantity(index, 1);
        } else if (e.target.classList.contains('decrease-btn') || e.target.closest('.decrease-btn')) {
            const btn = e.target.classList.contains('decrease-btn') ? e.target : e.target.closest('.decrease-btn');
            const index = parseInt(btn.dataset.index);
            updateQuantity(index, -1);
        } else if (e.target.classList.contains('remove-btn') || e.target.closest('.remove-btn')) {
            const btn = e.target.classList.contains('remove-btn') ? e.target : e.target.closest('.remove-btn');
            const index = parseInt(btn.dataset.index);
            removeItem(index);
        }
    });
    
    checkoutBtn.addEventListener('click', handleCheckout);
}

// Update quantity
function updateQuantity(index, change) {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    if (cart[index]) {
        cart[index].quantity += change;
        
        // Ensure quantity is at least 1
        if (cart[index].quantity < 1) {
            cart[index].quantity = 1;
        }
        
        // Save to localStorage
        localStorage.setItem('cart', JSON.stringify(cart));
        
        // Re-render cart
        loadCartItems();
    }
}

// Remove item
function removeItem(index) {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    cart.splice(index, 1);
    
    // Save to localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Re-render cart
    loadCartItems();
}

// Update total price
function updateTotal() {
    const cart = ensureLatestImage(JSON.parse(localStorage.getItem('cart')) || []);
    
    const total = cart.reduce((sum, item) => {
        return sum + (item.price * item.quantity);
    }, 0);
    
    totalPrice.textContent = `₹${total}`;
    
    // Show summary if cart has items
    if (cart.length > 0) {
        cartSummary.classList.remove('hidden');
    } else {
        cartSummary.classList.add('hidden');
    }
}

// Show empty cart message
function showEmptyCart() {
    emptyCart.classList.remove('hidden');
    cartSummary.classList.add('hidden');
}

// Hide empty cart message
function hideEmptyCart() {
    emptyCart.classList.add('hidden');
    cartSummary.classList.remove('hidden');
}

// Handle checkout
function handleCheckout() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }

    const checkoutUrl = '../melissia/checkout.html';
    const trackingUrl = '../melissia/order-tracking.html';

    window.open(trackingUrl, '_blank');
    window.location.href = checkoutUrl;
}

// Ensure every cart item uses the latest cooked meal image
function ensureLatestImage(cart) {
    let updated = false;
    const normalizedCart = cart.map(item => {
        if (!item.image || item.image !== MEAL_IMAGE_URL) {
            updated = true;
            return { ...item, image: MEAL_IMAGE_URL };
        }
        return item;
    });

    if (updated) {
        localStorage.setItem('cart', JSON.stringify(normalizedCart));
    }

    return normalizedCart;
}

// Initialize on page load
init();

