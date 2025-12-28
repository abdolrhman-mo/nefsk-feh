const Cart = require('../models/Cart');

// GET /api/cart/:userId - Get user's cart
exports.getCart = async (req, res) => {
    try {
        const { userId } = req.params;
        const cart = await Cart.getByUserId(userId);
        res.json(cart);
    } catch (error) {
        console.error('Get cart error:', error);
        res.status(500).json({ error: 'Failed to fetch cart' });
    }
};

// POST /api/cart/:userId - Add item to user's cart
exports.addToCart = async (req, res) => {
    try {
        const { userId } = req.params;
        const { mealId, name, price, image, quantity, sellerId } = req.body;

        const result = await Cart.addItem(userId, { mealId, name, price, image, quantity, sellerId });

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
        console.error('Add to cart error:', error);
        res.status(500).json({ success: false, error: 'Failed to add item to cart' });
    }
};

// DELETE /api/cart/:userId/:itemId - Remove item from user's cart
exports.removeFromCart = async (req, res) => {
    try {
        const { userId, itemId } = req.params;
        const result = await Cart.removeItem(userId, itemId);

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
        console.error('Remove from cart error:', error);
        res.status(500).json({ success: false, error: 'Failed to remove item from cart' });
    }
};

// PUT /api/cart/:userId/:itemId - Update item quantity
exports.updateCartItem = async (req, res) => {
    try {
        const { userId, itemId } = req.params;
        const { quantity } = req.body;

        const result = await Cart.updateQuantity(userId, itemId, quantity);

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
        console.error('Update cart item error:', error);
        res.status(500).json({ success: false, error: 'Failed to update cart item' });
    }
};

// DELETE /api/cart/:userId - Clear user's entire cart
exports.clearCart = async (req, res) => {
    try {
        const { userId } = req.params;
        const result = await Cart.clearByUserId(userId);

        res.json({
            success: true,
            message: result.message,
            cart: result.cart
        });
    } catch (error) {
        console.error('Clear cart error:', error);
        res.status(500).json({ success: false, error: 'Failed to clear cart' });
    }
};
