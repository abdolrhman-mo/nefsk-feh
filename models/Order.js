const fs = require('fs');
const path = require('path');

const ORDERS_FILE = path.join(__dirname, '../data/orders.json');
const DATA_DIR = path.join(__dirname, '../data');

// Status flow for automatic updates
const STATUS_FLOW = ['processing', 'preparing', 'enroute'];

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

    // Create new order
    create(orderData) {
        const orders = readOrders();

        const order = {
            ...orderData,
            id: orders.length + 1,
            status: 'processing',
            estimatedDelivery: new Date(Date.now() + 40 * 60000) // 40 minutes from now
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

        order.status = status || order.status;
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
