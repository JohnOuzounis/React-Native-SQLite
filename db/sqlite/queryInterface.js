import queryBuilder from './queryBuilder';

const queryInterfaceMethods = {
    createTable: async ({ sqlite, args }) => {
        const [modelName, attributes] = args;
        const createQuery = queryBuilder.create({
            modelName,
            attributes,
        });

        await sqlite.instance.execAsync(`${createQuery}`);
    },

    dropTable: async ({ sqlite, args }) => {
        const [tableName] = args;
        const dropQuery = queryBuilder.drop({ modelName: tableName });

        await sqlite.instance.execAsync(`${dropQuery}`);
    },

    addColumn: async ({ sqlite, args }) => {
        // Logic to add column
        const [tableName, columnName, attributes] = args;
    },

    dropColumn: async ({ sqlite, args }) => {
        // Logic to drop column
        const [tableName, columnName] = args;
    },

    updateColumn: async ({ sqlite, args }) => {
        // Logic to change column
        const [tableName, columnName, attributes] = args;
    },

    renameTable: async ({ sqlite, args }) => {
        // Logic to rename table
        const [oldTableName, newTableName] = args;
    },

    renameColumn: async ({ sqlite, args }) => {
        // Logic to rename column
        const [tableName, oldColumnName, newColumnName] = args;
    },

    addConstraint: async ({ sqlite, args }) => {
        // Logic to add constraint
        const [tableName, constraintName, options] = args;
    },

    dropConstraint: async ({ sqlite, args }) => {
        // Logic to drop constraint
        const [tableName, constraintName] = args;
    },

    bulkInsert: async ({ sqlite, args }) => {
        // Logic for bulk insert
        const [tableName, records] = args;
    },

    bulkUpdate: async ({ sqlite, args }) => {
        // Logic to update records in bulk
        const [tableName, records, where] = args;
    },

    bulkDelete: async ({ sqlite, args }) => {
        // Logic to delete records in bulk
        const [tableName, where] = args;
    },
};

const createInterface = sqlite => {
    const queryInterface = {};
    Object.entries(queryInterfaceMethods).forEach(([name, func]) => {
        queryInterface[name] = async function (...args) {
            const params = { sqlite, args };
            return await func(params);
        };
    });
    return queryInterface;
};

export default createInterface;
