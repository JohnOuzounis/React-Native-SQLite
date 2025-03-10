import logger from '../logger/logger';
import builder from '../queryBuilder';

const update = async params => {
    const { model, args, sqlite } = params;
    const [data = {}, options = {}] = args;
    const updateQuery = builder.update(model, data, options, sqlite);
    logger.log(updateQuery);

    await sqlite.instance.execAsync(`${updateQuery}`);
};

const upsert = async params => {
    const { model, args, sqlite } = params;
    const [data = {}, options = {}] = args;
    const upsertQuery = builder.upsert(model, data, options, sqlite);
    logger.log(upsertQuery);

    await sqlite.instance.execAsync(`${upsertQuery}`);
};

export default { update, upsert };
