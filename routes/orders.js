const express = require('express');
const fs = require('fs');
const router = express.Router();

const FILE_PATH = './orders.json';

// Helper: read orders from the file
const readOrders = () => {
  try {
    const data = fs.readFileSync(FILE_PATH, 'utf8');
    return JSON.parse(data);
  } catch {
    return [];
  }
};

// Helper: save orders to the file
const saveOrders = (orders) => {
  fs.writeFileSync(FILE_PATH, JSON.stringify(orders, null, 2));
};

// Create an order
router.post('/', (req, res) => {
  const orders = readOrders();
  const order = req.body;
  order.id = orders.length + 1; // Generate simple ID
  order.status = 'processing';   // Initial status
  order.estimatedDelivery = new Date(Date.now() + 40 * 60000); // ETA 40 minutes
  orders.push(order);
  saveOrders(orders);
  res.status(201).json(order);
});

// Get all orders
router.get('/', (req, res) => {
  const orders = readOrders();
  res.json(orders);
});

// Get order by ID
router.get('/:id', (req, res) => {
  const orders = readOrders();
  const id = parseInt(req.params.id);
  const order = orders.find(o => o.id === id);
  if (order) {
    res.json(order);
  } else {
    res.status(404).json({ message: 'Order not found' });
  }
});

// Update order status manually
router.put('/:id/status', (req, res) => {
  const orders = readOrders();
  const id = parseInt(req.params.id);
  const order = orders.find(o => o.id === id);
  if (!order) return res.status(404).json({ message: 'Order not found' });

  const { status } = req.body;
  order.status = status || order.status;
  saveOrders(orders);
  res.json(order);
});

// Simulate automatic status updates
const simulateStatusUpdate = () => {
  const orders = readOrders();
  const statusFlow = ['processing', 'preparing', 'enroute', 'processing'];
  let updated = false;

  orders.forEach(order => {
    const currentIndex = statusFlow.indexOf(order.status);
    if (currentIndex < statusFlow.length - 1) {
      order.status = statusFlow[currentIndex + 1];
      updated = true;
    }
  });

  if (updated) saveOrders(orders);
};

// Automatically update status every minute
setInterval(simulateStatusUpdate, 60 * 1000);

module.exports = router;
