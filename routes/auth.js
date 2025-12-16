const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const USERS_FILE = path.join(__dirname, '../data/users.json');

// Ensure data directory and users file exist
if (!fs.existsSync(path.join(__dirname, '../data'))) {
    fs.mkdirSync(path.join(__dirname, '../data'));
}
if (!fs.existsSync(USERS_FILE)) {
    fs.writeFileSync(USERS_FILE, JSON.stringify([], null, 2));
}

// Register endpoint
router.post('/register', (req, res) => {
    const { username, email, password, address } = req.body;

    // Validate all fields are provided
    if (!username || !email || !password) {
        return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    // Read existing users
    const users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));

    // Check if user already exists
    if (users.find(u => u.email === email || u.username === username)) {
        return res.status(400).json({ success: false, message: 'User already exists' });
    }

    // Add new user with ID
    const newUser = {
        id: users.length + 1,
        username,
        email,
        address: address || '',
        password
    };
    users.push(newUser);
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));

    res.json({
        success: true,
        message: 'Registration successful',
        user: { id: newUser.id, username: newUser.username, email: newUser.email, address: newUser.address }
    });
});

// Login endpoint
router.post('/login', (req, res) => {
    const { username, password } = req.body;

    // Read users
    const users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));

    // Find user
    const user = users.find(u =>
        (u.username === username || u.email === username) && u.password === password
    );

    if (user) {
        res.json({
            success: true,
            message: 'Login successful',
            user: { id: user.id, username: user.username, email: user.email, address: user.address || '' }
        });
    } else {
        res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
});

// Update profile endpoint
router.put('/profile/:id', (req, res) => {
    const { id } = req.params;
    const { username, email, address } = req.body;

    // Read existing users
    const users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));

    // Find user by ID
    const userIndex = users.findIndex(u => u.id === parseInt(id));

    if (userIndex === -1) {
        return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Check if username/email already taken by another user
    const existingUser = users.find(u =>
        u.id !== parseInt(id) && (u.email === email || u.username === username)
    );

    if (existingUser) {
        return res.status(400).json({ success: false, message: 'Username or email already taken' });
    }

    // Update user
    users[userIndex].username = username || users[userIndex].username;
    users[userIndex].email = email || users[userIndex].email;
    users[userIndex].address = address || users[userIndex].address;

    // Save updated users
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));

    res.json({
        success: true,
        message: 'Profile updated successfully',
        user: {
            id: users[userIndex].id,
            username: users[userIndex].username,
            email: users[userIndex].email,
            address: users[userIndex].address
        }
    });
});

module.exports = router;
