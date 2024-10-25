import { generateGroupByClause, generateWhereClause } from "../utils";

const generateCount = (modelName, where, as, groupBy) => {
  const groupByClause = generateGroupByClause(modelName, groupBy);
  const whereClause = generateWhereClause(modelName, where);
  const countQuery = `SELECT COUNT(*) as ${as} FROM ${modelName}${whereClause}${groupByClause};`;

  return countQuery;
};

export default generateCount;
