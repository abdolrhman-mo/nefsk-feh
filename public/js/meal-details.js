const elements = {
    mealImage: document.getElementById('mealImage'),
    mealName: document.getElementById('mealName'),
    mealDescription: document.getElementById('mealDescription'),
    mealPrice: document.getElementById('mealPrice'),
    quantityInput: document.getElementById('quantity'),
    increaseBtn: document.getElementById('increaseBtn'),
    decreaseBtn: document.getElementById('decreaseBtn'),
    addToCartBtn: document.getElementById('addToCartBtn'),
    cartBadge: document.getElementById('cartBadge')
};

const mealId = new URLSearchParams(window.location.search).get('id');

async function apiCall(url, options = {}) {
    const res = await fetch(url, options);
    if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.error || 'Request failed');
    }
    return res.json();
}

async function updateCartBadge() {
    try {
        const cart = await apiCall('/api/cart');
        const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);
        if (elements.cartBadge) {
            elements.cartBadge.textContent = totalItems;
            elements.cartBadge.classList.toggle('hidden', totalItems === 0);
        }
    } catch (err) {
        if (elements.cartBadge) { elements.cartBadge.textContent = '0'; elements.cartBadge.classList.add('hidden'); }
    }
}

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
        const defaultImg = '/images/meals/profile.png';
        elements.mealImage.src = meal.image || defaultImg;
        elements.mealImage.alt = meal.name || 'Meal';
        elements.mealImage.onerror = () => elements.mealImage.src = defaultImg;
        elements.mealName.textContent = meal.name || 'Unknown Meal';
        elements.mealDescription.textContent = meal.description || 'No description available.';
        elements.mealPrice.textContent = `${meal.price || 0} EGP`;
        window.meal = meal;
    } catch (err) {
        showNotification('Failed to load meal details: ' + err.message, 'error');
        elements.addToCartBtn.disabled = true;
        elements.mealName.textContent = 'Meal not found';
        elements.mealDescription.textContent = 'Please go back and select a valid meal.';
    }
}

function updateQuantity(change) {
    const current = parseInt(elements.quantityInput.value) || 1;
    elements.quantityInput.value = Math.max(1, current + change);
}

async function handleAddToCart() {
    if (!window.meal) { showNotification('Meal information not loaded', 'error'); return; }
    const quantity = parseInt(elements.quantityInput.value) || 1;
    if (isNaN(quantity) || quantity < 1) { showNotification('Invalid quantity', 'error'); return; }
    try {
        await apiCall('/api/cart', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mealId: window.meal.id, name: window.meal.name, price: window.meal.price, image: window.meal.image, quantity }) });
        await updateCartBadge();
        showNotification(`${window.meal.name} added to cart!`, 'success');
        elements.addToCartBtn.textContent = 'Added!';
        elements.addToCartBtn.classList.add('added');
        setTimeout(() => { elements.addToCartBtn.textContent = 'Add to Cart'; elements.addToCartBtn.classList.remove('added'); }, 2000);
    } catch (err) {
        showNotification('Failed to add item to cart: ' + err.message, 'error');
    }
}

elements.increaseBtn.addEventListener('click', () => updateQuantity(1));
elements.decreaseBtn.addEventListener('click', () => updateQuantity(-1));
elements.addToCartBtn.addEventListener('click', handleAddToCart);
loadMealInfo();
updateCartBadge();

