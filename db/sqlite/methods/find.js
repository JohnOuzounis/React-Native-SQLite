import builder from "../queryBuilder";

const findAll = async (params) => {
  const { model, args, sqlite } = params;
  const [options = {}] = args;
  const selectQuery = builder.select(model, options);
  console.log(selectQuery);

  return await sqlite.instance.getAllAsync(`${selectQuery}`);
};

const findByPk = async (params) => {
  const { model, args } = params;
  const [pk, options = {}] = args;

  const [sourceKey] = Object.entries(model.attributes).find(
    ([, attribute]) => attribute.primaryKey === true
  ) || ["id"];

  options.where = {
    [sourceKey]: pk,
  };
  const selectQuery = builder.select(model, options);
  console.log(selectQuery);

  return await sqlite.instance.getAllAsync(`${selectQuery}`);
};

const findOne = async (params) => {
  const { model, args, sqlite } = params;
  const [options = {}] = args;
  const selectQuery = builder.select(model, { ...options, limit: 1 });
  console.log(selectQuery);

  return await sqlite.instance.getAllAsync(`${selectQuery}`);
};

const findAndCountAll = async (params) => {
  const { model, args, sqlite } = params;
  const [options = {}] = args;
  const query = builder.selectCount(model, options);
  console.log(query);

  return await sqlite.instance.getAllAsync(`${query}`);
};

export default { findAll, findByPk, findOne, findAndCountAll };
