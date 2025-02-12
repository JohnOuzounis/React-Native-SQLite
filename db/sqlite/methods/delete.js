import logger from '../logger/logger';
import builder from '../queryBuilder';

const destroy = async params => {
    const { model, args, sqlite } = params;
    const [options = {}] = args;
    const deleteQuery = builder.delete(model, options);
    logger.log(deleteQuery);

    await sqlite.instance.execAsync(`${deleteQuery}`);
};

const drop = async params => {
    const { model, sqlite } = params;
    const dropQuery = builder.drop(model);
    logger.log(dropQuery);

    await sqlite.instance.execAsync(`${dropQuery}`);
};

export default { destroy, drop };
