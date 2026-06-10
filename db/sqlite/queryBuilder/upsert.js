import {
    generateWhereClause,
    getConflictColumns,
    generateConflictClause,
} from '../utils/query-utils';
import generateInsert from './insert';

const generateUpsert = (model, data, options, sqlite) => {
    const { where } = options;
    const { attributes } = model;
    const columns = { ...data };

    const filteredAttributes = Object.entries(attributes)
        .filter(([attrName, config]) => columns.hasOwnProperty(attrName))
        .reduce((acc, [attrName, config]) => {
            acc[attrName] = config;
            return acc;
        }, {});

    const conflictColumns = getConflictColumns(
        Object.keys(filteredAttributes).length === 0
            ? attributes
            : filteredAttributes,
    );

    const updatableColumns = Object.keys(data).filter(
        key => !conflictColumns.includes(key),
    );

    const updateValues = [
        ...updatableColumns.map(key => `${key} = EXCLUDED.${key}`),
        `updatedAt = DATETIME('now')`,
    ].join(', ');

    const insertQuery = generateInsert(model, columns, sqlite).replace(
        /;$/,
        '',
    );
    const conflictClause = generateConflictClause(conflictColumns);
    const whereClause = generateWhereClause(model.modelName, where);

    const upsertQuery = `${insertQuery}${conflictClause} DO UPDATE SET ${updateValues};`;

    return upsertQuery;
};

export default generateUpsert;
