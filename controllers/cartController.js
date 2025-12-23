const Cart = require('../models/Cart');

// GET /api/cart
exports.getCart = (req, res) => {
    try {
        const cart = Cart.getAll();
        res.json(cart);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch cart' });
    }
};

// POST /api/cart
exports.addToCart = (req, res) => {
    try {
        const { mealId, name, price, image, quantity } = req.body;

        const result = Cart.addItem({ mealId, name, price, image, quantity });

        if (!result.success) {
            return res.status(400).json({
                error: result.errors[0]
            });
        }

        res.status(201).json({
            message: result.message,
            cart: result.cart
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to add item to cart' });
    }
};

// DELETE /api/cart/:id
exports.removeFromCart = (req, res) => {
    try {
        const result = Cart.removeItem(req.params.id);

        if (!result.success) {
            return res.status(404).json({
                error: result.errors[0]
            });
        }

        res.json({
            message: result.message,
            cart: result.cart
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to remove item from cart' });
    }
};

// PUT /api/cart/:id
exports.updateCartItem = (req, res) => {
    try {
        const { quantity } = req.body;

        const result = Cart.updateQuantity(req.params.id, quantity);

        if (!result.success) {
            const statusCode = result.errors[0] === 'Cart item not found' ? 404 : 400;
            return res.status(statusCode).json({
                error: result.errors[0]
            });
        }

        res.json({
            message: result.message,
            cart: result.cart
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update cart item' });
    }
};

// DELETE /api/cart
exports.clearCart = (req, res) => {
    try {
        const result = Cart.clear();
        res.json({
            message: result.message,
            cart: result.cart
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to clear cart' });
    }
};
