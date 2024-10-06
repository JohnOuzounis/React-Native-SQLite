const methodsObjs = [
  require("./create").default,
  require("./delete").default,
  require("./find").default,
  require("./basic").default,
  require("./update").default,
  require("./associations").default,
];

export default {
  addMethods: (model, sqlite) => {
    methodsObjs.forEach((methods) => {
      Object.entries(methods).forEach(([name, func]) => {
        model[name] = async function (params = {}) {
          params.sqlite = sqlite;
          params.model = model;
          return await func(params);
        };
      });
    });
  },
};
