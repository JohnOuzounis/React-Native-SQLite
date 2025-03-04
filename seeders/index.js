const users = {
    name: '001-add-users',
    up: async (queryInterface, sqlite) => {
        const data = [
            {
                username: 'Bobo Seed',
            },
            {
                username: 'Bobo Seed 1',
            },
            {
                username: 'Bobo Seed 2',
            },
        ];

        await queryInterface.bulkCreate('Users', data);
    },
    down: async (queryInterface, sqlite) => {
        await queryInterface.bulkDestroy('Users', {
            where: {
                username: ['Bobo Seed', 'Bobo Seed 1', 'Bobo Seed 2'],
            },
        });
    },
};

const seeders = [users];

export default seeders;
