const fs = require('fs');
const path = require('path');

const USERS_FILE = path.join(__dirname, '../data/users.json');
const DATA_DIR = path.join(__dirname, '../data');

// Helper: Read users from file
function readUsers() {
    try {
        const data = fs.readFileSync(USERS_FILE, 'utf8');
        return JSON.parse(data || '[]');
    } catch (err) {
        return [];
    }
}

// Helper: Write users to file
function writeUsers(users) {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

// Validation: Check required fields for registration
function validateRegistration(data) {
    const errors = [];
    if (!data.username || data.username.trim() === '') {
        errors.push('Username is required');
    }
    if (!data.email || data.email.trim() === '') {
        errors.push('Email is required');
    }
    if (!data.password || data.password.trim() === '') {
        errors.push('Password is required');
    }
    if (data.email && !isValidEmail(data.email)) {
        errors.push('Invalid email format');
    }
    return errors;
}

// Validation: Check email format
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Validation: Check login fields
function validateLogin(data) {
    const errors = [];
    if (!data.username || data.username.trim() === '') {
        errors.push('Username or email is required');
    }
    if (!data.password || data.password.trim() === '') {
        errors.push('Password is required');
    }
    return errors;
}

const User = {
    // Ensure data directory and file exist
    ensureDataExists() {
        if (!fs.existsSync(DATA_DIR)) {
            fs.mkdirSync(DATA_DIR, { recursive: true });
        }
        if (!fs.existsSync(USERS_FILE)) {
            fs.writeFileSync(USERS_FILE, JSON.stringify([], null, 2));
        }
    },

    // Get all users
    findAll() {
        return readUsers();
    },

    // Find user by ID
    findById(id) {
        const users = readUsers();
        return users.find(u => u.id === parseInt(id));
    },

    // Find user by email
    findByEmail(email) {
        const users = readUsers();
        return users.find(u => u.email === email);
    },

    // Find user by username (or email for login)
    findByUsername(username) {
        const users = readUsers();
        return users.find(u => u.username === username || u.email === username);
    },

    // Create new user
    create(userData) {
        // Validate input
        const errors = validateRegistration(userData);
        if (errors.length > 0) {
            return { success: false, errors };
        }

        const users = readUsers();

        // Check for existing user
        const existingUser = users.find(u =>
            u.email === userData.email || u.username === userData.username
        );
        if (existingUser) {
            return { success: false, errors: ['User already exists'] };
        }

        // Create new user
        const newUser = {
            id: users.length + 1,
            username: userData.username.trim(),
            email: userData.email.trim(),
            address: userData.address || '',
            password: userData.password
        };

        users.push(newUser);
        writeUsers(users);

        // Return user without password
        return {
            success: true,
            user: {
                id: newUser.id,
                username: newUser.username,
                email: newUser.email,
                address: newUser.address
            }
        };
    },

    // Update user
    update(id, userData) {
        const users = readUsers();
        const userIndex = users.findIndex(u => u.id === parseInt(id));

        if (userIndex === -1) {
            return { success: false, errors: ['User not found'] };
        }

        // Check if username/email already taken by another user
        if (userData.email || userData.username) {
            const existingUser = users.find(u =>
                u.id !== parseInt(id) &&
                (u.email === userData.email || u.username === userData.username)
            );
            if (existingUser) {
                return { success: false, errors: ['Username or email already taken'] };
            }
        }

        // Update fields
        users[userIndex].username = userData.username || users[userIndex].username;
        users[userIndex].email = userData.email || users[userIndex].email;
        users[userIndex].address = userData.address !== undefined ? userData.address : users[userIndex].address;

        writeUsers(users);

        return {
            success: true,
            user: {
                id: users[userIndex].id,
                username: users[userIndex].username,
                email: users[userIndex].email,
                address: users[userIndex].address
            }
        };
    },

    // Validate credentials for login
    validateCredentials(username, password) {
        // Validate input
        const errors = validateLogin({ username, password });
        if (errors.length > 0) {
            return { success: false, errors };
        }

        const users = readUsers();
        const user = users.find(u =>
            (u.username === username || u.email === username) && u.password === password
        );

        if (user) {
            return {
                success: true,
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    address: user.address || ''
                }
            };
        }

        return { success: false, errors: ['Invalid credentials'] };
    }
};

module.exports = User;
