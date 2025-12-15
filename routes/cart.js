const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();

// Path to cart storage file
const CART_FILE = path.join(__dirname, '../data/cart.json');

// Ensure data directory and cart file exist
if (!fs.existsSync(path.join(__dirname, '../data'))) {
    fs.mkdirSync(path.join(__dirname, '../data'));
}
if (!fs.existsSync(CART_FILE)) {
    fs.writeFileSync(CART_FILE, JSON.stringify([], null, 2));
}

// Helper: read cart from file
function readCart() {
    try {
        const data = fs.readFileSync(CART_FILE, 'utf8');
        return JSON.parse(data || '[]');
    } catch (err) {
        return [];
    }
}

// Helper: write cart to file
function writeCart(cart) {
    fs.writeFileSync(CART_FILE, JSON.stringify(cart, null, 2));
}

// Helper function to generate unique cart item ID
function generateCartItemId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// GET /api/cart - Get all cart items
router.get('/', (req, res) => {
    try {
        const cart = readCart();
        res.json(cart);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch cart' });
    }
});

// POST /api/cart - Add item to cart
router.post('/', (req, res) => {
    try {
        const { mealId, name, price, image, quantity } = req.body;

        // Validate required fields
        if (!mealId || !name || price === undefined || !image || !quantity) {
            return res.status(400).json({
                error: 'Missing required fields: mealId, name, price, image, quantity'
            });
        }

        let cart = readCart();

        // Check if item already exists in cart (by mealId)
        const existingItemIndex = cart.findIndex(item => item.mealId === mealId);

        if (existingItemIndex !== -1) {
            // Update quantity if item exists
            cart[existingItemIndex].quantity += parseInt(quantity);
        } else {
            // Add new item to cart
            const cartItem = {
                id: generateCartItemId(),
                mealId: mealId,
                name: name,
                price: parseFloat(price),
                image: image,
                quantity: parseInt(quantity)
            };
            cart.push(cartItem);
        }

        writeCart(cart);

        res.status(201).json({ message: 'Item added to cart', cart });
    } catch (err) {
        res.status(500).json({ error: 'Failed to add item to cart' });
    }
});

// DELETE /api/cart/:id - Remove item from cart by cart item ID
router.delete('/:id', (req, res) => {
    try {
        const cartItemId = req.params.id;
        let cart = readCart();

        const itemIndex = cart.findIndex(item => item.id === cartItemId);

        if (itemIndex === -1) {
            return res.status(404).json({ error: 'Cart item not found' });
        }

        cart.splice(itemIndex, 1);
        writeCart(cart);

        res.json({ message: 'Item removed from cart', cart });
    } catch (err) {
        res.status(500).json({ error: 'Failed to remove item from cart' });
    }
});

// PUT /api/cart/:id - Update cart item quantity
router.put('/:id', (req, res) => {
    try {
        const cartItemId = req.params.id;
        const { quantity } = req.body;

        if (quantity === undefined || quantity < 1) {
            return res.status(400).json({ error: 'Invalid quantity' });
        }

        let cart = readCart();

        const item = cart.find(item => item.id === cartItemId);

        if (!item) {
            return res.status(404).json({ error: 'Cart item not found' });
        }

        item.quantity = parseInt(quantity);
        writeCart(cart);

        res.json({ message: 'Cart item updated', cart });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update cart item' });
    }
});

module.exports = router;
