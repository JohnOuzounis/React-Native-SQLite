import builder from "../queryBuilder";

const update = async (params) => {
  const { model, data, options, sqlite } = params;
  const updateQuery = builder.update(model, data, options);
  console.log(updateQuery);

  await sqlite.instance.execAsync(`${updateQuery}`);
};

const upsert = (params) => {
  const { model, data, options } = params;
};

export default { update, upsert };
