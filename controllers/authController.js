const User = require('../models/User');

// POST /api/auth/register
exports.register = async (req, res) => {
    try {
        const { username, email, password, address } = req.body;

        const result = await User.create({ username, email, password, address });

        if (!result.success) {
            return res.status(400).json({
                success: false,
                message: result.errors[0]
            });
        }

        res.json({
            success: true,
            message: 'Registration successful',
            user: result.user
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during registration'
        });
    }
};

// POST /api/auth/login
exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        const result = await User.validateCredentials(username, password);

        if (!result.success) {
            return res.status(401).json({
                success: false,
                message: result.errors[0]
            });
        }

        res.json({
            success: true,
            message: 'Login successful',
            user: result.user
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during login'
        });
    }
};

// PUT /api/auth/profile/:id
exports.updateProfile = async (req, res) => {
    try {
        const { id } = req.params;
        const { username, email, address } = req.body;

        const result = await User.update(id, { username, email, address });

        if (!result.success) {
            const statusCode = result.errors[0] === 'User not found' ? 404 : 400;
            return res.status(statusCode).json({
                success: false,
                message: result.errors[0]
            });
        }

        res.json({
            success: true,
            message: 'Profile updated successfully',
            user: result.user
        });
    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during profile update'
        });
    }
};
