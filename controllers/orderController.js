const Order = require('../models/Order');

// POST /api/orders
exports.createOrder = (req, res) => {
    try {
        const result = Order.create(req.body);
        res.status(201).json(result.order);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create order' });
    }
};

// GET /api/orders
exports.getAllOrders = (req, res) => {
    try {
        const orders = Order.findAll();
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
};

// GET /api/orders/:id
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

// PUT /api/orders/:id/status
exports.updateOrderStatus = (req, res) => {
    try {
        const { status } = req.body;

        const result = Order.updateStatus(req.params.id, status);

        if (!result.success) {
            return res.status(404).json({
                message: result.errors[0]
            });
        }

        res.json(result.order);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update order status' });
    }
};
