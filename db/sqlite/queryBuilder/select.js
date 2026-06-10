import { Op } from '../operations';
import {
    generateColumns,
    generateIncludeClause,
    generateLimitClause,
    generateOffsetClause,
    generateOrderByClause,
    generateWhereClause,
} from '../utils/query-utils';

const generateSelect = (model, options, sqlite) => {
    const { where, attributes, include, order, limit, offset } = options;
    const columns = generateColumns(attributes, include);

    const whereOptions = model.paranoid
        ? { ...where, deletedAt: { [Op.IS]: null } }
        : where;

    const whereClause = generateWhereClause(model.modelName, whereOptions);
    const limitClause = generateLimitClause(limit);
    const offsetClause = generateOffsetClause(offset);
    const orderbyClause = generateOrderByClause(model.modelName, order);
    const includeClause = generateIncludeClause(
        model.modelName,
        include,
        sqlite,
    );

    const selectQuery =
        `SELECT ${columns} FROM ${model.modelName}${includeClause}${whereClause}${orderbyClause}${limitClause}${offsetClause};`.trim();
    return selectQuery;
};

export default generateSelect;
