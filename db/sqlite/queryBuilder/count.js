import { generateWhereClause } from "../utils";

const generateCount = (modelName, where, as) => {
  const whereClause = generateWhereClause(modelName, where);
  const countQuery = `SELECT COUNT(*) as ${as} FROM ${modelName}${whereClause};`;

  return countQuery;
};

export default generateCount;
