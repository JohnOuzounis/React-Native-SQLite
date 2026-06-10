import {
    getTargetModel,
    getAlias,
    getForeignKeyName,
    getPrimaryKey,
} from '../utils/association-utils';

const registerAssociation = (
    sourceModel,
    alias,
    associationType,
    targetModel,
    foreignKey,
    referenceKey,
) => {
    sourceModel.associations ??= {};

    if (sourceModel.associations[alias]) {
        throw new Error(
            `Association alias "${alias}" already exists on "${sourceModel.modelName}"`,
        );
    }

    sourceModel.associations[alias] = {
        as: alias,
        associationType,
        target: targetModel,
        foreignKey,
        referenceKey,
    };
};

const createAssociation =
    associationType =>
    ({ model, args, sqlite }) => {
        const [target, options = {}] = args;

        const targetModel = getTargetModel(sqlite, target);

        const foreignKey =
            associationType === 'belongsTo'
                ? getForeignKeyName(targetModel, options)
                : getForeignKeyName(model, options);

        const referenceKey =
            associationType === 'belongsTo'
                ? getPrimaryKey(targetModel)
                : getPrimaryKey(model);

        registerAssociation(
            model,
            getAlias(targetModel, options),
            associationType,
            targetModel,
            foreignKey,
            referenceKey,
        );
    };

export const belongsTo = createAssociation('belongsTo');
export const hasOne = createAssociation('hasOne');
export const hasMany = createAssociation('hasMany');

export const belongsToMany = ({ model, args, sqlite }) => {
    const [target, options = {}] = args;

    if (!options.through) {
        throw new Error(
            `belongsToMany("${target}") requires a "through" model`,
        );
    }

    const throughModel = getTargetModel(sqlite, options.through);
    const targetModel = getTargetModel(sqlite, target);

    const sourceForeignKey =
        options.foreignKey || `${model.modelName.toLowerCase()}Id`;

    const targetForeignKey =
        options.otherKey || `${targetModel.modelName.toLowerCase()}Id`;

    // Source -> Through
    hasMany({
        model,
        sqlite,
        args: [
            throughModel,
            {
                as: options.throughAs || throughModel.modelName.toLowerCase(),
                foreignKey: sourceForeignKey,
            },
        ],
    });

    // Target -> Through
    hasMany({
        model: targetModel,
        sqlite,
        args: [
            throughModel,
            {
                as:
                    options.inverseThroughAs ||
                    throughModel.modelName.toLowerCase(),
                foreignKey: targetForeignKey,
            },
        ],
    });

    // Through -> Source
    belongsTo({
        model: throughModel,
        sqlite,
        args: [
            model,
            {
                foreignKey: sourceForeignKey,
            },
        ],
    });

    // Through -> Target
    belongsTo({
        model: throughModel,
        sqlite,
        args: [
            targetModel,
            {
                foreignKey: targetForeignKey,
            },
        ],
    });

    // // Source -> Target (virtual association)
    // registerAssociation(
    //     model,
    //     getAlias(targetModel, options),
    //     'belongsToMany',
    //     targetModel,
    //     sourceForeignKey,
    //     getPrimaryKey(targetModel),
    // );

    // // Target -> Source (inverse virtual association)
    // registerAssociation(
    //     targetModel,
    //     options.inverseAs || model.modelName.toLowerCase(),
    //     'belongsToMany',
    //     model,
    //     targetForeignKey,
    //     getPrimaryKey(model),
    // );
};

export default { belongsTo, hasOne, hasMany, belongsToMany };
