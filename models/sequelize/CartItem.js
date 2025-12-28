const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const CartItem = sequelize.define('CartItem', {
    id: {
        type: DataTypes.STRING(50),
        primaryKey: true,
        defaultValue: () => Date.now().toString(36) + Math.random().toString(36).substr(2)
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    mealId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Meals',
            key: 'id'
        }
    },
    name: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    image: {
        type: DataTypes.STRING(500),
        allowNull: false
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: { args: [1], msg: 'Quantity must be at least 1' }
        }
    },
    sellerId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'Users',
            key: 'id'
        }
    }
}, {
    tableName: 'CartItems',
    indexes: [
        { fields: ['userId'] },
        { fields: ['mealId'] },
        { unique: true, fields: ['userId', 'mealId'] }
    ]
});

module.exports = CartItem;
