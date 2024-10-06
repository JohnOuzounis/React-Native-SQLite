import { checkDataKeys, checkModelType } from "../utils";

const generateInsert = (model, data) => {
  checkModelType(model);
  checkDataKeys(model, data);

  const columns = Object.keys(data).join(", ");

  const values = Object.values(data)
    .map((value) => {
      if (typeof value === "string") {
        return `'${value.replace(/'/g, "''")}'`;
      }
      return value;
    })
    .join(", ");

  const insertQuery = `INSERT INTO ${model.modelName} (${columns}) VALUES (${values});`;
  return insertQuery;
};

export default generateInsert;
