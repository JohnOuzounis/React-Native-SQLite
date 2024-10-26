import { datatypes } from "../datatypes";

const rules = {
  primaryKey: () => " PRIMARY KEY",
  autoIncrement: (attribute) =>
    attribute.type === datatypes.INTEGER ? " AUTOINCREMENT" : "",
  allowNull: (attribute) => (attribute.allowNull === false ? " NOT NULL" : ""),
  unique: () => " UNIQUE",
  check: (attribute, name) =>
    Array.isArray(attribute.check)
      ? ` CHECK (${name} IN (${attribute.check
          .map((att) => `'${att}'`)
          .join(", ")}))`
      : "",
  defaultValue: (attribute) =>
    attribute.defaultValue !== undefined
      ? ` DEFAULT '${attribute.defaultValue}'`
      : "",
};

const createColumns = (model) => {
  const columns = [];
  const { attributes } = model;

  if (
    !attributes.hasOwnProperty("id") &&
    !Object.entries(attributes).find(([, config]) => config.primaryKey)
  ) {
    columns.push("id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL");
  }

  for (const [attributeName, attributeConfig] of Object.entries(attributes)) {
    let columnDefinition = `${attributeName} ${attributeConfig.type}`;

    for (const key of Object.keys(attributeConfig)) {
      columnDefinition += rules[key]?.(attributeConfig, attributeName) ?? "";
    }

    columns.push(columnDefinition);
  }

  return columns;
};

const createConstraints = (model) => {
  const constraints = [];

  const { associations } = model;
  if (!associations || !associations.belongsTo) return constraints;

  associations.belongsTo.forEach((element) => {
    const { foreignKey, target, referenceKey, onDelete, onUpdate } = element;

    const constraint = `FOREIGN KEY (${foreignKey}) REFERENCES ${target}(${referenceKey}) ON DELETE ${onDelete} ON UPDATE ${onUpdate}`;
    constraints.push(constraint);
  });

  return constraints;
};

const generateCreate = (model, sqlite) => {
  const columns = createColumns(model);
  const constraints = createConstraints(model);

  const createQuery = `CREATE TABLE IF NOT EXISTS ${model.modelName} (${[
    ...columns,
    ...constraints,
  ].join(", ")});`;

  return createQuery;
};

export default generateCreate;
