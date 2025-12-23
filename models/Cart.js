const fs = require('fs');
const path = require('path');

const CART_FILE = path.join(__dirname, '../data/cart.json');
const DATA_DIR = path.join(__dirname, '../data');

// Helper: Read cart from file
function readCart() {
    try {
        const data = fs.readFileSync(CART_FILE, 'utf8');
        return JSON.parse(data || '[]');
    } catch (err) {
        return [];
    }
}

// Helper: Write cart to file
function writeCart(cart) {
    fs.writeFileSync(CART_FILE, JSON.stringify(cart, null, 2));
}

// Helper: Generate unique cart item ID
function generateCartItemId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Validation: Check required fields for cart item
function validateCartItem(item) {
    const errors = [];
    if (!item.mealId) {
        errors.push('Meal ID is required');
    }
    if (!item.name || item.name.trim() === '') {
        errors.push('Meal name is required');
    }
    if (item.price === undefined || item.price === null) {
        errors.push('Price is required');
    }
    if (isNaN(parseFloat(item.price))) {
        errors.push('Price must be a number');
    }
    if (!item.image) {
        errors.push('Image is required');
    }
    if (!item.quantity || item.quantity < 1) {
        errors.push('Quantity must be at least 1');
    }
    return errors;
}

// Validation: Check quantity for update
function validateQuantity(quantity) {
    if (quantity === undefined || quantity === null) {
        return ['Quantity is required'];
    }
    if (isNaN(parseInt(quantity)) || parseInt(quantity) < 1) {
        return ['Quantity must be at least 1'];
    }
    return [];
}

const Cart = {
    // Ensure data directory and file exist
    ensureDataExists() {
        if (!fs.existsSync(DATA_DIR)) {
            fs.mkdirSync(DATA_DIR, { recursive: true });
        }
        if (!fs.existsSync(CART_FILE)) {
            fs.writeFileSync(CART_FILE, JSON.stringify([], null, 2));
        }
    },

    // Get all cart items
    getAll() {
        return readCart();
    },

    // Find cart item by meal ID
    findByMealId(mealId) {
        const cart = readCart();
        return cart.find(item => item.mealId === mealId);
    },

    // Find cart item by cart item ID
    findById(id) {
        const cart = readCart();
        return cart.find(item => item.id === id);
    },

    // Add item to cart (or increase quantity if exists)
    addItem(itemData) {
        // Validate input
        const errors = validateCartItem(itemData);
        if (errors.length > 0) {
            return { success: false, errors };
        }

        const cart = readCart();

        // Check if item already exists
        const existingItemIndex = cart.findIndex(item => item.mealId === itemData.mealId);

        if (existingItemIndex !== -1) {
            // Update quantity
            cart[existingItemIndex].quantity += parseInt(itemData.quantity);
            writeCart(cart);
            return { success: true, cart, message: 'Quantity updated' };
        }

        // Add new item
        const cartItem = {
            id: generateCartItemId(),
            mealId: itemData.mealId,
            name: itemData.name,
            price: parseFloat(itemData.price),
            image: itemData.image,
            quantity: parseInt(itemData.quantity)
        };

        cart.push(cartItem);
        writeCart(cart);

        return { success: true, cart, item: cartItem, message: 'Item added to cart' };
    },

    // Remove item from cart
    removeItem(id) {
        const cart = readCart();
        const itemIndex = cart.findIndex(item => item.id === id);

        if (itemIndex === -1) {
            return { success: false, errors: ['Cart item not found'] };
        }

        cart.splice(itemIndex, 1);
        writeCart(cart);

        return { success: true, cart, message: 'Item removed from cart' };
    },

    // Update item quantity
    updateQuantity(id, quantity) {
        // Validate quantity
        const errors = validateQuantity(quantity);
        if (errors.length > 0) {
            return { success: false, errors };
        }

        const cart = readCart();
        const item = cart.find(item => item.id === id);

        if (!item) {
            return { success: false, errors: ['Cart item not found'] };
        }

        item.quantity = parseInt(quantity);
        writeCart(cart);

        return { success: true, cart, message: 'Cart item updated' };
    },

    // Clear entire cart
    clear() {
        writeCart([]);
        return { success: true, cart: [], message: 'Cart cleared' };
    }
};

module.exports = Cart;
