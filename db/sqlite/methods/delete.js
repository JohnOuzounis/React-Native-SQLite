import builder from "../queryBuilder";

const destroy = async (params) => {
  const { model, options, sqlite } = params;
  const deleteQuery = builder.delete(model, options);
  console.log(deleteQuery);

  await sqlite.instance.execAsync(`${deleteQuery}`);
};

const drop = async (params) => {
  const { model, sqlite } = params;
  const dropQuery = builder.drop(model);
  console.log(dropQuery);

  await sqlite.instance.execAsync(`${dropQuery}`);
};

export default { destroy, drop };
