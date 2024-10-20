const queryBuilder = {
  create: require("./create").default,
  insert: require("./insert").default,
  select: require("./select").default,
  update: require("./update").default,
  upsert: require("./upsert").default,
  delete: require("./delete").default,
  drop: require("./drop").default,
};

export default queryBuilder;
