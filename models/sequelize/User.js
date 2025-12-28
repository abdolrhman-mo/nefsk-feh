const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');
const bcrypt = require('bcrypt');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    username: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        validate: {
            notEmpty: { msg: 'Username is required' }
        }
    },
    email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        validate: {
            notEmpty: { msg: 'Email is required' },
            isEmail: { msg: 'Invalid email format' }
        }
    },
    address: {
        type: DataTypes.STRING(500),
        defaultValue: ''
    },
    password: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
            notEmpty: { msg: 'Password is required' }
        }
    }
}, {
    tableName: 'Users',
    hooks: {
        beforeCreate: async (user) => {
            if (user.password && !user.password.startsWith('$2b$')) {
                user.password = await bcrypt.hash(user.password, 10);
            }
        },
        beforeUpdate: async (user) => {
            if (user.changed('password') && !user.password.startsWith('$2b$')) {
                user.password = await bcrypt.hash(user.password, 10);
            }
        }
    }
});

// Instance method to validate password
User.prototype.validatePassword = async function(password) {
    return bcrypt.compare(password, this.password);
};

// Instance method to get safe user object (without password)
User.prototype.toSafeObject = function() {
    return {
        id: this.id,
        username: this.username,
        email: this.email,
        address: this.address || ''
    };
};

module.exports = User;
