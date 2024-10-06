import { datatypes } from "./datatypes";
import { Op } from "./operations";

export const checkModelType = (model) => {
  const invalidTypes = Object.entries(model.attributes).filter(
    ([attributeName, attribute]) =>
      !(
        attribute.hasOwnProperty("type") &&
        Object.values(datatypes).includes(attribute.type)
      )
  );

  if (invalidTypes.length > 0) {
    throw new Error(
      `Invalid types in ${model.modelName}: ${invalidTypes
        .map(
          ([attributeName, attribute]) => `${attributeName}: ${attribute.type}`
        )
        .join(", ")}`
    );
  }
};

export const checkDataKeys = (model, data) => {
  const dataAttributes = Object.keys(data);
  const modelAttributes = Object.keys(model.attributes);

  const hasValidKeys = dataAttributes.every((attribute) =>
    modelAttributes.includes(attribute)
  );

  if (!hasValidKeys) {
    throw new Error(
      `Invalid keys in ${model.modelName} data: ${dataAttributes
        .filter((attribute) => !modelAttributes.includes(attribute))
        .join(", ")}`
    );
  }
};

export const generateWhereClause = (modelName, where) => {
  if (!where || Object.keys(where).length === 0) return "";

  const buildCondition = ([key, condition]) => {
    if (Array.isArray(condition)) {
      const values = condition.map((v) => `'${v}'`).join(", ");
      return `'${modelName}'.'${key}' ${Op.IN} (${values})`;
    }

    if (typeof condition === "object" && condition !== null) {
      const clauses = Object.entries(condition).map(([op, value]) => {
        if (Array.isArray(value)) {
          const values = value.map((v) => `'${v}'`).join(", ");
          return `'${modelName}'.'${key}' ${op} (${values})`;
        }

        return `'${modelName}'.'${key}' ${op} '${value}'`;
      });
      return clauses.join(" AND ");
    }

    return `'${modelName}'.'${key}' ${Op.EQ} '${condition}'`;
  };

  const buildClause = (where) => {
    return Object.entries(where)
      .map(([key, value]) => {
        if (key === Op.OR || key === Op.AND) {
          const subConditions = value
            .map((subWhere) => `${buildClause(subWhere)}`)
            .join(` ${key} `);
          return `(${subConditions})`;
        } else {
          return buildCondition([key, value]);
        }
      })
      .join(` ${Op.AND} `);
  };

  return ` WHERE ${buildClause(where)}`;
};

export const generateLimitClause = (limit) => (limit ? ` LIMIT ${limit}` : "");
export const generateOffsetClause = (offset) =>
  offset ? ` OFFSET ${offset}` : "";

export const generateOrderByClause = (model, order) => {
  return order
    ? ` ORDER BY ${order
        .map(([col, dir]) => `'${model}'.'${col}' '${dir}'`)
        .join(", ")}`
    : "";
};

export const generateIncludeClause = (modelName, include = []) => {
  if (include.length === 0) return "";

  return include
    .map((joinObj) => {
      const { model, on, type = "INNER" } = joinObj;
      const [leftCol, rightCol] = on;
      return `${type.toUpperCase()} JOIN ${model} ON '${modelName}'.'${leftCol}' = '${model}'.'${rightCol}'`;
    })
    .join(" ");
};

export function buildModelTree(models) {
  const lookup = {};
  const allChildren = new Set();
  const tree = [];

  models.forEach((model) => {
    lookup[model.modelName] = { name: model.modelName, children: [] };
  });

  models.forEach((model) => {
    const { belongsTo } = model.associations;
    if (belongsTo) {
      belongsTo.forEach((element) => {
        const child = lookup[element.target];
        if (child) {
          lookup[model.modelName].children.push(child);
          allChildren.add(child.name);
        }
      });
    }

    tree.push(lookup[model.modelName]);
  });

  if (tree.some((node) => hasCycle(node))) {
    throw new Error("Cyclical associations detected");
  }

  return tree.filter((node) => !allChildren.has(node.name));
}

function hasCycle(node, visited = new Set()) {
  if (visited.has(node.name)) {
    return true;
  }

  visited.add(node.name);

  for (const child of node.children) {
    if (hasCycle(child, visited)) {
      return true;
    }
  }

  visited.delete(node.name);
  return false;
}
