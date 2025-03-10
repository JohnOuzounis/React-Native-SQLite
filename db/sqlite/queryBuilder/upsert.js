import {
    generateWhereClause,
    getConflictColumns,
    generateConflictClause,
} from '../utils';
import generateInsert from './insert';

const generateUpsert = (model, data, options, sqlite) => {
    const { where } = options;
    const { attributes } = model;

    const columns = { ...data, ...where };
    const conflictColumns = getConflictColumns(attributes);
    const updateValues = Object.keys(columns)
        .map(key => `${key} = EXCLUDED.${key}`)
        .join(', ');

    const insertQuery = generateInsert(model, columns, sqlite).replace(
        /;$/,
        ''
    );
    const conflictClause = generateConflictClause(conflictColumns);
    const whereClause = generateWhereClause(model.modelName, where);

    const upsertQuery = `${insertQuery}${conflictClause} DO UPDATE SET ${updateValues}${whereClause};`;

    return upsertQuery;
};

export default generateUpsert;
