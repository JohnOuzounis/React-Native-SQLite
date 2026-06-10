import { Op } from '../operations';
import { getAssociation } from './association-utils';

export const parseValue = value => {
    if (value === null) return 'NULL';

    if (typeof value === 'string') {
        return `'${value.replace(/'/g, "''")}'`;
    }

    if (value instanceof Date) {
        return `'${value.toISOString()}'`;
    }

    return value;
};

export const getLastInsertedRow = (model, data) => {
    const pk =
        Object.keys(model.attributes).filter(
            attr => model.attributes[attr].primaryKey,
        )[0] || 'id';

    const value = data[pk]
        ? parseValue(data[pk])
        : `(SELECT (last_insert_rowid()))`;

    const getLastRowQuery = `SELECT * FROM ${model.modelName} WHERE ${pk} = ${value};`;
    return getLastRowQuery;
};

export const getLastUpdatedRow = (model, options) => {
    const getLastRowQuery = `SELECT * FROM ${model.modelName} ${generateWhereClause(model.modelName, options.where)};`;
    return getLastRowQuery;
};

export const getConflictColumns = attributes =>
    Object.keys(attributes).filter(
        attr => attributes[attr].primaryKey || attributes[attr].unique,
    );

export const generateColumns = (attributes, include) => {
    if (!attributes || attributes.length === 0) return '*';

    const processIncludeColumns = includeArray => {
        return includeArray.flatMap(joinObj => {
            const columns = (joinObj.attributes || []).map(attr => {
                if (Array.isArray(attr)) {
                    const func = attr[0];
                    const alias = attr[1];
                    return `${func} AS ${alias}`;
                }
                return `${joinObj.model}.${attr}`;
            });

            if (joinObj.include) {
                return [...columns, ...processIncludeColumns(joinObj.include)];
            }
            return columns;
        });
    };

    const mainColumns = attributes.map(attr => {
        if (Array.isArray(attr)) {
            const func = attr[0];
            const alias = attr[1];
            return `${func} AS ${alias}`;
        }
        return attr;
    });

    const includeColumns = include ? processIncludeColumns(include) : [];

    return [...mainColumns, ...includeColumns].join(', ');
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

export const generateConflictClause = conflictColumns => {
    const conflictClause =
        conflictColumns && conflictColumns.length > 0
            ? ` ON CONFLICT(${conflictColumns.join(', ')})`
            : '';

    return conflictClause;
};

export const generateIncludeClause = (modelName, include = [], sqlite) => {
    if (include.length === 0) return '';

    const processInclude = (includeArray, parentModel = modelName) => {
        return includeArray
            .map(joinObj => {
                const {
                    model,
                    as,
                    on: joinOn,
                    type = 'INNER',
                    include: nestedInclude = [],
                    target = parentModel,
                } = joinObj;

                const association = getAssociation(
                    parentModel,
                    model,
                    sqlite,
                    as,
                );
                if (!association) {
                    throw new Error(
                        `Association "${model}" not found on model "${parentModel}"`,
                    );
                }

                let leftSide;
                let rightSide;

                if (joinOn) {
                    const [leftCol, rightCol] = joinOn;

                    leftSide = `${target}.${leftCol}`;
                    rightSide = `${model}.${rightCol}`;
                } else {
                    switch (association.associationType) {
                        case 'belongsTo':
                            leftSide = `${target}.${association.foreignKey}`;
                            rightSide = `${model}.${association.referenceKey}`;
                            break;

                        case 'hasOne':
                        case 'hasMany':
                            leftSide = `${target}.${association.referenceKey}`;
                            rightSide = `${model}.${association.foreignKey}`;
                            break;

                        default:
                            throw new Error(
                                `Unsupported association type: ${association.associationType}`,
                            );
                    }
                }

                let joinClause = ` ${type.toUpperCase()} JOIN ${model} ON ${leftSide} = ${rightSide}`;

                if (nestedInclude.length) {
                    joinClause += processInclude(nestedInclude, model);
                }

                return joinClause;
            })
            .join(' ');
    };

    return processInclude(include);
};
