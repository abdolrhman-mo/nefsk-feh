const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const Category = sequelize.define('Category', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        defaultValue: ''
    },
    image: {
        type: DataTypes.STRING(500),
        defaultValue: ''
    },
    type: {
        type: DataTypes.STRING(100),
        defaultValue: ''
    }
}, {
    tableName: 'Categories'
});

module.exports = Category;
