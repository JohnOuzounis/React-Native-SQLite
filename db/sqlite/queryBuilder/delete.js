import { generateWhereClause } from '../utils';
import generateUpdate from './update';

const generateDelete = (model, options) => {
    const { where } = options;

    if (model.paranoid) {
        const updateQuery = generateUpdate(
            model,
            { deletedAt: new Date() },
            options
        );
        return updateQuery;
    }

    const whereClause = generateWhereClause(model.modelName, where);
    const deleteQuery = `DELETE FROM ${model.modelName}${whereClause};`;

    return deleteQuery;
};

export default generateDelete;
