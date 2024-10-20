import builder from "../queryBuilder";

const count = async (params) => {
  const { model, options, sqlite } = params;
  const { where, as = "count" } = options;

  const countQuery = builder.count(model.modelName, where, as);
  const result = await sqlite.instance.getAsync(countQuery);

  return result?.[as] || 0;
};

export default { count };
