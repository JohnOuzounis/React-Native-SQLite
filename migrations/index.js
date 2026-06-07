const createCustomers = {
    name: '001-create-customers',
    up: async (queryInterface, sqlite) => {
        await queryInterface.createTable('Customers', {
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
        });
    },
    down: async queryInterface => {
        await queryInterface.dropTable('Customers');
    },
};

const createProducts = {
    name: '002-create-products',
    up: async (queryInterface, sqlite) => {
        await queryInterface.createTable('Products', {
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
        });
    },
    down: async queryInterface => {
        await queryInterface.dropTable('Products');
    },
};

const createOrders = {
    name: '003-create-orders',
    up: async (queryInterface, sqlite) => {
        await queryInterface.createTable('Orders', {
            id: {
                type: sqlite.datatypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
            },
            customerId: {
                type: sqlite.datatypes.INTEGER,
                allowNull: false,
                references: { model: 'Customers', key: 'id' },
            },
            orderDate: {
                type: sqlite.datatypes.DATE,
            },
            total: {
                type: sqlite.datatypes.INTEGER,
                defaultValue: 0,
            },
        });
    },
    down: async queryInterface => {
        await queryInterface.dropTable('Orders');
    },
};

const createOrderItems = {
    name: '004-create-order-items',
    up: async (queryInterface, sqlite) => {
        await queryInterface.createTable('OrderItems', {
            id: {
                type: sqlite.datatypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
            },
            orderId: {
                type: sqlite.datatypes.INTEGER,
                allowNull: false,
                references: { model: 'Orders', key: 'id' },
            },
            productId: {
                type: sqlite.datatypes.INTEGER,
                allowNull: false,
                references: { model: 'Products', key: 'id' },
            },
            quantity: {
                type: sqlite.datatypes.INTEGER,
                allowNull: false,
            },
            unitPrice: {
                type: sqlite.datatypes.INTEGER,
                allowNull: false,
            },
        });
    },
    down: async queryInterface => {
        await queryInterface.dropTable('OrderItems');
    },
};

const migrations = [
    createCustomers,
    createProducts,
    createOrders,
    createOrderItems,
];

export default migrations;
