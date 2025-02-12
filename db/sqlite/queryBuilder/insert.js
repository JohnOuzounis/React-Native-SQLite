const generateInsert = (model, data, sqlite) => {
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
