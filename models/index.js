const sequelize = require('../config/database');
const User = require('./sequelize/User');
const Meal = require('./sequelize/Meal');
const CartItem = require('./sequelize/CartItem');
const Order = require('./sequelize/Order');
const OrderItem = require('./sequelize/OrderItem');
const Category = require('./sequelize/Category');
const Review = require('./sequelize/Review');

// Define Associations

// User -> Meals (one-to-many): A user can sell many meals
User.hasMany(Meal, { foreignKey: 'userId', as: 'meals' });
Meal.belongsTo(User, { foreignKey: 'userId', as: 'seller' });

// User -> CartItems (one-to-many): A user can have many cart items
User.hasMany(CartItem, { foreignKey: 'userId', as: 'cartItems' });
CartItem.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Meal -> CartItems (one-to-many): A meal can be in many carts
Meal.hasMany(CartItem, { foreignKey: 'mealId', as: 'cartItems' });
CartItem.belongsTo(Meal, { foreignKey: 'mealId', as: 'meal' });

// User (seller) -> CartItems (one-to-many)
User.hasMany(CartItem, { foreignKey: 'sellerId', as: 'sellerCartItems' });
CartItem.belongsTo(User, { foreignKey: 'sellerId', as: 'cartSeller' });

// User -> Orders (one-to-many): A user can place many orders
User.hasMany(Order, { foreignKey: 'userId', as: 'orders' });
Order.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Order -> OrderItems (one-to-many): An order has many items
Order.hasMany(OrderItem, { foreignKey: 'orderId', as: 'items' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });

// User (seller) -> OrderItems (one-to-many)
User.hasMany(OrderItem, { foreignKey: 'sellerId', as: 'sellerOrderItems' });
OrderItem.belongsTo(User, { foreignKey: 'sellerId', as: 'seller' });

module.exports = {
    sequelize,
    User,
    Meal,
    CartItem,
    Order,
    OrderItem,
    Category,
    Review
};
