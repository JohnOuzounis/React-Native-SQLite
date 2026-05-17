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

export const generateIncludeClause = (modelName, include = []) => {
    if (include.length === 0) return '';

    const processInclude = includeArray => {
        return includeArray
            .map(joinObj => {
                const {
                    model,
                    on,
                    type = 'INNER',
                    include: nestedInclude = [],
                    target = modelName,
                } = joinObj;
                const [leftCol, rightCol] = on;

                let joinClause = ` ${type.toUpperCase()} JOIN ${model} ON ${target}.${leftCol} = ${model}.${rightCol}`;

                if (nestedInclude.length) {
                    joinClause += processInclude(nestedInclude);
                }

                return joinClause;
            })
            .join(' ');
    };

    return processInclude(include);
};

export const getConflictColumns = attributes =>
    Object.keys(attributes).filter(
        attr => attributes[attr].primaryKey || attributes[attr].unique,
    );

export const generateConflictClause = conflictColumns => {
    const conflictClause =
        conflictColumns && conflictColumns.length > 0
            ? ` ON CONFLICT(${conflictColumns.join(', ')})`
            : '';

    return conflictClause;
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

export const getGroupedResults = (results, model, include, sqlite) => {
    if (!include) return results;

    const pk = Object.keys(model.attributes).find(
        attr => model.attributes[attr].primaryKey,
    );

    const processInclude = (
        groupedResult,
        result,
        includeArray,
        parentModel,
    ) => {
        includeArray.forEach(inc => {
            const {
                model: incModel,
                attributes: incAttributes,
                on,
                as = incModel,
                target = parentModel.modelName,
                include: nestedInclude = [],
            } = inc;

            const groupModel = sqlite.models[target];
            const foreignKey = on[1];

            const hasOneAssoc = groupModel.associations?.hasOne?.find(
                assoc =>
                    assoc.target === incModel &&
                    assoc.foreignKey === foreignKey,
            );

            const hasManyAssoc = groupModel.associations?.hasMany?.find(
                assoc =>
                    assoc.target === incModel &&
                    assoc.foreignKey === foreignKey,
            );

            const belongsToManyAssoc = sqlite.models[
                incModel
            ].associations?.belongsToMany?.find(
                assoc => assoc.through === target,
            );

            const relatedItem = {};
            incAttributes.forEach(attr => {
                const key = Array.isArray(attr) ? attr[1] : attr;
                relatedItem[key] = result[key];
                delete groupedResult[key];
            });

            if (hasOneAssoc) {
                groupedResult[as] = relatedItem;
            } else if (hasManyAssoc || belongsToManyAssoc) {
                if (!groupedResult[as]) {
                    groupedResult[as] = [];
                }

                groupedResult[as].push(relatedItem);
            }

            if (nestedInclude.length) {
                processInclude(
                    relatedItem,
                    result,
                    nestedInclude,
                    sqlite.models[incModel],
                );
            }
        });
    };

    return results.reduce((acc, result) => {
        let groupedResult = acc.find(item => item[pk] === result[pk]);

        if (!groupedResult) {
            groupedResult = { ...result };
            acc.push(groupedResult);
        }

        processInclude(groupedResult, result, include, model);

        return acc;
    }, []);
};
