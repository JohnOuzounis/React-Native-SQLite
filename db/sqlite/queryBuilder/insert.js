import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

const generateInsert = (model, data, sqlite) => {
    if (model.attributes) {
        for (const [column, attributes] of Object.entries(model.attributes)) {
            const isUuidPrimaryKey =
                attributes.primaryKey &&
                attributes.type === sqlite.datatypes.UUID;

            const needsValue =
                data[column] === undefined || data[column] === null;

            if (isUuidPrimaryKey && needsValue) {
                data[column] = uuidv4();
            }
        }
    }

    if (model.timestamps) {
        data.createdAt = {
            sql: sqlite.fn('NOW', ...(model.localtime ? ["'localtime'"] : [])),
        };
        data.updatedAt = {
            sql: sqlite.fn('NOW', ...(model.localtime ? ["'localtime'"] : [])),
        };
    }

    const columns = Object.keys(data).join(', ');
    const values = Object.values(data)
        .map(value => {
            if (value === null) {
                return 'NULL';
            }
            if (typeof value === 'string') {
                return `'${value.replace(/'/g, "''")}'`;
            }
            if (typeof value === 'object') {
                return value.sql;
            }
            if (value instanceof Date) {
                return `'${value.toISOString()}'`;
            }
            return value;
        })
        .join(', ');

    const insertQuery = `INSERT INTO ${model.modelName} (${columns}) VALUES (${values});`;
    return insertQuery;
};

export default generateInsert;
