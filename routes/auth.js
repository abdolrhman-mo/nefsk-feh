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
    const { username, email, password } = req.body;

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
        password
    };
    users.push(newUser);
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));

    res.json({
        success: true,
        message: 'Registration successful',
        user: { id: newUser.id, username: newUser.username, email: newUser.email }
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
            user: { id: user.id, username: user.username, email: user.email }
        });
    } else {
        res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
});

module.exports = router;
