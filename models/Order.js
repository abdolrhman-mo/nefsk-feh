const { Order: OrderModel, OrderItem: OrderItemModel } = require('./index');
const { Op } = require('sequelize');

// Status flow for automatic updates
const STATUS_FLOW = ['processing', 'preparing', 'enroute', 'delivered'];

// Validation: Check required fields for order
function validateOrder(orderData) {
    const errors = [];

    if (!orderData.userId) {
        errors.push('User ID is required');
    }

    if (!orderData.customer || !orderData.customer.name || orderData.customer.name.trim() === '') {
        errors.push('Customer name is required');
    }

    if (!orderData.customer || !orderData.customer.phone || orderData.customer.phone.trim() === '') {
        errors.push('Customer phone is required');
    }

    if (!orderData.customer || !orderData.customer.address || orderData.customer.address.trim() === '') {
        errors.push('Delivery address is required');
    }

    if (!orderData.items || !Array.isArray(orderData.items) || orderData.items.length === 0) {
        errors.push('Order must contain at least one item');
    }

    if (!orderData.paymentMethod) {
        errors.push('Payment method is required');
    }

    return errors;
}

// Helper: Format order with items for response (backward compatible format)
function formatOrderWithItems(order, items) {
    const orderData = order.get ? order.get({ plain: true }) : order;
    const formattedItems = items.map(item => {
        const itemData = item.get ? item.get({ plain: true }) : item;
        return {
            mealId: itemData.mealId,
            name: itemData.name,
            price: parseFloat(itemData.price),
            quantity: itemData.quantity,
            sellerId: itemData.sellerId
        };
    });

    return {
        id: orderData.id,
        userId: orderData.userId,
        customer: {
            name: orderData.customerName,
            phone: orderData.customerPhone,
            address: orderData.customerAddress,
            notes: orderData.customerNotes || ''
        },
        items: formattedItems,
        total: parseFloat(orderData.total),
        paymentMethod: orderData.paymentMethod,
        status: orderData.status,
        createdAt: orderData.createdAt,
        estimatedDelivery: orderData.estimatedDelivery
    };
}

// Variable to hold interval reference
let statusSimulationInterval = null;

const Order = {
    // Ensure data exists (no-op for database, kept for backward compatibility)
    ensureDataExists() {
        // Database tables are created via sequelize.sync()
    },

    // Get all orders
    async findAll() {
        const orders = await OrderModel.findAll({
            include: [{ model: OrderItemModel, as: 'items' }],
            order: [['createdAt', 'DESC']]
        });

        return orders.map(order => formatOrderWithItems(order, order.items || []));
    },

    // Find order by ID
    async findById(id) {
        const order = await OrderModel.findByPk(parseInt(id), {
            include: [{ model: OrderItemModel, as: 'items' }]
        });

        if (!order) return undefined;
        return formatOrderWithItems(order, order.items || []);
    },

    // Find orders by user ID (orders placed BY this user)
    async findByUserId(userId) {
        const userIdNum = parseInt(userId);
        const orders = await OrderModel.findAll({
            where: { userId: userIdNum },
            include: [{ model: OrderItemModel, as: 'items' }],
            order: [['createdAt', 'DESC']]
        });

        return orders.map(order => formatOrderWithItems(order, order.items || []));
    },

    // Find orders by seller ID (orders containing this user's meals)
    async findBySellerId(sellerId) {
        const sellerIdNum = parseInt(sellerId);

        // Find all order items for this seller
        const sellerItems = await OrderItemModel.findAll({
            where: { sellerId: sellerIdNum }
        });

        if (sellerItems.length === 0) {
            return [];
        }

        // Get unique order IDs
        const orderIds = [...new Set(sellerItems.map(item => item.orderId))];

        // Fetch those orders
        const orders = await OrderModel.findAll({
            where: { id: { [Op.in]: orderIds } },
            include: [{ model: OrderItemModel, as: 'items' }],
            order: [['createdAt', 'DESC']]
        });

        // Filter items to only show this seller's items and calculate sellerTotal
        return orders.map(order => {
            const orderData = formatOrderWithItems(order, order.items || []);
            const sellerOnlyItems = orderData.items.filter(item => item.sellerId === sellerIdNum);
            const sellerTotal = sellerOnlyItems.reduce(
                (sum, item) => sum + (item.price * item.quantity),
                0
            );

            return {
                ...orderData,
                items: sellerOnlyItems,
                sellerTotal
            };
        });
    },

    // Create new order
    async create(orderData) {
        // Validate order data
        const errors = validateOrder(orderData);
        if (errors.length > 0) {
            return { success: false, errors };
        }

        try {
            // Calculate total from items
            const total = orderData.items.reduce((sum, item) => {
                return sum + (parseFloat(item.price) * parseInt(item.quantity));
            }, 0);

            // Create the order
            const order = await OrderModel.create({
                userId: parseInt(orderData.userId),
                customerName: orderData.customer.name.trim(),
                customerPhone: orderData.customer.phone.trim(),
                customerAddress: orderData.customer.address.trim(),
                customerNotes: orderData.customer.notes ? orderData.customer.notes.trim() : '',
                total: total,
                paymentMethod: orderData.paymentMethod,
                status: 'processing',
                estimatedDelivery: new Date(Date.now() + 40 * 60000) // 40 minutes from now
            });

            // Create order items
            const orderItems = await Promise.all(
                orderData.items.map(item =>
                    OrderItemModel.create({
                        orderId: order.id,
                        mealId: item.mealId,
                        name: item.name,
                        price: parseFloat(item.price),
                        quantity: parseInt(item.quantity),
                        sellerId: item.sellerId ? parseInt(item.sellerId) : null
                    })
                )
            );

            return {
                success: true,
                order: formatOrderWithItems(order, orderItems)
            };
        } catch (error) {
            if (error.name === 'SequelizeValidationError') {
                return { success: false, errors: [error.errors[0].message] };
            }
            throw error;
        }
    },

    // Update order status
    async updateStatus(id, status) {
        const order = await OrderModel.findByPk(parseInt(id), {
            include: [{ model: OrderItemModel, as: 'items' }]
        });

        if (!order) {
            return { success: false, errors: ['Order not found'] };
        }

        // Validate status
        const validStatuses = ['processing', 'preparing', 'enroute', 'delivered', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return { success: false, errors: ['Invalid status'] };
        }

        order.status = status;
        await order.save();

        return {
            success: true,
            order: formatOrderWithItems(order, order.items || [])
        };
    },

    // Simulate automatic status updates
    async simulateStatusUpdates() {
        try {
            const orders = await OrderModel.findAll({
                where: {
                    status: { [Op.in]: ['processing', 'preparing', 'enroute'] }
                }
            });

            for (const order of orders) {
                const currentIndex = STATUS_FLOW.indexOf(order.status);
                // Only update if status is in flow and not at the end
                if (currentIndex !== -1 && currentIndex < STATUS_FLOW.length - 1) {
                    order.status = STATUS_FLOW[currentIndex + 1];
                    await order.save();
                }
            }
        } catch (error) {
            console.error('Status simulation error:', error);
        }
    },

    // Start automatic status simulation
    startStatusSimulation(intervalMs = 60000) {
        if (statusSimulationInterval) {
            clearInterval(statusSimulationInterval);
        }
        statusSimulationInterval = setInterval(async () => {
            await Order.simulateStatusUpdates();
        }, intervalMs);
    },

    // Stop status simulation
    stopStatusSimulation() {
        if (statusSimulationInterval) {
            clearInterval(statusSimulationInterval);
            statusSimulationInterval = null;
        }
    }
};

module.exports = Order;
