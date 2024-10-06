const generateDrop = (model) => {
  const dropQuery = `DROP TABLE IF EXISTS ${model.modelName};`;
  return dropQuery;
};

export default generateDrop;
