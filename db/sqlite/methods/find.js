import builder from "../queryBuilder";

const findAll = async (params) => {
  const { model, options = {}, sqlite } = params;
  const selectQuery = builder.select(model, options);
  console.log(selectQuery);

  return await sqlite.instance.getAllAsync(`${selectQuery}`);
};

const findByPk = async (params) => {
  const { model, pk } = params;

  const [sourceKey] = Object.entries(model.attributes).find(
    ([, attribute]) => attribute.primaryKey === true
  ) || ["id"];

  const where = {
    [sourceKey]: pk,
  };

  return await findAll({ ...params, options: { where } });
};

const findOne = async (params) => {
  const { model, options = {}, sqlite } = params;
  const selectQuery = builder.select(model, { ...options, limit: 1 });
  console.log(selectQuery);

  return await sqlite.instance.getAllAsync(`${selectQuery}`);
};

export default { findAll, findByPk, findOne };
