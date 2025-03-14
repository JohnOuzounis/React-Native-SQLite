import { generateWhereClause } from '../utils';
import { Op } from '../operations';

export const generateUpdate = (model, data, options, sqlite) => {
    const { where } = options;
    const whereOptions = model.paranoid
        ? { ...where, deletedAt: { [Op.IS]: null } }
        : where;

    if (model.timestamps) {
        data.updatedAt = {
            sql: sqlite.fn('NOW', ...(model.localtime ? ["'localtime'"] : [])),
        };
    }

    const whereClause = generateWhereClause(model.modelName, whereOptions);
    const columns = Object.entries(data)
        .map(([name, value]) => {
            if (value === null) {
                return `${name} = NULL`;
            }
            if (typeof value === 'string') {
                return ` ${name} = '${value.replace(/'/g, "''")}'`;
            }
            if (typeof value === 'object') {
                return `${name} = ${value.sql}`;
            }
            if (value instanceof Date) {
                return `${name} = '${value.toISOString()}'`;
            }
            return `${name} = ${value}`;
        })
        .join(', ');

    const updateQuery = `UPDATE ${model.modelName} SET ${columns}${whereClause};`;
    return updateQuery;
};

export default generateUpdate;
