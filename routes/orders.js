const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const Order = require('../models/Order');

// POST /api/orders - Create an order
router.post('/', orderController.createOrder);

// GET /api/orders - Get all orders
router.get('/', orderController.getAllOrders);

// GET /api/orders/:id - Get order by ID
router.get('/:id', orderController.getOrderById);

// PUT /api/orders/:id/status - Update order status
router.put('/:id/status', orderController.updateOrderStatus);

// Start automatic status simulation (updates every 60 seconds)
Order.startStatusSimulation(60 * 1000);

module.exports = router;
