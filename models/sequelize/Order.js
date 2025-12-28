const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const Order = sequelize.define('Order', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    customerName: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
            notEmpty: { msg: 'Customer name is required' }
        }
    },
    customerPhone: {
        type: DataTypes.STRING(50),
        allowNull: false,
        validate: {
            notEmpty: { msg: 'Customer phone is required' }
        }
    },
    customerAddress: {
        type: DataTypes.STRING(500),
        allowNull: false,
        validate: {
            notEmpty: { msg: 'Delivery address is required' }
        }
    },
    customerNotes: {
        type: DataTypes.TEXT,
        defaultValue: ''
    },
    total: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    paymentMethod: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    status: {
        type: DataTypes.STRING(50),
        defaultValue: 'processing',
        validate: {
            isIn: {
                args: [['processing', 'preparing', 'enroute', 'delivered', 'cancelled']],
                msg: 'Invalid status'
            }
        }
    },
    estimatedDelivery: {
        type: DataTypes.DATE
    }
}, {
    tableName: 'Orders',
    indexes: [
        { fields: ['userId'] },
        { fields: ['status'] },
        { fields: ['createdAt'] }
    ]
});

// Format order with nested customer object for backward compatibility
Order.prototype.toJSON = function() {
    const values = { ...this.get() };

    // If items are included via association, keep them
    const items = values.items;

    // Build the response with customer object
    const result = {
        id: values.id,
        userId: values.userId,
        customer: {
            name: values.customerName,
            phone: values.customerPhone,
            address: values.customerAddress,
            notes: values.customerNotes || ''
        },
        total: values.total,
        paymentMethod: values.paymentMethod,
        status: values.status,
        createdAt: values.createdAt,
        estimatedDelivery: values.estimatedDelivery,
        updatedAt: values.updatedAt
    };

    // Include items if they were eager-loaded
    if (items) {
        result.items = items;
    }

    return result;
};

module.exports = Order;
