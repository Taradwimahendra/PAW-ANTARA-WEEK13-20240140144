const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Product = require('./product.model');
const Order = require('./order.model');

const OrderItem = sequelize.define(
  'OrderItem',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    orderId: { type: DataTypes.INTEGER, allowNull: false },
    productId: { type: DataTypes.INTEGER, allowNull: false },
    quantity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
    price: { type: DataTypes.INTEGER, allowNull: false }, // Store price at the time of purchase
  },
  { tableName: 'order_items', timestamps: true }
);

module.exports = OrderItem;
