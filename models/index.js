const sequelize = require('../config/database');
const Product = require('./product.model');
const Order = require('./order.model');
const User = require('./user.model');
const OrderItem = require('./orderItem.model');

// User <-> Order
User.hasMany(Order, { foreignKey: 'userId' });
Order.belongsTo(User, { foreignKey: 'userId' });

// Order <-> OrderItem
Order.hasMany(OrderItem, { foreignKey: 'orderId' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId' });

// Product <-> OrderItem
Product.hasMany(OrderItem, { foreignKey: 'productId' });
OrderItem.belongsTo(Product, { foreignKey: 'productId' });

module.exports = { sequelize, Product, Order, User, OrderItem };
