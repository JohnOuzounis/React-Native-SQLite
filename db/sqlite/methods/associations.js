const getForeignKeyName = (model, options = {}) => ({
    name:
        typeof options.foreignKey === 'string'
            ? options.foreignKey
            : options.foreignKey?.name || `${model.modelName.toLowerCase()}Id`,
});

const getAlias = (model, options = {}) =>
    options.as || model.modelName.toLowerCase();

const getPrimaryKey = model =>
    Object.entries(model.attributes).find(
        ([, attribute]) => attribute.primaryKey,
    )?.[0] || 'id';

const getTargetModel = (sqlite, target) => {
    if (typeof target === 'string') {
        return sqlite.models[target];
    }

    if (typeof target === 'object' && target.modelName) {
        return sqlite.models[target.modelName];
    }

    throw new Error(`Invalid target model: ${target}`);
};

const registerAssociation = (
    sourceModel,
    alias,
    associationType,
    targetModel,
    foreignKey,
    referenceKey,
) => {
    sourceModel.associations ??= {};

    sourceModel.associations[targetModel.modelName] = {
        as: alias,
        associationType,
        isSingleAssociation:
            associationType === 'belongsTo' || associationType === 'hasOne',
        isMultiAssociation:
            associationType === 'hasMany' ||
            associationType === 'belongsToMany',
        target: targetModel,
        foreignKey,
        referenceKey,
    };
};

const belongsTo = ({ model, args, sqlite }) => {
    const [target, options = {}] = args;

    const targetModel = getTargetModel(sqlite, target);

    const foreignKey = getForeignKeyName(targetModel, options);
    const referenceKey = getPrimaryKey(targetModel);
    const as = getAlias(targetModel, options);

    registerAssociation(
        model,
        as,
        'belongsTo',
        targetModel,
        foreignKey.name,
        referenceKey,
    );
};

const hasOne = ({ model, args, sqlite }) => {
    const [target, options = {}] = args;

    const targetModel = getTargetModel(sqlite, target);

    const foreignKey = getForeignKeyName(model, options);
    const referenceKey = getPrimaryKey(model);
    const as = getAlias(targetModel, options);

    registerAssociation(
        model,
        as,
        'hasOne',
        targetModel,
        foreignKey.name,
        referenceKey,
    );
};

const hasMany = ({ model, args, sqlite }) => {
    const [target, options = {}] = args;

    const targetModel = getTargetModel(sqlite, target);

    const foreignKey = getForeignKeyName(model, options);
    const referenceKey = getPrimaryKey(model);
    const as = getAlias(targetModel, options);

    registerAssociation(
        model,
        as,
        'hasMany',
        targetModel,
        foreignKey.name,
        referenceKey,
    );
};

const belongsToMany = ({ model, args, sqlite }) => {};

export default { belongsTo, belongsToMany, hasOne, hasMany };
