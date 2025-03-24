import { Op } from './operations';

const parseValue = value => {
    if (value === null) {
        return 'NULL';
    }
    if (typeof value === 'string') {
        return `'${value.replace(/'/g, "''")}'`;
    }
    if (value instanceof Date) {
        return `'${value.toISOString()}'`;
    }
    return value;
};

export const generateColumns = attributes => {
    if (!attributes || attributes.length <= 0) return '*';

    const columns = attributes
        .map(attr => {
            if (Array.isArray(attr)) {
                const func = attr[0];
                const alias = attr[1];
                return `${func} AS ${alias}`;
            }
            return attr;
        })
        .join(', ');

    return columns;
};

export const generateWhereClause = (modelName, where) => {
    if (!where || Object.keys(where).length === 0) return '';

    const buildCondition = ([key, condition]) => {
        if (Array.isArray(condition)) {
            const values = condition.map(parseValue).join(', ');
            return `\`${modelName}\`.\`${key}\` ${Op.IN} (${values})`;
        }

        if (typeof condition === 'object' && condition !== null) {
            const clauses = Object.entries(condition).map(([op, value]) => {
                if (Array.isArray(value)) {
                    const values = value.map(parseValue).join(', ');
                    return `\`${modelName}\`.\`${key}\` ${op} (${values})`;
                }

                return `\`${modelName}\`.\`${key}\` ${op} ${parseValue(value)}`;
            });
            return clauses.join(' AND ');
        }

        return `\`${modelName}\`.\`${key}\` ${Op.EQ} ${parseValue(condition)}`;
    };

    const buildClause = where => {
        return Object.entries(where)
            .map(([key, value]) => {
                if (key === Op.OR || key === Op.AND) {
                    const subConditions = value
                        .map(subWhere => `${buildClause(subWhere)}`)
                        .join(` ${key} `);
                    return `(${subConditions})`;
                } else {
                    return buildCondition([key, value]);
                }
            })
            .join(` ${Op.AND} `);
    };

    return ` WHERE ${buildClause(where)}`;
};

export const generateLimitClause = limit => (limit ? ` LIMIT ${limit}` : '');
export const generateOffsetClause = offset =>
    offset ? ` OFFSET ${offset}` : '';

export const generateOrderByClause = (model, order) => {
    return order
        ? ` ORDER BY ${order
              .map(([col, dir]) => `'${model}'.'${col}' ${dir}`)
              .join(', ')}`
        : '';
};

export const generateGroupByClause = (model, group) => {
    return group
        ? ` GROUP BY ${group.map(col => `'${model}'.'${col}'`).join(', ')}`
        : '';
};

export const generateIncludeClause = (modelName, include = []) => {
    if (include.length === 0) return '';

    return include
        .map(joinObj => {
            const { model, on, type = 'INNER' } = joinObj;
            const [leftCol, rightCol] = on;
            return ` ${type.toUpperCase()} JOIN ${model} ON '${modelName}'.'${leftCol}' = '${model}'.'${rightCol}'`;
        })
        .join(' ');
};

export const getConflictColumns = attributes =>
    Object.keys(attributes).filter(
        attr => attributes[attr].primaryKey || attributes[attr].unique
    );

export const generateConflictClause = conflictColumns => {
    const conflictClause =
        conflictColumns && conflictColumns.length > 0
            ? ` ON CONFLICT(${conflictColumns.join(', ')})`
            : '';

    return conflictClause;
};

export const getLastInsertedRow = model => {
    const pk = Object.keys(model.attributes).filter(
        attr => model.attributes[attr].primaryKey
    )[0];

    const getLastRowQuery = `SELECT * FROM ${model.modelName} WHERE ${pk || 'id'} = (SELECT last_insert_rowid());`;
    return getLastRowQuery;
};

export const getLastUpdatedRow = (model, options) => {
    const getLastRowQuery = `SELECT * FROM ${model.modelName} ${generateWhereClause(model.modelName, options.where)};`;
    return getLastRowQuery;
};
