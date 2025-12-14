const express = require('express');
const router = express.Router();

// In-memory cart storage (in a real app, this would be a database)
// Structure: { id, name, price, image, quantity }
let cart = [];

// Helper function to generate unique cart item ID
function generateCartItemId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// GET /api/cart - Get all cart items
router.get('/', (req, res) => {
    try {
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
        
        // Check if item already exists in cart
        const existingItemIndex = cart.findIndex(item => item.mealId === mealId);
        
        if (existingItemIndex !== -1) {
            // Update quantity if item exists
            cart[existingItemIndex].quantity += quantity;
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
        
        res.status(201).json({ message: 'Item added to cart', cart });
    } catch (err) {
        res.status(500).json({ error: 'Failed to add item to cart' });
    }
});

// DELETE /api/cart/:id - Remove item from cart by cart item ID
router.delete('/:id', (req, res) => {
    try {
        const cartItemId = req.params.id;
        const itemIndex = cart.findIndex(item => item.id === cartItemId);
        
        if (itemIndex === -1) {
            return res.status(404).json({ error: 'Cart item not found' });
        }
        
        cart.splice(itemIndex, 1);
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
        
        const item = cart.find(item => item.id === cartItemId);
        
        if (!item) {
            return res.status(404).json({ error: 'Cart item not found' });
        }
        
        item.quantity = parseInt(quantity);
        res.json({ message: 'Cart item updated', cart });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update cart item' });
    }
});

module.exports = router;


