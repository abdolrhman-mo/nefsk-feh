const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');

// GET /api/cart - Get all cart items
router.get('/', cartController.getCart);

// POST /api/cart - Add item to cart
router.post('/', cartController.addToCart);

// DELETE /api/cart - Clear entire cart
router.delete('/', cartController.clearCart);

// DELETE /api/cart/:id - Remove item from cart
router.delete('/:id', cartController.removeFromCart);

// PUT /api/cart/:id - Update cart item quantity
router.put('/:id', cartController.updateCartItem);

module.exports = router;
