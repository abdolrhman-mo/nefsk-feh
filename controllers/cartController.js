const Cart = require('../models/Cart');

// GET /api/cart/:userId - Get user's cart
exports.getCart = (req, res) => {
    try {
        const { userId } = req.params;
        const cart = Cart.getByUserId(userId);
        res.json(cart);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch cart' });
    }
};

// POST /api/cart/:userId - Add item to user's cart
exports.addToCart = (req, res) => {
    try {
        const { userId } = req.params;
        const { mealId, name, price, image, quantity, sellerId } = req.body;

        const result = Cart.addItem(userId, { mealId, name, price, image, quantity, sellerId });

        if (!result.success) {
            return res.status(400).json({
                success: false,
                error: result.errors[0]
            });
        }

        res.status(201).json({
            success: true,
            message: result.message,
            cart: result.cart
        });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to add item to cart' });
    }
};

// DELETE /api/cart/:userId/:itemId - Remove item from user's cart
exports.removeFromCart = (req, res) => {
    try {
        const { userId, itemId } = req.params;
        const result = Cart.removeItem(userId, itemId);

        if (!result.success) {
            return res.status(404).json({
                success: false,
                error: result.errors[0]
            });
        }

        res.json({
            success: true,
            message: result.message,
            cart: result.cart
        });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to remove item from cart' });
    }
};

// PUT /api/cart/:userId/:itemId - Update item quantity
exports.updateCartItem = (req, res) => {
    try {
        const { userId, itemId } = req.params;
        const { quantity } = req.body;

        const result = Cart.updateQuantity(userId, itemId, quantity);

        if (!result.success) {
            const statusCode = result.errors[0] === 'Cart item not found' ? 404 : 400;
            return res.status(statusCode).json({
                success: false,
                error: result.errors[0]
            });
        }

        res.json({
            success: true,
            message: result.message,
            cart: result.cart
        });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to update cart item' });
    }
};

// DELETE /api/cart/:userId - Clear user's entire cart
exports.clearCart = (req, res) => {
    try {
        const { userId } = req.params;
        const result = Cart.clearByUserId(userId);

        res.json({
            success: true,
            message: result.message,
            cart: result.cart
        });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to clear cart' });
    }
};
