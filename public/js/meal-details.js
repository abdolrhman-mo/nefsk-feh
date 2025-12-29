// Cache DOM elements used on the meal details page
const elements = {
    mealImage: document.getElementById('mealImage'),
    mealCategory: document.getElementById('mealCategory'),
    mealName: document.getElementById('mealName'),
    sellerName: document.getElementById('sellerName'),
    mealDescription: document.getElementById('mealDescription'),
    mealPrice: document.getElementById('mealPrice'),
    totalPrice: document.getElementById('totalPrice'),
    quantityInput: document.getElementById('quantity'),
    increaseBtn: document.getElementById('increaseBtn'),
    decreaseBtn: document.getElementById('decreaseBtn'),
    addToCartBtn: document.getElementById('addToCartBtn'),
    cartBadge: document.getElementById('cartBadge')
};

// Get meal ID from URL query parameters
const mealId = new URLSearchParams(window.location.search).get('id');

// Get current user from localStorage
function getUser() {
    try {
        return JSON.parse(localStorage.getItem('user'));
    } catch (e) {
        return null;
    }
}

// Reusable helper for API requests
async function apiCall(url, options = {}) {
    const res = await fetch(url, options);
    if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.error || 'Request failed');
    }
    return res.json();
}

// Fetch cart data and update cart badge count
async function updateCartBadge() {
    const user = getUser();
    if (!user || !user.id) {
        if (elements.cartBadge) {
            elements.cartBadge.textContent = '0';
            elements.cartBadge.classList.add('hidden');
        }
        return;
    }

    try {
        const cart = await apiCall(`/api/cart/${user.id}`);
        const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);
        if (elements.cartBadge) {
            elements.cartBadge.textContent = totalItems;
            elements.cartBadge.classList.toggle('hidden', totalItems === 0);
        }
    } catch (err) {
        if (elements.cartBadge) {
            elements.cartBadge.textContent = '0';
            elements.cartBadge.classList.add('hidden');
        }
    }
}

// Load meal details and populate UI
async function loadMealInfo() {
    if (!mealId) {
        showNotification('No meal ID provided. Redirecting...', 'error');
        setTimeout(() => window.location.href = 'meals.html', 2000);
        elements.addToCartBtn.disabled = true;
        return;
    }
    try {
        let meal;
        try {
            meal = await apiCall(`/api/meals/${mealId}`);
        } catch (err) {
            const allMeals = await apiCall('/api/meals');
            meal = allMeals.find(m => m.id === parseInt(mealId) || m.id === mealId);
            if (!meal) {
                const popularMeals = await apiCall('/api/home/popular-meals');
                meal = popularMeals.find(m => m.id === parseInt(mealId) || m.id === mealId);
            }
            if (!meal) throw new Error('Meal not found');
        }

        // Fallback image handling
        const defaultImg = '/images/meals/profile.png';
        elements.mealImage.src = meal.image || defaultImg;
        elements.mealImage.alt = meal.name || 'Meal';
        elements.mealImage.onerror = () => elements.mealImage.src = defaultImg;

        // Populate meal data
        const category = meal.category || 'main';
        elements.mealCategory.textContent = category === 'main' ? 'Oriental' : category;
        elements.mealCategory.className = `meal-category ${category}`;
        elements.mealName.textContent = meal.name || 'Unknown Meal';
        elements.sellerName.textContent = meal.seller?.username || 'Unknown Chef';
        elements.mealDescription.textContent = meal.description || 'No description available.';
        elements.mealPrice.textContent = `${meal.price || 0} EGP`;

        // Store meal globally for cart usage
        window.meal = meal;

        // Set initial total price
        updateTotalPrice();
    } catch (err) {
        showNotification('Failed to load meal details: ' + err.message, 'error');
        elements.addToCartBtn.disabled = true;
        elements.mealName.textContent = 'Meal not found';
        elements.mealDescription.textContent = 'Please go back and select a valid meal.';
    }
}

// Update total price based on quantity
function updateTotalPrice() {
    if (!window.meal || !window.meal.price) return;
    const quantity = parseInt(elements.quantityInput.value) || 1;
    const total = window.meal.price * quantity;
    elements.totalPrice.textContent = `${total} EGP`;
}

// Update quantity while preventing values < 1
function updateQuantity(change) {
    const current = parseInt(elements.quantityInput.value) || 1;
    elements.quantityInput.value = Math.max(1, current + change);
    updateTotalPrice();
}

// Add selected meal to cart
async function handleAddToCart() {
    const user = getUser();
    if (!user || !user.id) {
        showNotification('Please login to add items to cart', 'error');
        setTimeout(() => window.location.href = 'login.html', 1500);
        return;
    }

    if (!window.meal) {
        showNotification('Meal information not loaded', 'error');
        return;
    }

    const quantity = parseInt(elements.quantityInput.value) || 1;
    if (isNaN(quantity) || quantity < 1) {
        showNotification('Invalid quantity', 'error');
        return;
    }

    try {
        await apiCall(`/api/cart/${user.id}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                mealId: window.meal.id,
                name: window.meal.name,
                price: window.meal.price,
                image: window.meal.image,
                quantity,
                sellerId: window.meal.userId || null // Include seller ID
            })
        });

        // Refresh cart badge and UI feedback
        await updateCartBadge();
        if (typeof window.updateNavCartCount === 'function') {
            window.updateNavCartCount();
        }
        showNotification(`${window.meal.name} added to cart!`, 'success');

        elements.addToCartBtn.textContent = 'Added!';
        elements.addToCartBtn.classList.add('added');

        setTimeout(() => {
            elements.addToCartBtn.textContent = 'Add to Cart';
            elements.addToCartBtn.classList.remove('added');
        }, 2000);
    } catch (err) {
        showNotification('Failed to add item to cart: ' + err.message, 'error');
    }
}

// Button event listeners
elements.increaseBtn.addEventListener('click', () => updateQuantity(1));
elements.decreaseBtn.addEventListener('click', () => updateQuantity(-1));
elements.addToCartBtn.addEventListener('click', handleAddToCart);

// Initial page setup
loadMealInfo();
updateCartBadge();
