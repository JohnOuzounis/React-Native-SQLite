import { generateWhereClause } from "../utils";

const generateDelete = (model, options) => {
  const { where } = options;

  const whereClause = generateWhereClause(model.modelName, where);
  const deleteQuery = `DELETE FROM ${model.modelName}${whereClause};`;

  return deleteQuery;
};

export default generateDelete;
