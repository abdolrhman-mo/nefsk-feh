const fs = require('fs');
const path = require('path');

const ORDERS_FILE = path.join(__dirname, '../data/orders.json');
const DATA_DIR = path.join(__dirname, '../data');

// Status flow for automatic updates
const STATUS_FLOW = ['processing', 'preparing', 'enroute', 'delivered'];

// Helper: Read orders from file
function readOrders() {
    try {
        const data = fs.readFileSync(ORDERS_FILE, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        return [];
    }
}

// Helper: Write orders to file
function saveOrders(orders) {
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2));
}

// Helper: Generate unique order ID
function generateOrderId(orders) {
    if (orders.length === 0) return 1;
    const maxId = Math.max(...orders.map(o => o.id || 0));
    return maxId + 1;
}

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

// Variable to hold interval reference
let statusSimulationInterval = null;

const Order = {
    // Ensure data directory and file exist
    ensureDataExists() {
        if (!fs.existsSync(DATA_DIR)) {
            fs.mkdirSync(DATA_DIR, { recursive: true });
        }
        if (!fs.existsSync(ORDERS_FILE)) {
            fs.writeFileSync(ORDERS_FILE, JSON.stringify([], null, 2));
        }
    },

    // Get all orders
    findAll() {
        return readOrders();
    },

    // Find order by ID
    findById(id) {
        const orders = readOrders();
        return orders.find(o => o.id === parseInt(id));
    },

    // Find orders by user ID (orders placed BY this user)
    findByUserId(userId) {
        const orders = readOrders();
        const userIdNum = parseInt(userId);
        return orders.filter(o => o.userId === userIdNum);
    },

    // Find orders by seller ID (orders containing this user's meals)
    findBySellerId(sellerId) {
        const orders = readOrders();
        const sellerIdNum = parseInt(sellerId);

        // Filter orders that contain at least one item from this seller
        return orders.filter(order => {
            if (!order.items || !Array.isArray(order.items)) return false;
            return order.items.some(item => item.sellerId === sellerIdNum);
        }).map(order => {
            // Return order with only items from this seller
            return {
                ...order,
                items: order.items.filter(item => item.sellerId === sellerIdNum),
                // Recalculate total for seller's items only
                sellerTotal: order.items
                    .filter(item => item.sellerId === sellerIdNum)
                    .reduce((sum, item) => sum + (item.price * item.quantity), 0)
            };
        });
    },

    // Create new order
    create(orderData) {
        // Validate order data
        const errors = validateOrder(orderData);
        if (errors.length > 0) {
            return { success: false, errors };
        }

        const orders = readOrders();

        // Calculate total from items
        const total = orderData.items.reduce((sum, item) => {
            return sum + (parseFloat(item.price) * parseInt(item.quantity));
        }, 0);

        const order = {
            id: generateOrderId(orders),
            userId: parseInt(orderData.userId),
            customer: {
                name: orderData.customer.name.trim(),
                phone: orderData.customer.phone.trim(),
                address: orderData.customer.address.trim(),
                notes: orderData.customer.notes ? orderData.customer.notes.trim() : ''
            },
            items: orderData.items.map(item => ({
                mealId: item.mealId,
                name: item.name,
                price: parseFloat(item.price),
                quantity: parseInt(item.quantity),
                sellerId: item.sellerId ? parseInt(item.sellerId) : null
            })),
            total: total,
            paymentMethod: orderData.paymentMethod,
            status: 'processing',
            createdAt: new Date().toISOString(),
            estimatedDelivery: new Date(Date.now() + 40 * 60000).toISOString() // 40 minutes from now
        };

        orders.push(order);
        saveOrders(orders);

        return { success: true, order };
    },

    // Update order status
    updateStatus(id, status) {
        const orders = readOrders();
        const order = orders.find(o => o.id === parseInt(id));

        if (!order) {
            return { success: false, errors: ['Order not found'] };
        }

        // Validate status
        const validStatuses = ['processing', 'preparing', 'enroute', 'delivered', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return { success: false, errors: ['Invalid status'] };
        }

        order.status = status;
        saveOrders(orders);

        return { success: true, order };
    },

    // Simulate automatic status updates
    simulateStatusUpdates() {
        const orders = readOrders();
        let updated = false;

        orders.forEach(order => {
            const currentIndex = STATUS_FLOW.indexOf(order.status);
            // Only update if status is in flow and not at the end
            if (currentIndex !== -1 && currentIndex < STATUS_FLOW.length - 1) {
                order.status = STATUS_FLOW[currentIndex + 1];
                updated = true;
            }
        });

        if (updated) {
            saveOrders(orders);
        }
    },

    // Start automatic status simulation
    startStatusSimulation(intervalMs = 60000) {
        if (statusSimulationInterval) {
            clearInterval(statusSimulationInterval);
        }
        statusSimulationInterval = setInterval(() => {
            Order.simulateStatusUpdates();
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
