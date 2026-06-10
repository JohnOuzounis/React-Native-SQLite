import logger from '../logger/logger';
import builder from '../queryBuilder';

import { getLastUpdatedRow } from '../utils/query-utils';

const update = async params => {
    const { model, args, sqlite } = params;
    const [data = {}, options = {}] = args;
    const updateQuery = builder.update(model, data, options, sqlite);
    logger.log(updateQuery);

    await sqlite.instance.execAsync(`${updateQuery}`);

    const getLastRowQuery = getLastUpdatedRow(model, options);
    const result = await sqlite.instance.getAllAsync(getLastRowQuery);

    const lastRow = result[0] || null;
    return lastRow;
};

const upsert = async params => {
    const { model, args, sqlite } = params;
    const [data = {}, options = {}] = args;
    const upsertQuery = builder.upsert(model, data, options, sqlite);
    logger.log(upsertQuery);

    await sqlite.instance.execAsync(`${upsertQuery}`);
};

export default { update, upsert };
