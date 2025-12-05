// Sample meal object
const meal = {
    id: 1,
    name: "Grilled Chicken Plate",
    description: "Perfectly seasoned grilled chicken with vegetables and herbs.",
    price: 120,
    image: "https://www.budgetbytes.com/wp-content/uploads/2024/06/Grilled-Chicken-Overhead-500x500.jpg"
};

// DOM Elements
const mealImage = document.getElementById('mealImage');
const mealName = document.getElementById('mealName');
const mealDescription = document.getElementById('mealDescription');
const mealPrice = document.getElementById('mealPrice');
const quantityInput = document.getElementById('quantity');
const increaseBtn = document.getElementById('increaseBtn');
const decreaseBtn = document.getElementById('decreaseBtn');
const addToCartBtn = document.getElementById('addToCartBtn');
const cartBadge = document.getElementById('cartBadge');

// Initialize page
function init() {
    loadMealInfo();
    updateCartBadge();
    setupEventListeners();
}

// Load meal information into the page
function loadMealInfo() {
    mealImage.src = meal.image;
    mealImage.alt = meal.name;
    mealName.textContent = meal.name;
    mealDescription.textContent = meal.description;
    mealPrice.textContent = `₹${meal.price}`;
}

// Setup event listeners
function setupEventListeners() {
    increaseBtn.addEventListener('click', () => {
        const currentQty = parseInt(quantityInput.value);
        quantityInput.value = currentQty + 1;
    });

    decreaseBtn.addEventListener('click', () => {
        const currentQty = parseInt(quantityInput.value);
        if (currentQty > 1) {
            quantityInput.value = currentQty - 1;
        }
    });

    addToCartBtn.addEventListener('click', handleAddToCart);
}

// Handle Add to Cart
function handleAddToCart() {
    const quantity = parseInt(quantityInput.value);
    
    // Get existing cart from localStorage
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // Check if meal already exists in cart
    const existingItemIndex = cart.findIndex(item => item.id === meal.id);
    
    if (existingItemIndex !== -1) {
        // Increase quantity if item exists
        cart[existingItemIndex].quantity += quantity;
    } else {
        // Add new item to cart
        cart.push({
            id: meal.id,
            name: meal.name,
            description: meal.description,
            price: meal.price,
            image: meal.image,
            quantity: quantity
        });
    }
    
    // Save to localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Update cart badge
    updateCartBadge();
    
    // Show "added!" animation
    addToCartBtn.textContent = 'Added!';
    addToCartBtn.classList.add('added');
    
    setTimeout(() => {
        addToCartBtn.textContent = 'Add to Cart';
        addToCartBtn.classList.remove('added');
    }, 2000);
}

// Update cart badge
function updateCartBadge() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    if (totalItems > 0) {
        cartBadge.textContent = totalItems;
        cartBadge.classList.remove('hidden');
    } else {
        cartBadge.classList.add('hidden');
    }
}

// Initialize on page load
init();

