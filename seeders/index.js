export const seedEcommerce = {
    name: '001-seed-ecommerce',
    up: async queryInterface => {
        // Customers
        await queryInterface.bulkCreate('Customers', [
            { name: 'Alice Johnson', email: 'alice@example.com' },
            { name: 'Bob Smith', email: 'bob@example.com' },
        ]);

        // Products
        await queryInterface.bulkCreate('Products', [
            { name: 'Laptop', price: 999, stock: 10 },
            { name: 'Mouse', price: 19, stock: 50 },
            { name: 'Keyboard', price: 49, stock: 30 },
        ]);

        // Orders (with customer references)
        await queryInterface.bulkCreate('Orders', [
            {
                customerId: 1,
                orderDate: '2025-01-15',
                total: 1019,
            },
            { customerId: 1, orderDate: '2025-02-10', total: 49 },
            { customerId: 2, orderDate: '2025-02-20', total: 999 },
        ]);

        // OrderItems
        await queryInterface.bulkCreate('OrderItems', [
            { orderId: 1, productId: 1, quantity: 1, unitPrice: 999 },
            { orderId: 1, productId: 2, quantity: 1, unitPrice: 19 },
            { orderId: 2, productId: 3, quantity: 1, unitPrice: 49 },
            { orderId: 3, productId: 1, quantity: 1, unitPrice: 999 },
        ]);
    },
    down: async queryInterface => {
        await queryInterface.bulkDestroy('OrderItems');
        await queryInterface.bulkDestroy('Orders');
        await queryInterface.bulkDestroy('Products');
        await queryInterface.bulkDestroy('Customers');
    },
};

export default [seedEcommerce];
