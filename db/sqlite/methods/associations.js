const getForeignKeyName = (model, options, sqlite) => {
  return (
    options.foreignKey || {
      name: `${model.modelName.toLowerCase()}Id`,
      type: sqlite.datatypes.INTEGER,
    }
  );
};

const belongsTo = (params) => {
  const { model, args, sqlite } = params;
  const [target, options = {}] = args;
  const targetModel = sqlite.models[target];

  const foreignKey = getForeignKeyName(targetModel, options, sqlite);
  const [referenceKey] = Object.entries(targetModel.attributes).find(
    ([, attribute]) => attribute.primaryKey === true
  ) || ["id"];

  const attributes = {
    ...model.attributes,
    [foreignKey.name]: {
      type: foreignKey.type,
    },
  };

  model.attributes = Object.freeze(attributes);
  model.associations = model.associations || {};
  model.associations.belongsTo = model.associations.belongsTo || [];

  model.associations.belongsTo.push({
    target: targetModel.modelName,
    foreignKey: foreignKey.name,
    referenceKey,
    onDelete: options.onDelete || "SET NULL",
    onUpdate: "CASCADE",
  });
};

const belongsToMany = (params) => {
  const { model, args, sqlite } = params;
  const [target, options = {}] = args;
  const targetModel = sqlite.models[target];

  const joinTable =
    options.through || `${model.modelName}_${targetModel.modelName}`;

  const sourceKey = Object.entries(model.attributes).find(
    ([, attribute]) => attribute.primaryKey === true
  );

  const targetKey = Object.entries(targetModel.attributes).find(
    ([, attribute]) => attribute.primaryKey === true
  );

  const [sourceKeyName, sourceKeyConfig] = sourceKey || [
    `${model.modelName.toLowerCase()}Id`,
    { type: sqlite.datatypes.INTEGER },
  ];
  const [targetKeyName, targetKeyConfig] = targetKey || [
    `${targetModel.modelName.toLowerCase()}Id`,
    { type: sqlite.datatypes.INTEGER },
  ];

  sqlite.define(joinTable, {
    [sourceKeyName]: {
      type: sourceKeyConfig.type,
    },
    [targetKeyName]: {
      type: targetKeyConfig.type,
    },
    ...options.attributes,
  });

  model.associations = model.associations || {};
  model.associations.belongsToMany = model.associations.belongsToMany || [];

  targetModel.associations = targetModel.associations || {};
  targetModel.associations.belongsToMany =
    targetModel.associations.belongsToMany || [];

  model.associations.belongsToMany.push({
    target: targetModel.modelName,
    through: joinTable,
    sourceKey: sourceKeyName,
    foreignKey: targetKeyName,
  });

  targetModel.associations.belongsToMany.push({
    target: model.modelName,
    through: joinTable,
    sourceKey: targetKeyName,
    foreignKey: sourceKeyName,
  });

  sqlite.models[joinTable].associations.belongsTo =
    sqlite.models[joinTable].associations.belongsTo || [];

  const [sourceReferenceKey] = sourceKey ?? ["id"];
  sqlite.models[joinTable].associations.belongsTo.push({
    target: model.modelName,
    foreignKey: sourceKeyName,
    referenceKey: sourceReferenceKey,
    onDelete: options.onDelete || "SET NULL",
    onUpdate: "CASCADE",
  });

  const [targetReferenceKey] = targetKey ?? ["id"];
  sqlite.models[joinTable].associations.belongsTo.push({
    target: targetModel.modelName,
    foreignKey: targetKeyName,
    referenceKey: targetReferenceKey,
    onDelete: options.onDelete || "SET NULL",
    onUpdate: "CASCADE",
  });
};

export default { belongsTo, belongsToMany };
