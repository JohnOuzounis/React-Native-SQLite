import builder from "../queryBuilder/index";

async function init(params) {
  const { model, sqlite } = params;
  const createQuery = builder.create(model, sqlite);
  console.log(createQuery);

  await sqlite.instance.execAsync(`${createQuery}`);
}

async function create(params) {
  const { model, data = {}, sqlite } = params;
  const insertQuery = builder.insert(model, data);
  console.log(insertQuery);

  await sqlite.instance.execAsync(`${insertQuery}`);
}

async function bulkCreate(params) {
  const { model, data = [], sqlite } = params;
  const insertQuery = data
    .map((entry) => builder.insert(model, entry))
    .join(" ");
  console.log(insertQuery);

  await sqlite.instance.withExclusiveTransactionAsync(async () => {
    await sqlite.instance.execAsync(`${insertQuery}`);
  });
}

export default { init, create, bulkCreate };
