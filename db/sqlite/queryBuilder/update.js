import { generateWhereClause } from '../utils';

export const generateUpdate = (model, data, options) => {
    const { where } = options;

    if (model.timestamps) {
        data.updatedAt = {
            sql: sqlite.fn('NOW', ...(model.localtime ? ["'localtime'"] : [])),
        };
    }

    const whereClause = generateWhereClause(model.modelName, where);
    const columns = Object.entries(data)
        .map(([name, value]) => {
            if (typeof value === 'string') {
                return ` ${name} = '${value.replace(/'/g, "''")}'`;
            }
            if (typeof value === 'object') {
                return `${name} = ${value.sql}`;
            }
            if (value instanceof Date) {
                return `${name} = '${value.toISOString()}'`;
            }
            return value;
        })
        .join(', ');

    const updateQuery = `UPDATE ${model.modelName} SET ${columns}${whereClause};`;
    return updateQuery;
};

export default generateUpdate;
