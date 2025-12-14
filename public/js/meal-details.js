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
    if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || 'Request failed');
    return res.json();
}

async function updateCartBadge() {
    try {
        const cart = await apiCall('/api/cart');
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
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

async function loadMealInfo() {
    if (!mealId) {
        alert('No meal ID provided. Please select a meal from the menu.');
        elements.addToCartBtn.disabled = true;
        return;
    }
    try {
        const meal = await apiCall(`/api/meals/${mealId}`);
        elements.mealImage.src = meal.image;
        elements.mealImage.alt = meal.name;
        elements.mealName.textContent = meal.name;
        elements.mealDescription.textContent = meal.description;
        elements.mealPrice.textContent = `₹${meal.price}`;
        window.meal = meal;
    } catch (err) {
        alert('Failed to load meal details: ' + err.message);
        elements.addToCartBtn.disabled = true;
        elements.mealName.textContent = 'Meal not found';
        elements.mealDescription.textContent = 'Please go back and select a valid meal.';
    }
}

function updateQuantity(change) {
    elements.quantityInput.value = Math.max(1, parseInt(elements.quantityInput.value) + change);
}

async function handleAddToCart() {
    if (!window.meal) return alert('Meal information not loaded');
    const quantity = parseInt(elements.quantityInput.value);
    if (isNaN(quantity) || quantity < 1) return alert('Invalid quantity');

    try {
        await apiCall('/api/cart', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                mealId: window.meal.id,
                name: window.meal.name,
                price: window.meal.price,
                image: window.meal.image,
                quantity
            })
        });
        await updateCartBadge();
        elements.addToCartBtn.textContent = 'Added!';
        elements.addToCartBtn.classList.add('added');
        setTimeout(() => {
            elements.addToCartBtn.textContent = 'Add to Cart';
            elements.addToCartBtn.classList.remove('added');
        }, 2000);
    } catch (err) {
        alert('Failed to add item to cart: ' + err.message);
    }
}

elements.increaseBtn.addEventListener('click', () => updateQuantity(1));
elements.decreaseBtn.addEventListener('click', () => updateQuantity(-1));
elements.addToCartBtn.addEventListener('click', handleAddToCart);

loadMealInfo();
updateCartBadge();
