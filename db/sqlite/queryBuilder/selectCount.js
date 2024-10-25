import {
  generateGroupByClause,
  generateIncludeClause,
  generateLimitClause,
  generateOffsetClause,
  generateOrderByClause,
  generateWhereClause,
} from "../utils";

const generateSelectCount = (model, options) => {
  const {
    where,
    attributes,
    include,
    order,
    limit,
    offset,
    as = "count",
    groupBy,
  } = options;

  const columns =
    attributes && attributes.length > 0 ? attributes.join(", ") : "*";

  const whereClause = generateWhereClause(model.modelName, where);
  const limitClause = generateLimitClause(limit);
  const offsetClause = generateOffsetClause(offset);
  const orderbyClause = generateOrderByClause(model.modelName, order);
  const includeClause = generateIncludeClause(model.modelName, include);
  const groupByClause = generateGroupByClause(model.modelName, groupBy);

  const selectQuery =
    `SELECT ${columns}, COUNT(*) OVER () AS ${as} FROM ${model.modelName}${includeClause}${whereClause}${orderbyClause}${groupByClause}${limitClause}${offsetClause};`.trim();
  return selectQuery;
};

export default generateSelectCount;
