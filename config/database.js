const { Sequelize } = require('sequelize');
const path = require('path');

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, '../database/food-delivery.sqlite'),
    logging: false,
    define: {
        timestamps: true,
        underscored: false
    }
});

module.exports = sequelize;
