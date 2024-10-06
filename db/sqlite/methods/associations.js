const getForeignKeyName = (model, options, sqlite) => {
  return (
    options.foreignKey || {
      name: `${model.modelName.toLowerCase()}Id`,
      type: sqlite.datatypes.INTEGER,
    }
  );
};

const belongsTo = (params) => {
  const { model, target, options = {}, sqlite } = params;
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
  const { model, targetModel, options = {}, sqlite } = params;
  targetModel = sqlite.models[targetModel];

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
  });

  model.associations = model.associations || {};
  targetModel.associations = targetModel.associations || {};

  model.associations.belongsToMany = {
    target: targetModel.modelName,
    through: joinTable,
    sourceKey: sourceKeyName,
    foreignKey: targetKeyName,
  };

  targetModel.associations.belongsToMany = {
    target: model.modelName,
    through: joinTable,
    sourceKey: targetKeyName,
    foreignKey: sourceKeyName,
  };
};

export default { belongsTo, belongsToMany };
