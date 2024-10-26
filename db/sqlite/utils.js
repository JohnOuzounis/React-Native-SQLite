import { Op } from "./operations";

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
        .map(([col, dir]) => `'${model}'.'${col}' ${dir}`)
        .join(", ")}`
    : "";
};

export const generateGroupByClause = (model, group) => {
  return group
    ? ` GROUP BY ${group.map((col) => `'${model}'.'${col}'`).join(", ")}`
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

export const getConflictColumns = (attributes) =>
  Object.keys(attributes).filter(
    (attr) => attributes[attr].primaryKey || attributes[attr].unique
  );

export const generateConflictClause = (conflictColumns) => {
  const conflictClause =
    conflictColumns && conflictColumns.length > 0
      ? ` ON CONFLICT(${conflictColumns.join(", ")})`
      : "";

  return conflictClause;
};
