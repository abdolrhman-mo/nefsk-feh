const express = require('express');
const app = express();
const PORT = 3000;

// Import routes
const authRoutes = require('./routes/auth');

// Middleware to parse JSON
app.use(express.json());

// Serve static files (your HTML, CSS, JS)
app.use(express.static('public'));

// Use routes
app.use('/api/auth', authRoutes);

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});