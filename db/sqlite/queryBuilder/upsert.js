import {
  generateWhereClause,
  getConflictColumns,
  generateConflictClause,
} from "../utils";
import generateInsert from "./insert";

const generateUpsert = (model, data, options) => {
  const { where } = options;
  const { attributes } = model;

  const conflictColumns = getConflictColumns(attributes);
  const updateValues = Object.keys(data)
    .map((key) => `${key} = EXCLUDED.${key}`)
    .join(", ");

  const insertQuery = generateInsert(model, data).replace(/;$/, "");
  const conflictClause = generateConflictClause(conflictColumns);
  const whereClause = generateWhereClause(where);

  const upsertQuery = `${insertQuery}${conflictClause} DO UPDATE SET ${updateValues}${whereClause};`;

  return upsertQuery;
};

export default generateUpsert;
