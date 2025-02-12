import { sqlite } from '../db/database';

const User = sqlite.define('User', {
    email: {
        type: sqlite.datatypes.STRING,
        primaryKey: true,
        allowNull: false,
    },
    value: {
        type: sqlite.datatypes.STRING,
    },
    intValue: {
        type: sqlite.datatypes.INTEGER,
    },
});

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
