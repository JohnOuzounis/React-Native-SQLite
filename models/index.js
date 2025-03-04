import { sqlite } from '../db/database';

const User = sqlite.define(
    'Users',
    {
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
    },
    { localtime: true, paranoid: true }
);

const Food = sqlite.define('Food', {
    protein: {
        type: sqlite.datatypes.INTEGER,
    },
    fat: {
        type: sqlite.datatypes.INTEGER,
    },
    carb: {
        type: sqlite.datatypes.INTEGER,
    },
});

const models = {
    User,
    Food,
};

export default models;
