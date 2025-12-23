const express = require('express');
const app = express();
const PORT = 3000;

// Import models for initialization
const User = require('./models/User');
const Cart = require('./models/Cart');
const Order = require('./models/Order');

// Ensure data files exist on startup
User.ensureDataExists();
Cart.ensureDataExists();
Order.ensureDataExists();

// Import routes
const authRoutes = require('./routes/auth');
const orderRoutes = require('./routes/orders');
const mealsRoutes = require('./routes/meals');
const cartRoutes = require('./routes/cart');
const homeRoutes = require('./routes/home');

// Middleware to parse JSON
app.use(express.json());

// Serve static files
app.use(express.static('public'));
app.use('/pages', express.static('public/pages'));

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/meals', mealsRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/home', homeRoutes);

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
