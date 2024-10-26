import { generateWhereClause } from "../utils";

export const generateUpdate = (model, data, options) => {
  const { where } = options;

  const whereClause = generateWhereClause(model.modelName, where);
  const columns = Object.entries(data)
    .map(([name, value]) => {
      if (typeof value === "string") {
        return `${name} = '${value.replace(/'/g, "''")}'`;
      }
      return `${name} = ${value}`;
    })
    .join(", ");

  const updateQuery = `UPDATE ${model.modelName} SET ${columns}${whereClause};`;
  return updateQuery;
};

export default generateUpdate;
