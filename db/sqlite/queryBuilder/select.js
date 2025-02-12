import {
    generateColumns,
    generateIncludeClause,
    generateLimitClause,
    generateOffsetClause,
    generateOrderByClause,
    generateWhereClause,
} from '../utils';

const generateSelect = (model, options) => {
    const { where, attributes, include, order, limit, offset } = options;

    const columns = generateColumns(attributes);

    const whereClause = generateWhereClause(model.modelName, where);
    const limitClause = generateLimitClause(limit);
    const offsetClause = generateOffsetClause(offset);
    const orderbyClause = generateOrderByClause(model.modelName, order);
    const includeClause = generateIncludeClause(model.modelName, include);

    const selectQuery =
        `SELECT ${columns} FROM ${model.modelName}${includeClause}${whereClause}${orderbyClause}${limitClause}${offsetClause};`.trim();
    return selectQuery;
};

export default generateSelect;
