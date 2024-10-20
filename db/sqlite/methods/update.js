import builder from "../queryBuilder";

const update = async (params) => {
  const { model, data, options, sqlite } = params;
  const updateQuery = builder.update(model, data, options);
  console.log(updateQuery);

  await sqlite.instance.execAsync(`${updateQuery}`);
};

const upsert = async (params) => {
  const { model, data, options } = params;
  const upsertQuery = builder.upsert(model, data, options);
  console.log(upsertQuery);

  await sqlite.instance.execAsync(`${upsertQuery}`);
};

export default { update, upsert };
