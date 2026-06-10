export const getForeignKeyName = (model, options = {}) =>
    typeof options.foreignKey === 'string'
        ? options.foreignKey
        : options.foreignKey?.name || `${model.modelName.toLowerCase()}Id`;

export const getAlias = (model, options = {}) =>
    options.as || model.modelName.toLowerCase();

export const getPrimaryKey = model =>
    Object.entries(model.attributes).find(
        ([, attribute]) => attribute.primaryKey,
    )?.[0] || 'id';

export const getSelectedPrimaryKeyAlias = (model, attributes) => {
    const primaryKey = getPrimaryKey(model);

    for (const attribute of attributes) {
        if (Array.isArray(attribute)) {
            const [source, alias] = attribute;

            if (source === primaryKey || source.endsWith(`.${primaryKey}`)) {
                return alias;
            }
        } else if (attribute === primaryKey) {
            return primaryKey;
        }
    }

    return primaryKey;
};

export const getTargetModel = (sqlite, target) => {
    const modelName = typeof target === 'string' ? target : target?.modelName;

    const model = sqlite.models[modelName];

    if (!model) {
        throw new Error(`Invalid target model: ${target}`);
    }

    return model;
};

export const getAssociation = (
    sourceModelName,
    targetModelName,
    sqlite,
    alias,
) => {
    const sourceModel = sqlite.models[sourceModelName];

    if (!sourceModel?.associations) {
        return null;
    }

    if (alias) {
        return sourceModel.associations[alias] ?? null;
    }

    return Object.values(sourceModel.associations).find(
        association => association.target.modelName === targetModelName,
    );
};

export const isSingleAssociation = type =>
    type === 'belongsTo' || type === 'hasOne';

export const isMultiAssociation = type =>
    type === 'hasMany' || type === 'belongsToMany';
