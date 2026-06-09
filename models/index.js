import { sqlite } from '../db/database';

const Customer = sqlite.define(
    'Customers',
    {
        id: {
            type: sqlite.datatypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        name: {
            type: sqlite.datatypes.STRING,
            allowNull: false,
        },
        email: {
            type: sqlite.datatypes.STRING,
            allowNull: false,
            unique: true,
        },
    },
    { timestamps: false },
);

const Product = sqlite.define(
    'Products',
    {
        id: {
            type: sqlite.datatypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        name: {
            type: sqlite.datatypes.STRING,
            allowNull: false,
        },
        price: {
            type: sqlite.datatypes.INTEGER,
            allowNull: false,
        },
        stock: {
            type: sqlite.datatypes.INTEGER,
            defaultValue: 0,
        },
    },
    { timestamps: false },
);

const Order = sqlite.define(
    'Orders',
    {
        id: {
            type: sqlite.datatypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        orderDate: {
            type: sqlite.datatypes.DATE,
            defaultValue: sqlite.datatypes.NOW,
        },
        total: {
            type: sqlite.datatypes.INTEGER,
            defaultValue: 0,
        },
    },
    { timestamps: false },
);

const OrderItem = sqlite.define(
    'OrderItems',
    {
        id: {
            type: sqlite.datatypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        quantity: {
            type: sqlite.datatypes.INTEGER,
            allowNull: false,
        },
        unitPrice: {
            type: sqlite.datatypes.INTEGER,
            allowNull: false,
        },
    },
    { timestamps: false },
);

// Customer ↔ Order
Customer.hasMany(Order, {
    foreignKey: 'customerId',
});

Order.belongsTo(Customer, {
    foreignKey: 'customerId',
});

// Order ↔ OrderItem
Order.hasMany(OrderItem, {
    foreignKey: 'orderId',
});

OrderItem.belongsTo(Order, {
    foreignKey: 'orderId',
});

// Product ↔ OrderItem
Product.hasMany(OrderItem, {
    foreignKey: 'productId',
});

OrderItem.belongsTo(Product, {
    foreignKey: 'productId',
});

const models = {
    Customer,
    Product,
    Order,
    OrderItem,
};

export default models;
