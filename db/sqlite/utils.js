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

    const processInclude = (includeArray, parentModel = modelName) => {
        return includeArray
            .map(joinObj => {
                const {
                    model,
                    on,
                    type = 'INNER',
                    include: nestedInclude = [],
                    target = parentModel,
                } = joinObj;

                if (!Array.isArray(on)) {
                    throw new Error(
                        `Include "${model}" is missing a valid "on" clause. Received: ${JSON.stringify(on)}`,
                    );
                }
                const [leftCol, rightCol] = on;

                let joinClause = ` ${type.toUpperCase()} JOIN ${model} ON ${target}.${leftCol} = ${model}.${rightCol}`;

                if (nestedInclude.length) {
                    joinClause += processInclude(nestedInclude, model);
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

const getPrimaryKey = (model, attributes) => {
    const pkEntry = Object.entries(model.attributes).find(
        ([, attribute]) => attribute.primaryKey === true,
    );

    return pkEntry ? pkEntry[0] : 'id';
};
export const getGroupedResults = (results, model, options = {}, sqlite) => {
    const { include, attributes, unique } = options;

    if (!include || !include.length) return results;

    const getNodeData = (row, attrs) => {
        const data = {};
        for (const attr of attrs) {
            if (Array.isArray(attr)) {
                data[attr[1]] = row[attr[1]];
            } else {
                data[attr] = row[attr];
            }
        }
        return data;
    };

    const getModelDef = (joinObj, sqlite) => {
        const modelRef = joinObj.model;
        const modelName =
            typeof modelRef === 'string' ? modelRef : modelRef.modelName;
        return sqlite.models[modelName];
    };

    // Recursive helper: ensures that `parentNode` has the correct children
    // according to the `includes` tree, using data from `row`.
    const processIncludes = (parentNode, row, includes, parentModel) => {
        for (const joinObj of includes) {
            const {
                as,
                unique: childUnique,
                attributes: joinAttrs,
                include: nestedInclude = [],
                model: joinModel,
            } = joinObj;

            const association = parentModel.associations?.[joinModel];

            if (!association) {
                throw new Error(
                    `Association "${as}" not found on model "${parentModel.modelName}"`,
                );
            }

            const childModel = association.target;
            const childAttrs = Object.keys(childModel.attributes);
            const isMany = association.isMultiAssociation;

            const childId = row[childUnique];

            if (childId === null || childId === undefined) {
                continue;
            }

            parentNode.__children ??= {};
            parentNode.__children[as] ??= new Map();

            const childMap = parentNode.__children[as];

            let childNode = childMap.get(childId);

            if (!childNode) {
                childNode = getNodeData(row, joinAttrs || childAttrs);

                childMap.set(childId, childNode);

                if (isMany) {
                    parentNode[as] ??= [];
                    parentNode[as].push(childNode);
                } else {
                    parentNode[as] = childNode;
                }
            }

            if (nestedInclude.length) {
                processIncludes(childNode, row, nestedInclude, childModel);
            }
        }
    };

    const rootModel = sqlite.models[model.modelName];
    const rootAttrs = Object.keys(rootModel.attributes);
    const rootMap = new Map();

    for (const row of results) {
        const rootId = row[unique];
        let rootNode = rootMap.get(rootId);

        if (!rootNode) {
            rootNode = getNodeData(row, attributes || rootAttrs);
            rootMap.set(rootId, rootNode);
        }

        // Process all includes (including nested) for this root node
        processIncludes(rootNode, row, include, rootModel);
    }

    // Remove internal __children property from all nodes
    const clean = node => {
        if (node.__children) {
            for (const key of Object.keys(node.__children)) {
                // Recursively clean grandchildren
                for (const childNode of node.__children[key].values()) {
                    clean(childNode);
                }
            }
            delete node.__children;
        }
        // Also clean any array children that might have __children (they will be cleaned by recursion)
        for (const prop of Object.keys(node)) {
            if (Array.isArray(node[prop])) {
                node[prop].forEach(child => {
                    if (typeof child === 'object' && child !== null)
                        clean(child);
                });
            }
        }
    };

    const result = Array.from(rootMap.values());
    for (const root of result) clean(root);
    return result;
};
