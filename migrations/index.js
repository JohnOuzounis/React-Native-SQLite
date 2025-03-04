const createUser = {
    name: '001-create-user',
    up: async (queryInterface, sqlite) => {
        await queryInterface.createTable('Users', {
            id: {
                type: sqlite.datatypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
            },
            username: {
                type: sqlite.datatypes.STRING,
                allowNull: false,
                unique: true,
            },
            createdAt: {
                type: sqlite.datatypes.DATE,
                defaultValue: sqlite.fn('NOW'),
                allowNull: false,
            },
            updatedAt: {
                type: sqlite.datatypes.DATE,
                defaultValue: sqlite.fn('NOW'),
                allowNull: false,
            },
            deletedAt: {
                type: sqlite.datatypes.DATE,
            },
        });
    },
    down: async (queryInterface, sqlite) => {
        await queryInterface.dropTable('Users');
    },
};

const createTest = {
    name: '002-create-test',
    up: async (queryInterface, sqlite) => {
        await queryInterface.createTable('Tests', {
            test: {
                type: sqlite.datatypes.STRING,
            },
        });
    },
    down: async (queryInterface, sqlite) => {
        await queryInterface.dropTable('Tests');
    },
};

const addUserPhone = {
    name: '003-add-user-phone',
    up: async (queryInterface, sqlite) => {
        await queryInterface.addColumn('Users', 'phone', {
            type: sqlite.datatypes.STRING,
        });
    },
    down: async (queryInterface, sqlite) => {
        await queryInterface.dropColumn('Users', 'phone');
    },
};

const addUserBobo = {
    name: '003-add-user-bobo',
    up: async (queryInterface, sqlite) => {
        await queryInterface.addColumn('Users', 'bobo', {
            type: sqlite.datatypes.STRING,
        });
    },
    down: async (queryInterface, sqlite) => {
        await queryInterface.dropColumn('Users', 'bobo');
    },
};

const migrations = [createUser, createTest, addUserPhone, addUserBobo];

export default migrations;
