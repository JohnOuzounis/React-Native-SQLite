import logger from '../logger/logger';
import builder from '../queryBuilder';
import { getGroupedResults } from '../utils';

const findAll = async params => {
    const { model, args, sqlite } = params;
    const [options = {}] = args;
    const selectQuery = builder.select(model, options);
    logger.log(selectQuery);

    const results = await sqlite.instance.getAllAsync(`${selectQuery}`);
    const groupedResults = getGroupedResults(results, model, options, sqlite);

    return groupedResults;
};

const findByPk = async params => {
    const { model, args, sqlite } = params;
    const [pk, options = {}] = args;

    const [sourceKey] = Object.entries(model.attributes).find(
        ([, attribute]) => attribute.primaryKey === true,
    ) || ['id'];

    options.where = {
        [sourceKey]: pk,
    };
    const selectQuery = builder.select(model, options);
    logger.log(selectQuery);

    const result = await sqlite.instance.getAllAsync(`${selectQuery}`);
    const groupedResults = getGroupedResults(result, model, options, sqlite);

    const row = groupedResults[0] || null;
    return row;
};

const findOne = async params => {
    const { model, args, sqlite } = params;
    const [options = {}] = args;
    const selectQuery = builder.select(model, { ...options, limit: 1 });
    logger.log(selectQuery);

    const result = await sqlite.instance.getAllAsync(`${selectQuery}`);
    const groupedResults = getGroupedResults(result, model, options, sqlite);

    const row = groupedResults[0] || null;
    return row;
};

const findAndCountAll = async params => {
    const { model, args, sqlite } = params;
    const [options = {}] = args;
    const query = builder.selectCount(model, options);
    logger.log(query);

    return await sqlite.instance.getAllAsync(`${query}`);
};

export default { findAll, findByPk, findOne, findAndCountAll };
