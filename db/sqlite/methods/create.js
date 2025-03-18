import logger from '../logger/logger';
import builder from '../queryBuilder/index';
import { getLastInsertedRow } from '../utils';

async function init(params) {
    const { model, sqlite } = params;
    const createQuery = builder.create(model, sqlite);
    logger.log(createQuery);

    await sqlite.instance.execAsync(`${createQuery}`);
}

async function create(params) {
    const { model, args, sqlite } = params;
    const [data = {}] = args;
    const insertQuery = builder.insert(model, data, sqlite);
    logger.log(insertQuery);

    await sqlite.instance.execAsync(`${insertQuery}`);

    const getLastRowQuery = getLastInsertedRow(model);
    const result = await sqlite.instance.getAllAsync(getLastRowQuery);

    const lastRow = result[0] || null;
    return lastRow;
}

async function bulkCreate(params) {
    const { model, args, sqlite } = params;
    const [data = []] = args;
    const insertQuery = data
        .map(entry => builder.insert(model, entry, sqlite))
        .join(' ');
    logger.log(insertQuery);

    await sqlite.instance.withExclusiveTransactionAsync(async () => {
        await sqlite.instance.execAsync(`${insertQuery}`);
    });
}

export default { init, create, bulkCreate };
