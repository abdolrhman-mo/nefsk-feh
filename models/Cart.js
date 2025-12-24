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
    if (!item.userId) {
        errors.push('User ID is required');
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

    // Get all cart items (for admin/debug purposes)
    getAll() {
        return readCart();
    },

    // Get cart items for a specific user
    getByUserId(userId) {
        const cart = readCart();
        const userIdNum = parseInt(userId);
        return cart.filter(item => item.userId === userIdNum);
    },

    // Find cart item by meal ID for a specific user
    findByMealIdAndUser(mealId, userId) {
        const cart = readCart();
        const userIdNum = parseInt(userId);
        return cart.find(item =>
            item.mealId === mealId && item.userId === userIdNum
        );
    },

    // Find cart item by cart item ID for a specific user
    findByIdAndUser(id, userId) {
        const cart = readCart();
        const userIdNum = parseInt(userId);
        return cart.find(item => item.id === id && item.userId === userIdNum);
    },

    // Add item to user's cart (or increase quantity if exists)
    addItem(userId, itemData) {
        // Add userId to itemData for validation
        const itemWithUser = { ...itemData, userId };

        // Validate input
        const errors = validateCartItem(itemWithUser);
        if (errors.length > 0) {
            return { success: false, errors };
        }

        const cart = readCart();
        const userIdNum = parseInt(userId);

        // Check if item already exists in this user's cart
        const existingItemIndex = cart.findIndex(item =>
            item.mealId === itemData.mealId && item.userId === userIdNum
        );

        if (existingItemIndex !== -1) {
            // Update quantity
            cart[existingItemIndex].quantity += parseInt(itemData.quantity);
            writeCart(cart);
            const userCart = cart.filter(item => item.userId === userIdNum);
            return { success: true, cart: userCart, message: 'Quantity updated' };
        }

        // Add new item
        const cartItem = {
            id: generateCartItemId(),
            userId: userIdNum,
            mealId: itemData.mealId,
            name: itemData.name,
            price: parseFloat(itemData.price),
            image: itemData.image,
            quantity: parseInt(itemData.quantity),
            sellerId: itemData.sellerId ? parseInt(itemData.sellerId) : null
        };

        cart.push(cartItem);
        writeCart(cart);

        const userCart = cart.filter(item => item.userId === userIdNum);
        return { success: true, cart: userCart, item: cartItem, message: 'Item added to cart' };
    },

    // Remove item from user's cart
    removeItem(userId, itemId) {
        const cart = readCart();
        const userIdNum = parseInt(userId);

        const itemIndex = cart.findIndex(item =>
            item.id === itemId && item.userId === userIdNum
        );

        if (itemIndex === -1) {
            return { success: false, errors: ['Cart item not found'] };
        }

        cart.splice(itemIndex, 1);
        writeCart(cart);

        const userCart = cart.filter(item => item.userId === userIdNum);
        return { success: true, cart: userCart, message: 'Item removed from cart' };
    },

    // Update item quantity in user's cart
    updateQuantity(userId, itemId, quantity) {
        // Validate quantity
        const errors = validateQuantity(quantity);
        if (errors.length > 0) {
            return { success: false, errors };
        }

        const cart = readCart();
        const userIdNum = parseInt(userId);

        const item = cart.find(item =>
            item.id === itemId && item.userId === userIdNum
        );

        if (!item) {
            return { success: false, errors: ['Cart item not found'] };
        }

        item.quantity = parseInt(quantity);
        writeCart(cart);

        const userCart = cart.filter(item => item.userId === userIdNum);
        return { success: true, cart: userCart, message: 'Cart item updated' };
    },

    // Clear user's entire cart
    clearByUserId(userId) {
        const cart = readCart();
        const userIdNum = parseInt(userId);

        const filteredCart = cart.filter(item => item.userId !== userIdNum);
        writeCart(filteredCart);

        return { success: true, cart: [], message: 'Cart cleared' };
    },

    // Clear entire cart (all users - for admin/testing)
    clear() {
        writeCart([]);
        return { success: true, cart: [], message: 'All carts cleared' };
    }
};

module.exports = Cart;
