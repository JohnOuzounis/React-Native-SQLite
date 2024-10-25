import builder from "../queryBuilder";

const count = async (params) => {
  const { model, args, sqlite } = params;
  const [options = {}] = args;
  const { where, as = "count", groupBy } = options;

  const countQuery = builder.count(model.modelName, where, as, groupBy);
  const result = await sqlite.instance?.getAllAsync(countQuery);
  console.log(result, countQuery);

  return result?.[0][as] || 0;
};

export default { count };
