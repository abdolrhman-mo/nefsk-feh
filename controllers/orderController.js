const Order = require('../models/Order');

// POST /api/orders - Create new order
exports.createOrder = async (req, res) => {
    try {
        const result = await Order.create(req.body);

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
        console.error('Create order error:', error);
        res.status(500).json({ success: false, error: 'Failed to create order' });
    }
};

// GET /api/orders - Get all orders (admin use)
exports.getAllOrders = async (req, res) => {
    try {
        const orders = await Order.findAll();
        res.json(orders);
    } catch (error) {
        console.error('Get all orders error:', error);
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
};

// GET /api/orders/:id - Get order by ID
exports.getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        res.json(order);
    } catch (error) {
        console.error('Get order by ID error:', error);
        res.status(500).json({ error: 'Failed to fetch order' });
    }
};

// GET /api/orders/user/:userId - Get orders placed by a user
exports.getOrdersByUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const orders = await Order.findByUserId(userId);
        res.json(orders);
    } catch (error) {
        console.error('Get orders by user error:', error);
        res.status(500).json({ error: 'Failed to fetch user orders' });
    }
};

// GET /api/orders/seller/:userId - Get orders to fulfill (containing user's meals)
exports.getOrdersBySeller = async (req, res) => {
    try {
        const { userId } = req.params;
        const orders = await Order.findBySellerId(userId);
        res.json(orders);
    } catch (error) {
        console.error('Get orders by seller error:', error);
        res.status(500).json({ error: 'Failed to fetch seller orders' });
    }
};

// PUT /api/orders/:id/status - Update order status
exports.updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;

        const result = await Order.updateStatus(req.params.id, status);

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
        console.error('Update order status error:', error);
        res.status(500).json({ success: false, error: 'Failed to update order status' });
    }
};
