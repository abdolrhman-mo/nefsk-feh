const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');

// GET /api/cart/:userId - Get user's cart
router.get('/:userId', cartController.getCart);

// POST /api/cart/:userId - Add item to user's cart
router.post('/:userId', cartController.addToCart);

// PUT /api/cart/:userId/:itemId - Update cart item quantity
router.put('/:userId/:itemId', cartController.updateCartItem);

// DELETE /api/cart/:userId/:itemId - Remove item from user's cart
router.delete('/:userId/:itemId', cartController.removeFromCart);

// DELETE /api/cart/:userId - Clear user's entire cart
router.delete('/:userId', cartController.clearCart);

module.exports = router;
