const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const Review = sequelize.define('Review', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    avatar: {
        type: DataTypes.STRING(500),
        defaultValue: ''
    },
    rating: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1,
            max: 5
        }
    },
    comment: {
        type: DataTypes.TEXT,
        defaultValue: ''
    },
    date: {
        type: DataTypes.DATEONLY
    }
}, {
    tableName: 'Reviews'
});

module.exports = Review;
