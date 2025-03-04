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
        const [modelName] = args;
        const dropQuery = queryBuilder.drop({ modelName });

        await sqlite.instance.execAsync(`${dropQuery}`);
    },

    addColumn: async ({ sqlite, args }) => {
        const [modelName, columnName, attributes] = args;
        const addColumnQuery = queryBuilder.alter({ modelName }, 'ADDCOLUMN', {
            columnName,
            attributes,
        });

        await sqlite.instance.execAsync(`${addColumnQuery}`);
    },

    dropColumn: async ({ sqlite, args }) => {
        const [modelName, columnName] = args;
        const dropColumnQuery = queryBuilder.alter(
            { modelName },
            'DROPCOLUMN',
            {
                columnName,
            }
        );

        await sqlite.instance.execAsync(`${dropColumnQuery}`);
    },

    updateColumn: async ({ sqlite, args }) => {
        // Logic to change column
        // create new table with changed column
        // copy old data to new table
        // rename new table to old table

        const [tableName, columnName, attributes] = args;
        throw Error('Not implemented yet!');
    },

    renameTable: async ({ sqlite, args }) => {
        const [modelName, newName] = args;
        const renameQuery = queryBuilder.alter({ modelName }, 'RENAMETABLE', {
            newName,
        });

        await sqlite.instance.execAsync(`${renameQuery}`);
    },

    renameColumn: async ({ sqlite, args }) => {
        const [modelName, columnName, newName] = args;
        const renameQuery = queryBuilder.alter({ modelName }, 'RENAMECOLUMN', {
            columnName,
            newName,
        });

        await sqlite.instance.execAsync(`${renameQuery}`);
    },

    addConstraint: async ({ sqlite, args }) => {
        // Logic to add constraint
        const [tableName, constraintName, options] = args;
        throw Error('Not implemented yet!');
    },

    dropConstraint: async ({ sqlite, args }) => {
        // Logic to drop constraint
        const [tableName, constraintName] = args;
        throw Error('Not implemented yet!');
    },

    bulkCreate: async ({ sqlite, args }) => {
        const [modelName, records] = args;
        const insertQuery = records
            .map(entry => queryBuilder.insert({ modelName }, entry, sqlite))
            .join(' ');

        await sqlite.instance.withExclusiveTransactionAsync(async () => {
            await sqlite.instance.execAsync(`${insertQuery}`);
        });
    },

    bulkUpdate: async ({ sqlite, args }) => {
        // Logic to update records in bulk
        const [tableName, records, where] = args;
        throw Error('Not implemented yet!');
    },

    bulkDestroy: async ({ sqlite, args }) => {
        const [modelName, options] = args;
        const deleteQuery = queryBuilder.delete({ modelName }, options);

        await sqlite.instance.execAsync(`${deleteQuery}`);
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
