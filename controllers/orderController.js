const Order = require('../models/Order');

// POST /api/orders - Create new order
exports.createOrder = (req, res) => {
    try {
        const result = Order.create(req.body);

        if (!result.success) {
            return res.status(400).json({
                success: false,
                message: result.errors[0],
                errors: result.errors
            });
        }

        res.status(201).json({
            success: true,
            message: 'Order created successfully',
            order: result.order
        });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to create order' });
    }
};

// GET /api/orders - Get all orders (admin use)
exports.getAllOrders = (req, res) => {
    try {
        const orders = Order.findAll();
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
};

// GET /api/orders/:id - Get order by ID
exports.getOrderById = (req, res) => {
    try {
        const order = Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        res.json(order);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch order' });
    }
};

// GET /api/orders/user/:userId - Get orders placed by a user
exports.getOrdersByUser = (req, res) => {
    try {
        const { userId } = req.params;
        const orders = Order.findByUserId(userId);
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch user orders' });
    }
};

// GET /api/orders/seller/:userId - Get orders to fulfill (containing user's meals)
exports.getOrdersBySeller = (req, res) => {
    try {
        const { userId } = req.params;
        const orders = Order.findBySellerId(userId);
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch seller orders' });
    }
};

// PUT /api/orders/:id/status - Update order status
exports.updateOrderStatus = (req, res) => {
    try {
        const { status } = req.body;

        const result = Order.updateStatus(req.params.id, status);

        if (!result.success) {
            return res.status(404).json({
                success: false,
                message: result.errors[0]
            });
        }

        res.json({
            success: true,
            message: 'Order status updated',
            order: result.order
        });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to update order status' });
    }
};
