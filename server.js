const express = require('express');
const app = express();
const PORT = 3000;

// Import routes
const authRoutes = require('./routes/auth');
const orderRoutes = require('./routes/orders');
const mealsRoutes = require('./routes/meals');
const cartRoutes = require('./routes/cart');

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

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
