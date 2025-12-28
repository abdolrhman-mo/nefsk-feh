const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const Meal = sequelize.define('Meal', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
            notEmpty: { msg: 'Meal name is required' }
        }
    },
    description: {
        type: DataTypes.TEXT,
        defaultValue: ''
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
            isDecimal: { msg: 'Price must be a number' },
            min: { args: [0], msg: 'Price must be a positive number' }
        }
    },
    image: {
        type: DataTypes.STRING(500),
        defaultValue: '/images/meals/default.jpg'
    },
    category: {
        type: DataTypes.STRING(100),
        defaultValue: 'main'
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        }
    }
}, {
    tableName: 'Meals',
    indexes: [
        { fields: ['userId'] },
        { fields: ['category'] }
    ]
});

module.exports = Meal;
