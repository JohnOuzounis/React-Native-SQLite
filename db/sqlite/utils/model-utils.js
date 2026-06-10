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

export const getConflictColumns = attributes =>
    Object.keys(attributes).filter(
        key => attributes[key].primaryKey || attributes[key].unique,
    );
